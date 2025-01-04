const express = require("express");
const router = express.Router();
const UserSchema = require("../Schemas/UserSchema");
const UserModel = require("../Models/UserModel");
const ChatModal = require("../Models/ChatModel");
const Bcrypt = require("bcryptjs");
const generateRSAKeys = require("./GenerateKeys");
const ChatModel = require("../Models/ChatModel");
const CryptoJS = require("crypto-js");
const forge = require("node-forge");
const UserAuthentication = require("../Middleware/UserAuthentication");
const {
  UserUpdateSchema,
  UserPasswordSchema,
} = require("../Schemas/UserUpdate");

const randomId = () => crypto.randomBytes(8).toString("hex");

router.post("/signup", async (req, res) => {
  try {
    const { user } = req.body;
    //CHECK USER OBJECT EXISTS
    if (!user)
      return res
        .status(400)
        .json({ msg: "Missing Information", type: "error" });

    const { error } = UserSchema.validate(user);
    //CHECK USER PASSES SCHEMA
    if (error)
      return res.status(400).json({
        message: error.details[0].message.replace(/"/g, ""),
        type: "error",
      });

    // Encrypt password
    const salt = await Bcrypt.genSalt(10);
    const hash = await Bcrypt.hash(user.Password, salt);
    const { privateKey, publicKey } = generateRSAKeys();
    user.PrivateEncryptionKey = encryptPrivateKey(privateKey, user.Password);
    user.PublicEncryptionKey = publicKey;
    user.Password = hash;
    user.Email = user.Email.toLowerCase();
    user.Username = user.Username.toLowerCase();
    user.Connected = false;
    user.MessageQueue = [];
    // CREATE USER
    const newUser = new UserModel(user);

    await newUser.save();
    // await Session.save();

    res.json({ msg: "user created", type: "success" });
  } catch (error) {
    // console.error(error);
    if (
      error.message.includes("Email") &&
      error.message.includes("duplicate")
    ) {
      return res.status(400).json({ msg: "Email Taken", type: "error" });
    }
    if (
      error.message.includes("Username") &&
      error.message.includes("duplicate")
    ) {
      return res.status(400).json({ msg: "Username Taken", type: "error" });
    }
    res.json({ msg: error.message, type: "error" });
  }
});

// FUNCTION TO GET USER INFROMARION BASED ON FILTERS
router.post("/user-info", UserAuthentication, async (req, res) => {
  try {
    const { Username, filters } = req.body;
    console.log(Username);
    // Check an array of filtres is supplied => Error if NOT
    if (!filters || filters.length < 1)
      return res.json({ msg: "No filters Found", type: "error" });
    // Check Usrename is supplied => Error if NOT
    if (!Username) return res.json({ msg: "No Username Found", type: "error" });
    // Create an include string
    const IncludeAttribues = filters.map((field) => `${field}`).join(" ");
    // Look for user in databse
    const user = await UserModel.findOne({ Username }).select(IncludeAttribues);
    console.log(IncludeAttribues);
    // => Error if NOT FOUND
    if (!user) res.json({ data: user, type: "success" });
    // => Success, return user
    res.json({ data: user, type: "success" });
  } catch (error) {
    res.json({ msg: error.message, type: "error" });
  }
});

router.put("/update", UserAuthentication, async (req, res) => {
  // Here is where we modify user information
  try {
    const userID = req.header("userID");
    const { newUser } = req.body;
    if (!userID || !newUser)
      return res.json({ msg: "Missing Information", type: "warning" });

    //Check if the user object passes the schema validation
    const { error } = UserUpdateSchema.validate(newUser);
    if (error)
      return res.status(400).json({
        message: error.details[0].message.replace(/"/g, ""),
        type: "error",
      });
    const updatedUser = await UserModel.findByIdAndUpdate(userID, newUser);
    // Check if the user exists in the database

    if (!updatedUser) return res.json({ msg: "User not found", type: "error" });
    res.json({
      msg: "Information Updated",
      type: "success",
      data: updatedUser,
    });
  } catch (error) {
    if (
      error.message.includes("Email") &&
      error.message.includes("duplicate")
    ) {
      return res.json({ msg: "Email Taken", type: "error" });
    }
    if (
      error.message.includes("Username") &&
      error.message.includes("duplicate")
    ) {
      return res.json({ msg: "Username Taken", type: "error" });
    }
    res.json({ msg: error.message, type: "error" });
  }
});

router.get("/get", UserAuthentication, async (req, res) => {
  try {
    const userID = req.header("userID");
    if (!userID)
      return res.status(400).json({ msg: "user id missing", type: "warning" });
    let foundUser = await UserModel.findById(userID)
      .select("-__v")
      .select("-Password");
    let newFriends = [];

    for (const friend of foundUser.Friends) {
      let item = await UserModel.find({ Username: friend.Username });
      item = item[0];
      newFriends.push({
        Username: item.Username,
        Email: item.Email,
        _id: item._id,
        ImageData: item.ImageData ? item.ImageData.toString("base64") : null,
        ImageContentType: item.ImageContentType ? item.ImageContentType : null,
        isConnected: item.Connected,
        PublicEncryptionKey: item.PublicEncryptionKey,
        Stories: [],
      });
    }
    const User = {
      _id: foundUser._id,
      Email: foundUser.Email,
      Username: foundUser.Username,
      Phone: foundUser.Phone,
      Friends: newFriends,
      MessageQueue: foundUser.MessageQueue,
      Requested_Friends: foundUser.Requested_Friends,
      PrivateEncryptionKey: foundUser.PrivateEncryptionKey,
      PublicEncryptionKey: foundUser.PublicEncryptionKey,
      ImageContentType: foundUser.ImageContentType
        ? foundUser.ImageContentType
        : null,
      ImageData: foundUser.ImageData
        ? foundUser.ImageData.toString("base64")
        : null,
    };
    res.json({
      msg: "User information provided",
      type: "success",
      data: User,
    });
  } catch (error) {
    res.json({ msg: error.message, type: "error" });
  }
});

router.post("/get", UserAuthentication, async (req, res) => {
  try {
    const { Username } = req.body;
    if (!Username)
      return res.json({ msg: "username missing", type: "warning" });
    const user = await UserModel.findOne({ Username })
      .select("-__v")
      .select("-Password")
      .select("-Friends")
      .select("-Requested_Friends")
      .select("-MessageQueue")
      .select("-Phone");

    res.json({
      msg: "User information provided",
      type: "success",
      data: user,
    });
  } catch (error) {
    res.json({ msg: error.message, type: "error" });
  }
});

router.get("/get-friends", UserAuthentication, async (req, res) => {
  try {
    if (!req.header("userID"))
      return res.json({ msg: "user id missing", type: "error" });
    const user = await UserModel.findById(req.header("userID"))
      .select("Friends")
      .select("Requested_Friends");

    res.json({
      msg: "User information provided",
      type: "success",
      data: user,
    });
  } catch (error) {
    res.json({ msg: error.message, type: "error" });
  }
});

router.put("/change-password", async (req, res) => {
  try {
    let { NewPassword, CurrentPassword } = req.body;
    const userID = req.header("userID");
    const user = await UserModel.findByIdAndUpdate(userID);
    const Correct = await Bcrypt.compare(CurrentPassword, user.Password);
    if (!Correct) return res.json({ msg: "Password Incorrect", type: "error" });

    const DecryptedPrivateKey = decryptPrivateKey(
      user.PrivateEncryptionKey,
      CurrentPassword
    );

    //Create a loop and update  every chat with the newly generated private key

    const chats = await ChatModel.find({
      $and: [{ Users: { $elemMatch: { Username: user.Username } } }],
    });
    chats.map(async (chat) => {
      const index = chat.Users.findIndex(
        (item) => item.Username === user.Username
      );
      const DecryptedSymmetricKey = DecryptSymmetricKey(
        chat.Users[index].EncryptedSymmetricKey,
        DecryptedPrivateKey
      );
      const NewEncryptedSymmetricKey = EncryptSymmetricKey(
        DecryptedSymmetricKey,
        user.PublicEncryptionKey
      );

      await ChatModel.findOneAndUpdate(
        {
          $and: [
            { Users: { $elemMatch: { Username: chat.Users[0].Username } } },
            { Users: { $elemMatch: { Username: chat.Users[1].Username } } },
          ],
        },
        {
          $set: {
            "Users.$[user].attributeToUpdate": NewEncryptedSymmetricKey, // Update specific attribute
          },
        },
        {
          arrayFilters: [
            { "user.Username": chat.Users[0].Username }, // Match the specific user in the array
          ],
          new: true, // Return the updated document
        }
      );
    });

    const NewPrivateEncryptionKey = encryptPrivateKey(
      DecryptedPrivateKey,
      NewPassword
    );
    const { error } = UserPasswordSchema.validate({
      NewPassword,
      CurrentPassword,
    });
    if (error)
      return res.status(400).json({
        message: error.details[0].message.replace(/"/g, ""),
        type: "error",
      });

    const salt = await Bcrypt.genSalt(10);
    const hash = await Bcrypt.hash(NewPassword, salt);
    NewPassword = hash;

    const newUser = await UserModel.findByIdAndUpdate(userID, {
      Password: NewPassword,
      PrivateEncryptionKey: NewPrivateEncryptionKey,
    });
    if (newUser) return res.json({ msg: "Password updated", type: "success" });
    res.json({ msg: "Problem occurred", type: "error" });
  } catch (error) {
    res.json({ msg: error.message, type: "error" });
  }
});

router.post("/search", UserAuthentication, async (req, res) => {
  const { username } = req.body;
  try {
    const users = await UserModel.find({
      Username: { $regex: username, $options: "i" },
    })
      .select("Username")
      .select("ImageData")
      .select("ImageContentType")
      .select("Requested_Friends")
      .limit(10);
    let UsersFound = [];
    if (users) {
      users.forEach((item) => {
        UsersFound.push({
          Username: item.Username,
          ImageContentType: item.ImageContentType
            ? item.ImageContentType
            : null,
          ImageData: item.ImageData ? item.ImageData.toString("base64") : null,
          _id: item._id,
        });
      });
    }
    return res.status(200).json({ UsersFound: UsersFound, type: "success" });
  } catch (error) {
    return res.status(400).json({ message: error, type: error });
  }
});

// Get user conversations
router.post("/chats", UserAuthentication, async (req, res) => {
  try {
    // Destruct username from request body
    const { Username, page, limit } = req.body;
    // Check id username is in the body => Error if NOT
    if (!Username)
      return res.json({ msg: "Username not Found", type: "error" });
    // Get username Friends
    const user = await UserModel.findOne({ Username }).select("Friends");
    //Check if user exists => Error if NOT
    if (!user) return res.json({ msg: "User not Found", type: "error" });
    // Get the username in each object => ["user1","user2","user3", ...]
    const Friends = user.Friends.map((friend) => friend.username);
    // const skip = (page - 1) * limit;
    // Query to find all chat modals
    const chatModals = await ChatModal.find({
      users: { $all: [Username, { $elemMatch: { $in: Friends } }] },
    });
    // .skip(skip)
    // .limit(parseInt(limit))
    // .sort({ updatedAt: -1 });

    // Return with data
    res.json({ data: chatModals, type: "success" });
  } catch (error) {
    res.status(500).json({ msg: error.message, type: "error" });
  }
});

// FOR TESTING PURPOSES
router.post("/delete", async (req, res) => {
  try {
    const { Username } = req.body;
    const ret = await UserModel.findOneAndDelete({ Username });
    res.status(200).json({ message: "user deleted", type: "success" });
  } catch (error) {
    res.json({ message: error.message, type: "error" });
  }
});

const encryptPrivateKey = (privateKey, password) => {
  const salt = CryptoJS.lib.WordArray.random(128 / 8); // Generate a random salt
  const iv = CryptoJS.lib.WordArray.random(128 / 8); // Generate a random IV

  // Derive the key from password and salt
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
  });

  // Encrypt the private key using AES-CBC
  const encrypted = CryptoJS.AES.encrypt(privateKey, key, { iv: iv });

  return {
    encryptedPrivateKey: encrypted.toString(),
    salt: salt.toString(CryptoJS.enc.Base64),
    iv: iv.toString(CryptoJS.enc.Base64),
  };
};

const decryptPrivateKey = (encryptedData, password) => {
  try {
    const { encryptedPrivateKey, salt, iv } = encryptedData;

    // Decode the salt and IV from Base64
    const decodedSalt = CryptoJS.enc.Base64.parse(salt);
    const decodedIv = CryptoJS.enc.Base64.parse(iv);

    // Derive the key from password and salt
    const key = CryptoJS.PBKDF2(password, decodedSalt, {
      keySize: 256 / 32,
      iterations: 10000,
    });

    // Decrypt the private key using AES-CBC
    const decrypted = CryptoJS.AES.decrypt(encryptedPrivateKey, key, {
      iv: decodedIv,
    });

    // Convert the decrypted text into a UTF-8 string and return it
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.log(error);
  }
};

const DecryptSymmetricKey = (encryptedSymmetricKey, privateKeyPem) => {
  try {
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
    const decodedKey = forge.util.decode64(encryptedSymmetricKey); // Decode from Base64
    return privateKey.decrypt(decodedKey, "RSA-OAEP");
  } catch (error) {
    console.log(error);
  }
};

const EncryptSymmetricKey = (symmetricKey, publicKeyPem) => {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encryptedSymmetricKey = publicKey.encrypt(symmetricKey, "RSA-OAEP");
  return forge.util.encode64(encryptedSymmetricKey); // Base64 encode
};

module.exports = router;
