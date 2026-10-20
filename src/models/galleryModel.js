const { pool } = require("../config/db");

const GalleryModel = {
  /**
   * Ensure gallery_items table exists in MySQL
   */
  async initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS \`gallery_items\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`image_url\` VARCHAR(500) NOT NULL,
        \`category\` VARCHAR(100) DEFAULT 'Centre',
        \`display_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(sql);
  },

  /**
   * Get all gallery photos ordered newest first
   */
  async getAll() {
    await this.initTable();
    const [rows] = await pool.query(
      "SELECT * FROM gallery_items ORDER BY display_order ASC, id DESC"
    );
    return rows;
  },

  /**
   * Get single gallery item by ID
   */
  async getById(id) {
    await this.initTable();
    const [rows] = await pool.query(
      "SELECT * FROM gallery_items WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Insert new gallery image
   */
  async create({ title, image_url, category = "Centre", display_order = 0 }) {
    await this.initTable();
    const [result] = await pool.query(
      `INSERT INTO gallery_items (title, image_url, category, display_order) 
       VALUES (?, ?, ?, ?)`,
      [title, image_url, category, display_order]
    );
    return {
      id: result.insertId,
      title,
      image_url,
      category,
      display_order,
    };
  },

  /**
   * Update gallery image (e.g. title or new image file)
   */
  async update(id, { title, image_url, category, display_order }) {
    await this.initTable();
    const [result] = await pool.query(
      `UPDATE gallery_items 
       SET title = COALESCE(?, title),
           image_url = COALESCE(?, image_url),
           category = COALESCE(?, category),
           display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [title, image_url, category, display_order, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Delete gallery photo
   */
  async delete(id) {
    await this.initTable();
    const [result] = await pool.query("DELETE FROM gallery_items WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  },
};

module.exports = GalleryModel;
