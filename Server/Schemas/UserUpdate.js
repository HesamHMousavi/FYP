const JOI = require("joi");

const UserUpdateSchema = JOI.object({
  Username: JOI.string().min(3).max(12),
  Email: JOI.string().email(),
  Phone: JOI.string().min(11).max(11),
});

const UserPasswordSchema = JOI.object({
  NewPassword: JOI.string().min(8).required(),
  CurrentPassword: JOI.string().min(8).required(),
});

module.exports = {
  UserPasswordSchema,
  UserUpdateSchema,
};
