const express = require("express");
const GalleryController = require("../controllers/galleryController");
const { uploadGalleryPhoto } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// List all gallery photos
router.get("/", GalleryController.getAll);

// Get single photo
router.get("/:id", GalleryController.getById);

// Upload new photo (with Multer image upload)
router.post("/", uploadGalleryPhoto.single("image"), GalleryController.create);

// Edit photo title / replace image
router.put("/:id", uploadGalleryPhoto.single("image"), GalleryController.update);

// Delete photo
router.delete("/:id", GalleryController.delete);

module.exports = router;
