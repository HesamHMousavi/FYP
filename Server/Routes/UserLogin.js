const express = require("express");
const app = express();
const LoginSchema = require("../Schemas/UserLogin");
const UserModel = require("../Models/UserModel");
const Bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
require("dotenv").config();

app.post("/", async (req, res) => {
  try {
    const { user } = req.body;
    if (!user)
      return res
        .status(400)
        .json({ msg: "Missing Information", type: "error" });

    const { error } = LoginSchema.validate(user);
    //CHECK USER PASSES SCHEMA
    if (error)
      return res.status(400).json({
        message: error.details[0].message.replace(/"/g, ""),
        type: "error",
      });

    //Check details against database
    const UserFound = await UserModel.findOne({ Email: user.Email });

    // If Customer not found return error
    if (!UserFound)
      return res.status(400).json({
        message: "Incorrect Email or Password. Try again!",
        type: "error",
      });
    // Check if password is correct
    const Correct = await Bcrypt.compare(user.Password, UserFound.Password);

    if (!Correct)
      return res.status(400).json({
        message: "Incorrect Email or Password. Try again!",
        type: "error",
      });
    // Generate a token for the user
    const Token = JWT.sign({ id: UserFound._id }, process.env.TOKEN_SECRET, {
      expiresIn: "180d",
    });

    // Respond with a token
    res.status(200).json({
      Token: Token,
      userID: UserFound._id,
      User: { PrivateEncryptionKey: UserFound.PrivateEncryptionKey },
      type: "success",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, type: "error" });
  }
});

module.exports = app;
