const mon = require("mongoose");

const UserSchema = mon.Schema({
  Username: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9-_]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores",
    ],
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  Phone: {
    type: String,
    required: true,
    match: [
      /^\d{10,15}$/,
      "Please enter a valid phone number with 10 to 15 digits",
    ],
  },
  Password: {
    type: String,
    required: true,
    minlength: 8,
    match: [
      /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
      "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter",
    ],
  },
  PrivateEncryptionKey: {
    type: Object,
    required: true,
    default: null,
  },
  PublicEncryptionKey: {
    type: String,
    required: true,
    default: null,
  },
  Friends: {
    type: Array,
    required: true,
    default: [],
  },
  Requested_Friends: {
    type: Array,
    required: true,
    default: [],
  },
  ImageData: {
    type: Buffer,
    default: null,
  },
  ImageContentType: {
    type: String,
    default: null,
  },
  Connected: {
    type: Boolean,
    required: true,
  },
  MessageQueue: {
    type: Array,
    required: true,
  },
});

module.exports = mon.model("User", UserSchema, "User");
