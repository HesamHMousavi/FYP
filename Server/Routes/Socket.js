const express = require("express");
const server = express();
const crypto = require("crypto");
const http = require("http").Server(server);
const ChatModel = require("../Models/ChatModel");
const UserModel = require("../Models/UserModel");
const TaskModel = require("../Models/TaskModel");
const cron = require("node-cron");
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const randomId = () => crypto.randomBytes(8).toString("hex");

io.use(async (socket, next) => {
  socket.userID = socket.handshake.auth.userID;
  socket.Username = socket.handshake.auth.Username;
  socket.lat = socket.handshake.auth.lat || null; 
  socket.lon = socket.handshake.auth.long || null;
  next();
});

const SetConnect = async (Username, connect = true) => {
  try {
    if (!Username) return;
    await UserModel.findOneAndUpdate({ Username }, { Connected: connect });
  } catch (error) {
    console.log(error);
    return { message: error.message, type: "error" };
  }
};

const scheduledTasks = new Map();
const initializeScheduledTasks = async () => {
  const tasks = await TaskModel.find({ status: "scheduled" });
  tasks.forEach((task) => {
    const cornTask = cron.schedule(task.cornExpression, async () => {
      io.to(task.receiverID).emit("private-message", {
        message: task.message,
        sender: task.sender,
        timestamp: new Date(),
        isDeleted: false,
      });
    });
    scheduledTasks.set(task.taskId, cornTask);
  });
}; 

initializeScheduledTasks();

io.on("connection", async (socket) => {
  // THIS IS SO USER CAN RECEIVE MESSAGES
  socket.join(socket.userID);

  // ON CONNECT - SET CONNECT: TRUE
  await SetConnect(socket.Username);

  // GET USER FRIENDS AND INFORM THEM
  const user = await UserModel.findById(socket.userID);
  if (user) {
    user.Friends.forEach((friend) => {
      socket.to(friend.id).emit("user-connected", {
        username: user.Username,
        id: user._id,
        latitude: socket.lat,
        longitude: socket.lon,
      });
    });
  }

  // ON PRIVATE MESSAGE
  socket.on(
    "private-message",
    async ({ username, message, userID, timestamp, receiver, replyTo }) => {
      const messageID = randomId();
      socket.to(userID).emit("private-message", {
        message,
        sender: username,
        timestamp,
        messageID,

        isDeleted: false,
      });
      await ChatModel.findOneAndUpdate(
        {
          $and: [
            { Users: { $elemMatch: { Username: username } } },
            { Users: { $elemMatch: { Username: receiver } } },
          ],
        },
        {
          $push: {
            Chat: {
              timestamp,
              from: username,
              to: receiver,
              message,
              messageID,
              isDeleted: false,
            },
          },
        }
      );
    }
  );

  // ON TYPING
  socket.on("typing", async ({ username, userID, typing }) => {
    socket.to(userID).emit("typing", {
      username,
      userID,
      typing,
    });
  });

  // ON DISCONNECT - SET CONNECT:FALSE
  socket.on("disconnect", async (reason) => {
    // await UserModel.findOneAndUpdate({Username:socket.Username})
    await SetConnect(socket.Username, false);
    if (user) {
      user.Friends.forEach((friend) => {
        socket
          .to(friend.id)
          .emit("user-disconnected", { username: user.Username, id: user._id });
      });
    }
  });

  // ON MESSAGE -- WHEN USER IS NOT CONNECTED
  socket.on("save-MessageQueue", async ({ MessageQueue }) => {
    await UserModel.findOneAndUpdate(
      { Username: socket.Username },
      { MessageQueue }
    );
  });

  // ON SCHEDULE -- MESSAGE
  socket.on(
    "schedule-message",
    async ({ username, message, userID, receiver, cornEx }) => {
      const messageID = randomId();
      const taskId = randomId();
      const receiverModel = await UserModel.findOne({
        Username: receiver,
      }).select("_id");
      try {
        // Save the task in the database
        const scheduledTask = new TaskModel({
          taskId,
          sender: username,
          receiver,
          receiverID: receiverModel._id,
          message,
          cornExpression: cornEx,
        });
        await scheduledTask.save();

        const task = cron.schedule(cornEx, async () => {
          socket.to(userID).emit("private-message", {
            message,
            sender: username,
            timestamp: new Date(),
            messageID,
          });
          await ChatModel.findOneAndUpdate(
            {
              Users: { $all: [receiver, username] },
            },
            {
              $push: {
                Chat: {
                  timestamp: new Date(),
                  from: username,
                  to: receiver,
                  message,
                  messageID,
                  isDeleted: false,
                },
              },
            }
          );
          await TaskModel.findOneAndDelete({ taskId });
          socket.emit("scheduled-message-sent", {
            taskId,
            receiver,
            username,
            message,
          });
        });

        // Add the cron task to the scheduledTasks map
        scheduledTasks.set(taskId, task);
      } catch (error) {
        console.log(error.message);
      }
    }
  );

  // Listen for the update-message event
  socket.on("update-message", async ({ message, cornEx, taskId }) => {
    try {
      // Find and update the task in the database
      const task = await TaskModel.findOne({ taskId });
      if (!task) return;

      // Update the message and/or cron expression in the database
      if (message) task.message = message;
      if (cornEx) task.cornExpression = cornEx;
      await task.save();

      // Stop the existing cron job if it exists
      const existingTask = scheduledTasks.get(taskId);
      if (existingTask) existingTask.stop();

      // Create and schedule a new cron job with the updated data
      const updatedTask = cron.schedule(task.cornExpression, async () => {
        socket.to(task.receiverID).emit("private-message", {
          message: task.message,
          sender: task.sender,
          timestamp: new Date(),
          isDeleted: false,
        });
        await ChatModel.findOneAndUpdate(
          {
            Users: { $all: [task.receiver, task.sender] },
          },
          {
            $push: {
              Chat: {
                timestamp: new Date(),
                from: task.sender,
                to: task.receiver,
                message: task.message,
                messageID: randomId(),
                isDeleted: false,
              },
            },
          }
        );
        await TaskModel.findOneAndDelete({ taskId });
        socket.emit("scheduled-message-sent", {
          taskId,
          receiver: task.receiver,
          username: task.sender,
          message: task.message,
        });
      });

      // Update the scheduledTasks map with the modified cron job
      scheduledTasks.set(taskId, updatedTask);
    } catch (error) {
      console.log(error);
    }
  });

  // Listen for a cancel event to stop a specific task
  socket.on("cancel-task", async ({ taskId }) => {
    try {
      // Stop and remove the task from the cron job map
      const task = scheduledTasks.get(taskId);
      if (task) {
        task.stop(); // Stop the cron job
        scheduledTasks.delete(taskId); // Remove from the map
      } else return;

      // Remove the task from the database
      await TaskModel.findOneAndDelete({ taskId });
    } catch (error) {
      console.log(error);
    }
  });

  // ON REQUEST RESPONSE
  socket.on("request-response", ({ sender, username, userID, Accept }) => {
    socket
      .to(userID)
      .emit("request-response", { sender, username, userID, Accept });
  });

  // ON FRIEND REQUEST NOTIFICATION
  socket.on("request-notification", async ({ Username }) => {
    try {
      const user = await UserModel.findOne({ Username }).select("Connected");
      if (user) {
        //CHECK IF USER IS CONNECTED; SEND NOTIFICATION
        if (user.Connected) {
          socket
            .to(user._id.toString())
            .emit("request-notification", { Username });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  });

  socket.on("share-location", async ({ lan, lon }) => {
    try {
      const user = await UserModel.findOne({
        Username: socket.Username,
      }).select("Friends");

      if (user) {
        user.Friends.forEach((friend) => {
          io.to(friend.id).emit("pass-location", {
            Username: socket.Username,
            lan,
            lon,
          });
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
});

module.exports = { http, server };
