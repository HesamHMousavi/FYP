const mongoose = require("mongoose");

const ScheduledTaskSchema = new mongoose.Schema({
  taskId: { type: String, required: true },
  sender: String,
  receiver: String,
  message: String,
  cornExpression: { type: String, required: true },
  receiverID: { type: String, required: true },
});

module.exports = mongoose.model("Task", ScheduledTaskSchema, "Task");
