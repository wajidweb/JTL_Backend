const path = require("path");
const fs = require("fs");
const VideoModel = require("../models/videoModel");

/**
 * Helper to extract YouTube Video ID from various link formats
 */
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  return match ? match[1] : null;
}

const VideoController = {
  /**
   * GET /api/videos
   * List all videos, optionally filtered by ?category=Session or ?category=Family
   */
  async getAll(req, res, next) {
    try {
      const { category } = req.query;
      const videos = await VideoModel.getAll(category || null);
      return res.status(200).json({
        success: true,
        count: videos.length,
        data: videos,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/videos/:id
   * Get single video
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const video = await VideoModel.getById(id);

      if (!video) {
        return res.status(404).json({
          success: false,
          message: `Video item #${id} not found.`,
        });
      }

      return res.status(200).json({
        success: true,
        data: video,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/videos
   * Create new video (either uploaded file or external link)
   */
  async create(req, res, next) {
    try {
      const {
        category,
        title,
        badge,
        description,
        parent_name,
        video_type,
        video_link,
        display_order,
      } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Video title is required.",
        });
      }

      const files = req.files || {};
      const videoFile = files["video_file"] ? files["video_file"][0] : null;
      const thumbFile = files["thumbnail_image"] ? files["thumbnail_image"][0] : null;

      let finalVideoUrl = "";
      let finalVideoType = video_type || (videoFile ? "upload" : "link");
      let finalThumbnailUrl = "";

      // Handle video source
      if (videoFile) {
        finalVideoType = "upload";
        finalVideoUrl = `/uploads/videos/${videoFile.filename}`;
      } else if (video_link && video_link.trim()) {
        finalVideoType = "link";
        finalVideoUrl = video_link.trim();
      } else if (req.body.video_url) {
        finalVideoUrl = req.body.video_url.trim();
      } else {
        return res.status(400).json({
          success: false,
          message: "Please either upload a video file or provide a video link.",
        });
      }

      // Handle thumbnail
      if (thumbFile) {
        finalThumbnailUrl = `/uploads/videos/thumbnails/${thumbFile.filename}`;
      } else if (req.body.thumbnail_url) {
        finalThumbnailUrl = req.body.thumbnail_url;
      } else if (finalVideoType === "link") {
        // Auto-extract YouTube thumbnail if available
        const ytId = extractYouTubeId(finalVideoUrl);
        if (ytId) {
          finalThumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
      }

      const newVideo = await VideoModel.create({
        category: category === "Family" ? "Family" : "Session",
        title: title.trim(),
        badge: badge ? badge.trim() : (category === "Family" ? "Family Story" : "Clinical Session"),
        description: description ? description.trim() : "",
        parent_name: category === "Family" && parent_name ? parent_name.trim() : "",
        video_type: finalVideoType,
        video_url: finalVideoUrl,
        thumbnail_url: finalThumbnailUrl,
        display_order: Number(display_order) || 0,
      });

      return res.status(201).json({
        success: true,
        message: "Video published successfully.",
        data: newVideo,
      });
    } catch (error) {
      // Clean up uploaded files on failure
      if (req.files) {
        Object.values(req.files).forEach((fileArr) => {
          fileArr.forEach((f) => {
            try {
              fs.unlinkSync(f.path);
            } catch (e) {
              console.error("Cleanup error:", e);
            }
          });
        });
      }
      next(error);
    }
  },

  /**
   * PUT /api/videos/:id
   * Update video details
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await VideoModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Video item #${id} not found.`,
        });
      }

      const {
        category,
        title,
        badge,
        description,
        parent_name,
        video_type,
        video_link,
        display_order,
      } = req.body;

      const files = req.files || {};
      const videoFile = files["video_file"] ? files["video_file"][0] : null;
      const thumbFile = files["thumbnail_image"] ? files["thumbnail_image"][0] : null;

      let finalVideoUrl = existing.video_url;
      let finalVideoType = video_type || existing.video_type;
      let finalThumbnailUrl = existing.thumbnail_url;

      // Handle video replacement
      if (videoFile) {
        finalVideoType = "upload";
        finalVideoUrl = `/uploads/videos/${videoFile.filename}`;

        // Remove old video from disk if it was local
        if (existing.video_url && existing.video_url.startsWith("/uploads/videos/")) {
          const oldPath = path.join(__dirname, "../..", existing.video_url);
          if (fs.existsSync(oldPath)) {
            try {
              fs.unlinkSync(oldPath);
            } catch (err) {
              console.warn("Could not remove old video file:", err.message);
            }
          }
        }
      } else if (video_link && video_link.trim()) {
        finalVideoType = "link";
        finalVideoUrl = video_link.trim();
      }

      // Handle thumbnail replacement
      if (thumbFile) {
        finalThumbnailUrl = `/uploads/videos/thumbnails/${thumbFile.filename}`;

        if (
          existing.thumbnail_url &&
          existing.thumbnail_url.startsWith("/uploads/videos/thumbnails/")
        ) {
          const oldThumbPath = path.join(__dirname, "../..", existing.thumbnail_url);
          if (fs.existsSync(oldThumbPath)) {
            try {
              fs.unlinkSync(oldThumbPath);
            } catch (err) {
              console.warn("Could not remove old thumbnail file:", err.message);
            }
          }
        }
      } else if (req.body.thumbnail_url !== undefined) {
        finalThumbnailUrl = req.body.thumbnail_url;
      } else if (finalVideoType === "link" && !finalThumbnailUrl) {
        const ytId = extractYouTubeId(finalVideoUrl);
        if (ytId) {
          finalThumbnailUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
      }

      const updated = await VideoModel.update(id, {
        category: category !== undefined ? category : existing.category,
        title: title !== undefined ? title.trim() : existing.title,
        badge: badge !== undefined ? badge.trim() : existing.badge,
        description: description !== undefined ? description.trim() : existing.description,
        parent_name: parent_name !== undefined ? parent_name.trim() : existing.parent_name,
        video_type: finalVideoType,
        video_url: finalVideoUrl,
        thumbnail_url: finalThumbnailUrl,
        display_order:
          display_order !== undefined ? Number(display_order) : existing.display_order,
      });

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Failed to update video record.",
        });
      }

      const refreshed = await VideoModel.getById(id);

      return res.status(200).json({
        success: true,
        message: "Video updated successfully.",
        data: refreshed,
      });
    } catch (error) {
      if (req.files) {
        Object.values(req.files).forEach((fileArr) => {
          fileArr.forEach((f) => {
            try {
              fs.unlinkSync(f.path);
            } catch (e) {
              console.error("Cleanup error:", e);
            }
          });
        });
      }
      next(error);
    }
  },

  /**
   * DELETE /api/videos/:id
   * Delete video and associated media files from disk
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await VideoModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Video item #${id} not found.`,
        });
      }

      // Remove local video file
      if (existing.video_url && existing.video_url.startsWith("/uploads/videos/")) {
        const videoPath = path.join(__dirname, "../..", existing.video_url);
        if (fs.existsSync(videoPath)) {
          try {
            fs.unlinkSync(videoPath);
          } catch (err) {
            console.warn("Could not delete video file:", err.message);
          }
        }
      }

      // Remove local thumbnail file
      if (
        existing.thumbnail_url &&
        existing.thumbnail_url.startsWith("/uploads/videos/thumbnails/")
      ) {
        const thumbPath = path.join(__dirname, "../..", existing.thumbnail_url);
        if (fs.existsSync(thumbPath)) {
          try {
            fs.unlinkSync(thumbPath);
          } catch (err) {
            console.warn("Could not delete thumbnail file:", err.message);
          }
        }
      }

      await VideoModel.delete(id);

      return res.status(200).json({
        success: true,
        message: `Video "${existing.title}" deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = VideoController;
