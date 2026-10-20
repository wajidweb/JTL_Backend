const express = require("express");
const TeamController = require("../controllers/teamController");
const { uploadTeamPhoto } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// List all team members
router.get("/", TeamController.getAll);

// Get single member details
router.get("/:id", TeamController.getById);

// Create new team member with profile picture upload
router.post("/", uploadTeamPhoto.single("profile_picture"), TeamController.create);

// Update existing member (picture upload optional)
router.put("/:id", uploadTeamPhoto.single("profile_picture"), TeamController.update);

// Delete member
router.delete("/:id", TeamController.delete);

module.exports = router;
