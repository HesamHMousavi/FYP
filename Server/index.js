const { http, server } = require("./Routes/Socket");
const express = require("express");
const ConnectDB = require("./DB");
const cors = require("cors");
server.use(cors());
server.use(express.json());
require("dotenv").config();

const PORT = process.env.PORT || 5001;
ConnectDB();

server.get("/", (req, res) => {
  res.json({ msg: "API ENDPOINT" });
});

server.use("/user", require("./Routes/user"));

server.use("/login", require("./Routes/UserLogin"));

server.use("/image", require("./Routes/Image"));

server.use("/friend", require("./Routes/Friends"));

server.use("/chat", require("./Routes/Chat"));

server.use("/call", require("./Routes/Call"));

server.use("/reset-password", require("./Routes/ResetPassword"));

http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = server;
