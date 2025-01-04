const express = require("express");
const router = express.Router();
const ChatModel = require("../Models/ChatModel");
const UserAuthentication = require("../Middleware/UserAuthentication");
const TaskModel = require("../Models/TaskModel");
router.use(express.json());

router.post("/", UserAuthentication, async (req, res) => {
  try {
    const { myUsername, username } = req.body;
    const chat = await ChatModel.findOne({
      $and: [
        { Users: { $elemMatch: { Username: myUsername } } },
        { Users: { $elemMatch: { Username: username } } },
      ],
    });
    res.json({ data: chat, type: "success" });
  } catch (error) {
    res.json({ message: error.message, type: "error" });
  }
});

router.put("/clear-chat", UserAuthentication, async (req, res) => {
  const { myUsername, username } = req.body;
  try {
    await ChatModel.findOneAndUpdate(
      {
        Users: { $all: [myUsername, username] },
      },
      {
        Chat: [],
      }
    );
    res.status(200).json({ message: "Chat Cleared", type: "success" });
  } catch (error) {
    res.status(500).json({ message: error.message, type: "error" });
  }
});

router.post("/get-tasks", async (req, res) => {
  try {
    const { sender, receiver } = req.body;
    if (!sender || !receiver)
      return res.json({ msg: "Missing Information", type: "error" });
    const task = await TaskModel.find({ sender, receiver });
    res.json({ data: task, type: "success" });
  } catch (error) {
    res.json({ msg: error.message, type: error });
  }
});

// router.post

module.exports = router;
