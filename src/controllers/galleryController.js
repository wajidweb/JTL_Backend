const path = require("path");
const fs = require("fs");
const GalleryModel = require("../models/galleryModel");

const GalleryController = {
  /**
   * GET /api/gallery
   * Get all gallery photos
   */
  async getAll(req, res, next) {
    try {
      const items = await GalleryModel.getAll();
      return res.status(200).json({
        success: true,
        count: items.length,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/gallery/:id
   * Get single photo
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await GalleryModel.getById(id);

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Gallery item #${id} not found.`,
        });
      }

      return res.status(200).json({
        success: true,
        data: item,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/gallery
   * Upload new gallery image with title
   */
  async create(req, res, next) {
    try {
      const { title, category, display_order } = req.body;

      if (!title || !title.trim()) {
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.error("Cleanup error:", e);
          }
        }
        return res.status(400).json({
          success: false,
          message: "Image title is required.",
        });
      }

      if (!req.file && !req.body.image_url) {
        return res.status(400).json({
          success: false,
          message: "Please select an image file to upload.",
        });
      }

      const image_url = req.file
        ? `/uploads/gallery/${req.file.filename}`
        : req.body.image_url;

      const newItem = await GalleryModel.create({
        title: title.trim(),
        image_url,
        category: category || "Centre",
        display_order: Number(display_order) || 0,
      });

      return res.status(201).json({
        success: true,
        message: "Gallery image uploaded successfully.",
        data: newItem,
      });
    } catch (error) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
      next(error);
    }
  },

  /**
   * PUT /api/gallery/:id
   * Edit image title (and optionally replace photo)
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { title, category, display_order } = req.body;

      const existing = await GalleryModel.getById(id);
      if (!existing) {
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.error("Cleanup error:", e);
          }
        }
        return res.status(404).json({
          success: false,
          message: `Gallery item #${id} not found.`,
        });
      }

      let image_url = existing.image_url;

      // If new image uploaded, remove old image from disk
      if (req.file) {
        image_url = `/uploads/gallery/${req.file.filename}`;

        if (
          existing.image_url &&
          existing.image_url.startsWith("/uploads/gallery/")
        ) {
          const oldFilePath = path.join(__dirname, "../..", existing.image_url);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (err) {
              console.warn("Could not remove old gallery image:", err.message);
            }
          }
        }
      } else if (req.body.image_url !== undefined) {
        image_url = req.body.image_url;
      }

      const updated = await GalleryModel.update(id, {
        title: title !== undefined ? title.trim() : existing.title,
        image_url,
        category: category !== undefined ? category : existing.category,
        display_order:
          display_order !== undefined
            ? Number(display_order)
            : existing.display_order,
      });

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Failed to update gallery image.",
        });
      }

      const refreshed = await GalleryModel.getById(id);

      return res.status(200).json({
        success: true,
        message: "Gallery image updated successfully.",
        data: refreshed,
      });
    } catch (error) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {
          console.error("Cleanup error:", e);
        }
      }
      next(error);
    }
  },

  /**
   * DELETE /api/gallery/:id
   * Delete image and clean up file from disk
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await GalleryModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Gallery item #${id} not found.`,
        });
      }

      // Remove photo from disk if stored locally
      if (
        existing.image_url &&
        existing.image_url.startsWith("/uploads/gallery/")
      ) {
        const filePath = path.join(__dirname, "../..", existing.image_url);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.warn("Could not delete gallery file from disk:", err.message);
          }
        }
      }

      await GalleryModel.delete(id);

      return res.status(200).json({
        success: true,
        message: `Gallery image "${existing.title}" deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = GalleryController;
