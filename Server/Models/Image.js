const mon = require("mongoose");

const imageSchema = new mon.Schema({
  data: Buffer,
  contentType: String,
});
module.exports = mon.model("Image", imageSchema);
