const JOI = require("joi");

const UserSchema = JOI.object({
  Username: JOI.string().min(3).max(12).required(),
  Email: JOI.string().email().required(),
  Phone: JOI.string().min(11).max(11).required(),
  Password: JOI.string().min(8).required(),
  Image: JOI.object(),
});

module.exports = UserSchema;
