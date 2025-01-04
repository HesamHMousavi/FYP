const express = require("express");
const router = express.Router();
const UserModel = require("../Models/UserModel");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.use(express.json({ limit: "50mb" }));
router.use(express.urlencoded({ limit: "50mb", extended: true }));

// API endpoint to save an image buffer
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const userID = req.header("userID");
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    // Create a new image document with file buffer and content type
    const newImage = await UserModel.findByIdAndUpdate(userID, {
      ImageData: req.file.buffer,
      ImageContentType: req.file.mimetype,
    });
    if (newImage)
      return res.json({ msg: "Image uploaded successfully", type: "success" });
    res.json({ msg: "Unsuccessful image upload", type: "error" });
  } catch (error) {
    res.json({ msg: error, type: "error" });
  }
});

module.exports = router;
