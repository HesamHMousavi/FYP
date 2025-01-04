const Mongoose = require("mongoose");

const ChatModel = Mongoose.Schema({
  Users: {
    type: Array,
    required: true,
    default: [],
  },
  Chat: {
    type: Array,
    required: true,
    default: [],
  },
});

module.exports = Mongoose.model("Chat", ChatModel, "Chat");
