const path = require("path");
const fs = require("fs");
const TeamModel = require("../models/teamModel");

const TeamController = {
  /**
   * GET /api/team
   * List all team members
   */
  async getAll(req, res, next) {
    try {
      const members = await TeamModel.getAll();
      return res.status(200).json({
        success: true,
        count: members.length,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/team/:id
   * Get single team member
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const member = await TeamModel.getById(id);

      if (!member) {
        return res.status(404).json({
          success: false,
          message: `Team member with ID ${id} not found.`,
        });
      }

      return res.status(200).json({
        success: true,
        data: member,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/team
   * Create a new team member with profile picture upload
   */
  async create(req, res, next) {
    try {
      const { name, role, bio, skills, whatsapp_number, display_order } = req.body;

      if (!name || !role) {
        // If file was uploaded but validation fails, remove uploaded file
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (e) {
            console.error("Cleanup error:", e);
          }
        }
        return res.status(400).json({
          success: false,
          message: "Member name and role are required.",
        });
      }

      // Build profile picture path
      let profile_picture = "";
      if (req.file) {
        profile_picture = `/uploads/team/${req.file.filename}`;
      } else if (req.body.profile_picture) {
        profile_picture = req.body.profile_picture;
      }

      const newMember = await TeamModel.create({
        name,
        role,
        bio: bio || "",
        skills: skills || "",
        whatsapp_number: whatsapp_number || "",
        profile_picture,
        display_order: Number(display_order) || 0,
      });

      return res.status(201).json({
        success: true,
        message: "Team member added successfully.",
        data: newMember,
      });
    } catch (error) {
      // Clean up uploaded file on error
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
   * PUT /api/team/:id
   * Update existing team member
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, role, bio, skills, whatsapp_number, display_order } = req.body;

      // Check if member exists
      const existing = await TeamModel.getById(id);
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
          message: `Team member with ID ${id} not found.`,
        });
      }

      let profile_picture = existing.profile_picture;

      // If new file uploaded, update image and clean up old file
      if (req.file) {
        profile_picture = `/uploads/team/${req.file.filename}`;

        if (existing.profile_picture && existing.profile_picture.startsWith("/uploads/team/")) {
          const oldFilePath = path.join(__dirname, "../..", existing.profile_picture);
          if (fs.existsSync(oldFilePath)) {
            try {
              fs.unlinkSync(oldFilePath);
            } catch (err) {
              console.warn("Could not delete old profile picture:", err.message);
            }
          }
        }
      } else if (req.body.profile_picture !== undefined) {
        profile_picture = req.body.profile_picture;
      }

      const updated = await TeamModel.update(id, {
        name: name !== undefined ? name : existing.name,
        role: role !== undefined ? role : existing.role,
        bio: bio !== undefined ? bio : existing.bio,
        skills: skills !== undefined ? skills : existing.skills,
        whatsapp_number:
          whatsapp_number !== undefined ? whatsapp_number : existing.whatsapp_number,
        profile_picture,
        display_order:
          display_order !== undefined
            ? Number(display_order)
            : existing.display_order,
      });

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: "Failed to update team member.",
        });
      }

      const refreshed = await TeamModel.getById(id);

      return res.status(200).json({
        success: true,
        message: "Team member updated successfully.",
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
   * DELETE /api/team/:id
   * Delete team member and associated image
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await TeamModel.getById(id);

      if (!existing) {
        return res.status(404).json({
          success: false,
          message: `Team member with ID ${id} not found.`,
        });
      }

      // Remove photo from disk if stored locally
      if (existing.profile_picture && existing.profile_picture.startsWith("/uploads/team/")) {
        const filePath = path.join(__dirname, "../..", existing.profile_picture);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (err) {
            console.warn("Could not remove team picture file:", err.message);
          }
        }
      }

      await TeamModel.delete(id);

      return res.status(200).json({
        success: true,
        message: `Team member "${existing.name}" deleted successfully.`,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = TeamController;
