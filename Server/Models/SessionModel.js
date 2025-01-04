const Mongoose = require("mongoose");

const SessionSchema = Mongoose.Schema({
  Username: {
    type: String,
    required: true,
  },
  SocketID: {
    type: String,
    required: true,
  },
  SessionID: {
    type: String,
    required: true,
  },
  Connected: {
    type: Boolean,
    required: true,
  },
  NewMessages: {
    type: Array,
    required: true,
  },
});

module.exports = Mongoose.model("Session", SessionSchema, "Session");
