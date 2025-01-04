// Import Modules
const express = require("express");
const Router = express.Router();
const UserModel = require("../Models/UserModel");
const { FriendShipSchema, RequestSchema } = require("../Schemas/Friends");
const UserAuthentication = require("../Middleware/UserAuthentication");
const ChatModel = require("../Models/ChatModel");
const CryptoJS = require("crypto-js");
const forge = require("node-forge");

// GET - Friends
Router.get("/", UserAuthentication, async (req, res) => {
  try {
    // get friends ids
    const user = await UserModel.findById(req.header("userID"));

    // Check if user has friends
    if (!user.Friends) return;

    // Set the friendID to the friend object
    for (let i = 0; i < user.Friends.length; i++) {
      user.Friends[i] = user.Friends[i].id;
    }
    const friends = await UserModel.find({ _id: { $in: user.Friends } })
      .select("Username")
      .select("Email");
    const newFriends = [];
    friends.forEach(async (friend) => {
      const item = await UserModel.find({ Username: friend.Username });
      friend.ImageData = item.ImageData;
      friend.ImageContentType = item.ImageContentType;
      friend.isConnected = item.Connected;
      newFriends.push(friend);
    });

    res.status(200).json({ Friends: friends, type: "success" });
  } catch (error) {
    res.status(500).json({ msg: error.message, type: "error" });
  }
});

Router.get("/requests", UserAuthentication, async (req, res) => {
  try {
    // get friends ids
    const Friends = await UserModel.findById(req.header("userID")).select(
      "Requested_Friends"
    );

    // Check if user has friends
    if (!Friends)
      return res.json({ msg: "No Friend requests found", type: "error" });

    res
      .status(200)
      .json({ Friends: Friends.Requested_Friends, type: "success" });
  } catch (error) {
    res.status(500).json({ msg: error.message, type: "error" });
  }
});

// POST Create Friendship ~
Router.post("/", UserAuthentication, async (req, res) => {
  // Destruct User from request body
  let { Username, TimeStamp } = req.body;
  // Validate syntax and check user object exists
  const error = Validate({ Username }, FriendShipSchema);

  if (error.type === "error")
    return res.json({ msg: error.msg, type: error.type });

  try {
    // set username to lower case
    Username = Username.toLowerCase();
    // find user based on username
    const user = await UserModel.findOne({
      Username: Username,
    })
      .select("_id")
      .select("Username")
      .select("Requested_Friends");

    // if user does not exist: return error message
    if (!user)
      return res.status(404).json({ msg: "User not found", type: "error" });

    // Check request is not for the current user
    if (user._id.toString() === req.header("userID").toString())
      return res
        .status(404)
        .json({ msg: "This request can't be completed", type: "error" });
    // Check if friend request is already sent
    let IsRequested = false;
    const myUser = await UserModel.findById(req.header("userID")).select(
      "Username"
    );
    user.Requested_Friends.forEach((Friend) => {
      // If request exits return error message
      if (Friend.id === req.header("userID")) IsRequested = true;
    });
    if (IsRequested)
      return res.status(404).json({
        message: "Friend Request Already Sent to this user",
        type: "error",
      });
    // Create friendship
    // Update user who SENT request
    await UserModel.findByIdAndUpdate(req.header("userID"), {
      $push: {
        Requested_Friends: {
          id: user._id.toString(),
          Username: user.Username,
          DidYouSend: true,
          TimeStamp,
        },
      },
    });

    // Update user who RECEIVED request
    await UserModel.findByIdAndUpdate(user._id, {
      $push: {
        Requested_Friends: {
          id: req.header("userID"),
          Username: myUser.Username,
          DidYouSend: false,
          TimeStamp,
        },
      },
    });

    // Send success response
    res.status(200).json({
      msg: "Friend Request Sent",
      type: "success",
    });
  } catch (error) {
    res.status(500).json({ msg: error.message, type: "error" });
  }
});

// PUT Accept / Reject Friendship ~
Router.put("/", UserAuthentication, async (req, res) => {
  // Check if user has any friends
  try {
    const myUser = await UserModel.findById(req.header("userID"));
    if (myUser.Requested_Friends <= 0)
      return res
        .status(404)
        .json({ msg: "This request can't be completed", type: "error" });
    // Destruct User from request body
    let { Username, Accept, Cancel } = req.body;
    // Validate syntax and check user object exists
    const error = Validate({ Username, Accept }, RequestSchema);
    if (error.type === "error")
      return res.status(400).json({ msg: error.message, type: error.type });
    // Convert username to lower case

    // Check if the user exists based on username
    const user = await UserModel.findOne({ Username: Username })
      .select("_id")
      .select("Username")
      .select("PublicEncryptionKey")
      .select("Requested_Friends");

    // Return error if user does not exist
    if (!user)
      return res.status(404).json({ msg: "User not found", type: "error" });

    Username = Username.toLowerCase();

    let IsUser2FoundFriend = false;
    let IsUser1Request = false;

    // SENDER - ACCEPTING OR REJECTING
    myUser.Requested_Friends.forEach((friend) => {
      if (Cancel) {
        if (friend.id === user._id.toString() && friend.DidYouSend) {
          IsUser2FoundFriend = true;
          return;
        }
      } else {
        if (friend.id === user._id.toString() && !friend.DidYouSend) {
          IsUser2FoundFriend = true;
          return;
        }
      }
    });

    // RECIPIENT
    user.Requested_Friends.forEach((friend) => {
      if (Cancel) {
        if (friend.id === req.header("userID") && !friend.DidYouSend)
          IsUser1Request = true;
      } else {
        if (friend.id === req.header("userID") && friend.DidYouSend)
          IsUser1Request = true;
      }
    });

    // Return error message if match not found
    if (!IsUser2FoundFriend || !IsUser1Request)
      return res
        .status(404)
        .json({ msg: "This request can't be completed", type: "error" });

    // Filter Object
    const Filter1 = Accept
      ? {
          $pull: {
            Requested_Friends: { id: user._id.toString(), DidYouSend: false },
          },
          $push: {
            Friends: { id: user._id.toString(), Username: Username },
          },
        }
      : {
          $pull: {
            Requested_Friends: { id: user._id.toString() },
          },
        };
    const Filter2 = Accept
      ? {
          $pull: {
            Requested_Friends: { id: req.header("userID").toString() },
          },
          $push: {
            Friends: {
              id: req.header("userID").toString(),
              Username: myUser.Username,
            },
          },
        }
      : {
          $pull: {
            Requested_Friends: { id: req.header("userID").toString() },
          },
        };

    // Update user who SENT request
    await UserModel.findByIdAndUpdate(req.header("userID"), Filter1);
    // Update user who RECEIVED request
    await UserModel.findByIdAndUpdate(user._id, Filter2);
    if (Accept) {
      const chatFound = await ChatModel.findOne({
        $and: [
          { Users: { $elemMatch: { Username: Username } } },
          { Users: { $elemMatch: { Username: myUser.Username } } },
        ],
      });
      if (!chatFound) {
        const aesKey = generateSymmetricKey();
        const EncryptedSymmetricKey1 = EncryptSymmetricKey(
          aesKey,
          myUser.PublicEncryptionKey
        );

        // create symmetric key for user_2
        const EncryptedSymmetricKey2 = EncryptSymmetricKey(
          aesKey,
          user.PublicEncryptionKey
        );
        const newChat = new ChatModel({
          Users: [
            {
              Username: myUser.Username,
              EncryptedSymmetricKey: EncryptedSymmetricKey1,
            },
            {
              Username: user.Username,
              EncryptedSymmetricKey: EncryptedSymmetricKey2,
            },
          ],
        });

        await newChat.save();
      }
    }
    // Send response message
    res.status(200).json({
      msg: Accept ? "Friend Request Accepted" : "Friend Request Rejected",
      type: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message, type: "error" });
  }
});

// Cancel Friendship ~
Router.put("/cancel", UserAuthentication, async (req, res) => {
  try {
    const { Username } = req.body;
    if (!Username) return res.json({ msg: "Username missing", type: "error" });
    const myUser = await UserModel.findById(req.header("userID"))
      .select("_id")
      .select("Username")
      .select("Requested_Friends");
    const user = await UserModel.findOne({ Username })
      .select("_id")
      .select("Username")
      .select("Requested_Friends");

    if (!user) return res.json({ msg: "User not found", type: "error" });

    let IsUser2FoundFriend = false;
    let IsUser1Request = false;

    // SENDER - ACCEPTING OR REJECTING
    myUser.Requested_Friends.forEach((friend) => {
      if (friend.id === user._id.toString() && friend.DidYouSend) {
        IsUser2FoundFriend = true;
        return;
      }
    });

    user.Requested_Friends.forEach((friend) => {
      if (friend.id === req.header("userID") && !friend.DidYouSend)
        IsUser1Request = true;
    });

    if (!IsUser2FoundFriend || !IsUser1Request)
      return res
        .status(404)
        .json({ message: "This request can't be completed", type: "error" });

    // Filter Object
    const Filter1 = {
      $pull: {
        Requested_Friends: { id: user._id.toString() },
      },
    };
    const Filter2 = {
      $pull: {
        Requested_Friends: { id: req.header("userID").toString() },
      },
    };

    // Update user who SENT request
    await UserModel.findByIdAndUpdate(req.header("userID"), Filter1);
    // Update user who RECEIVED request
    await UserModel.findByIdAndUpdate(user._id, Filter2);
    res.json({ msg: "Friend request canceled", type: "error" });
  } catch (error) {
    res.json({ msg: error.message, type: "error" });
  }
});

// PUT Delete Friendship
Router.put("/delete", UserAuthentication, async (req, res) => {
  try {
    const { Username } = req.body;
    if (!Username) return res.json({ msg: "Username missing", type: "error" });
    const myUser = await UserModel.findById(req.header("userID"))
      .select("_id")
      .select("Friends");
    const user = await UserModel.findOne({ Username })
      .select("_id")
      .select("Friends");

    if (!user) return res.json({ msg: "User not found", type: "error" });

    let IsUser2FoundFriend = false;
    let IsUser1Request = false;

    // SENDER - ACCEPTING OR REJECTING
    myUser.Friends.forEach((friend) => {
      if (friend.id === user._id.toString()) {
        IsUser2FoundFriend = true;
        return;
      }
    });

    user.Friends.forEach((friend) => {
      if (friend.id === req.header("userID")) {
        IsUser1Request = true;
        return;
      }
    });

    if (!IsUser2FoundFriend || !IsUser1Request)
      return res
        .status(404)
        .json({ message: "This request can't be completed", type: "error" });

    // Update user who SENT request
    await UserModel.findByIdAndUpdate(req.header("userID"), {
      $pull: {
        Friends: { id: user._id.toString() },
      },
    });
    // Update user who RECEIVED request
    await UserModel.findByIdAndUpdate(user._id, {
      $pull: {
        Friends: { id: req.header("userID").toString() },
      },
    });
    res.json({ msg: "Friend removed", type: "error" });
  } catch (error) {
    res.json({ msg: error.message, type: "error" });
  }
});

Router.get("/get-friend-req-count", UserAuthentication, async (req, res) => {
  try {
    const user = await UserModel.findOne(
      { _id: req.header("userID") },
      {
        Requested_Friends: {
          $filter: {
            input: "$Requested_Friends",
            as: "request",
            cond: { $eq: ["$$request.DidYouSend", false] },
          },
        },
      }
    );
    res.json({
      data: user.Requested_Friends.length,
      type: "success",
    });
  } catch (error) {
    res.json({ msg: error.message, type: "error" });
  }
});

Router.post("/get-image", UserAuthentication, async (req, res) => {
  try {
    const { Username } = req.body;
    const user = await UserModel.findOne({ Username })
      .select("ImageData")
      .select("ImageContentType");
    res.json({
      data: {
        ImageData: user.ImageData ? user.ImageData.toString("base64") : null,
        ImageContentType: user.ImageContentType ? user.ImageContentType : null,
      },
      type: "success",
    });
  } catch (error) {
    res.json({ msg: error.message, type: "error" });
  }
});

const generateSymmetricKey = () => {
  return CryptoJS.lib.WordArray.random(32).toString(); // 256-bit key as a hex string
};

const EncryptSymmetricKey = (symmetricKey, publicKeyPem) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedSymmetricKey = publicKey.encrypt(symmetricKey, "RSA-OAEP");
  return forge.util.encode64(encryptedSymmetricKey); // Base64 encode
};

// MAKE SURE THAT THE SYMMETRIC KEY IS ENCRYPTED EACH TIME THE USER CHANGES PASSWORD

// validate
const Validate = (Body, Schema) => {
  // Receive User object from a user
  const { Username } = Body;

  // Check if user object exists
  if (!Username) return { msg: "Insufficient Information", type: "error" };

  // Check if there are any syntax / format errors
  const { error } = Schema.validate(Body);

  // If error return message
  if (error)
    return {
      msg: error.details[0].message.replace(/"/g, ""),
      type: "error",
    };
  return { type: "success" };
};

module.exports = Router;
