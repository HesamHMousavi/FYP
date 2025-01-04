const JOI = require("joi");

const UserLoginSchema = JOI.object({
  Email: JOI.string().email().required(),
  Password: JOI.string().required(),
});

module.exports = UserLoginSchema;
