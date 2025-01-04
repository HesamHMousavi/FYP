const express = require("express");
const router = express.Router();
const SessionModel = require("../Models/SessionModel");
const UserAuthentication = require("../Middleware/UserAuthentication");
router.use(express.json());

router.get("/", UserAuthentication, async (req, res) => {
  try {
    if (!req.header("Username"))
      return res.json({ message: "Username not found", type: "error" });
    const Username = req.header("Username");
    const session = await SessionModel.find({ Username });
    res.json({ data: session[0], type: "success" });
  } catch (error) {
    res.json({ message: error.message, type: "error" });
  }
});

module.exports = router;
