const express = require("express");
const VideoController = require("../controllers/videoController");
const { uploadVideoMedia } = require("../middlewares/uploadMiddleware");

const router = express.Router();

const mediaUploadFields = uploadVideoMedia.fields([
  { name: "video_file", maxCount: 1 },
  { name: "thumbnail_image", maxCount: 1 },
]);

// List all videos (optional ?category=Session or ?category=Family)
router.get("/", VideoController.getAll);

// Get single video
router.get("/:id", VideoController.getById);

// Create new video (video upload or link + optional thumbnail)
router.post("/", mediaUploadFields, VideoController.create);

// Update existing video
router.put("/:id", mediaUploadFields, VideoController.update);

// Delete video
router.delete("/:id", VideoController.delete);

module.exports = router;
