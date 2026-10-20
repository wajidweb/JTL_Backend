const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist (use /tmp in Vercel serverless environment)
const baseDir = process.env.VERCEL ? "/tmp" : path.join(__dirname, "../..");

const teamUploadDir = path.join(baseDir, "uploads/team");
if (!fs.existsSync(teamUploadDir)) {
  fs.mkdirSync(teamUploadDir, { recursive: true });
}

const galleryUploadDir = path.join(baseDir, "uploads/gallery");
if (!fs.existsSync(galleryUploadDir)) {
  fs.mkdirSync(galleryUploadDir, { recursive: true });
}

const videosUploadDir = path.join(baseDir, "uploads/videos");
if (!fs.existsSync(videosUploadDir)) {
  fs.mkdirSync(videosUploadDir, { recursive: true });
}

const videoThumbnailsDir = path.join(baseDir, "uploads/videos/thumbnails");
if (!fs.existsSync(videoThumbnailsDir)) {
  fs.mkdirSync(videoThumbnailsDir, { recursive: true });
}

// Common Image Formats Filter
const imageFileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and WEBP image formats are supported."), false);
  }
};

// 1. Team Storage
const teamStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, teamUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `team-${safeName}-${uniqueSuffix}${ext}`);
  },
});

const uploadTeamPhoto = multer({
  storage: teamStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: imageFileFilter,
});

// 2. Gallery Storage
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galleryUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `gallery-${safeName}-${uniqueSuffix}${ext}`);
  },
});

const uploadGalleryPhoto = multer({
  storage: galleryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: imageFileFilter,
});

// 3. Video & Thumbnail Storage (Up to 500MB for video files)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "video_file") {
      cb(null, videosUploadDir);
    } else if (file.fieldname === "thumbnail_image") {
      cb(null, videoThumbnailsDir);
    } else {
      cb(null, videosUploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase();
    const prefix = file.fieldname === "thumbnail_image" ? "vthumb" : "video";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${prefix}-${safeName}-${uniqueSuffix}${ext}`);
  },
});

const videoMediaFilter = (req, file, cb) => {
  if (file.fieldname === "video_file") {
    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-matroska",
    ];
    if (allowedVideoTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|mkv|ogg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a valid video file (.mp4, .webm, .mov)."), false);
    }
  } else if (file.fieldname === "thumbnail_image") {
    const allowedImages = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedImages.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Thumbnail must be a JPG, PNG, or WEBP image."), false);
    }
  } else {
    cb(null, true);
  }
};

const uploadVideoMedia = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max video file size
  },
  fileFilter: videoMediaFilter,
});

module.exports = {
  uploadTeamPhoto,
  uploadGalleryPhoto,
  uploadVideoMedia,
  teamUploadDir,
  galleryUploadDir,
  videosUploadDir,
  videoThumbnailsDir,
};
