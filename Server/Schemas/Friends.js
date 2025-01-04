const JOI = require("joi");

const FriendShipSchema = JOI.object({
  Username: JOI.string().alphanum().min(3).max(16).required(),
});
const RequestSchema = JOI.object({
  Username: JOI.string().alphanum().min(3).max(16).required(),
  Accept: JOI.boolean().required(),
  Cancel: JOI.boolean(),
});

module.exports = { FriendShipSchema, RequestSchema };
