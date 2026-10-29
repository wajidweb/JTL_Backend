const { pool } = require("../config/db");

const VideoModel = {
  /**
   * Ensure video_items table exists in MySQL
   */
  async initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS \`video_items\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`category\` ENUM('Session', 'Family', 'Message') NOT NULL DEFAULT 'Session',
        \`title\` VARCHAR(255) NOT NULL,
        \`badge\` VARCHAR(100) NOT NULL DEFAULT '',
        \`description\` TEXT,
        \`parent_name\` VARCHAR(150) DEFAULT '',
        \`video_type\` ENUM('upload', 'link') NOT NULL DEFAULT 'link',
        \`video_url\` VARCHAR(500) NOT NULL,
        \`thumbnail_url\` VARCHAR(500) DEFAULT '',
        \`display_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(sql);
  },

  /**
   * Get all video items (optional category filter: 'Session' or 'Family')
   */
  async getAll(category = null) {
    await this.initTable();
    let query = "SELECT * FROM video_items";
    const params = [];

    if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }

    query += " ORDER BY display_order ASC, id DESC";

    const [rows] = await pool.query(query, params);
    return rows;
  },

  /**
   * Get single video item by ID
   */
  async getById(id) {
    await this.initTable();
    const [rows] = await pool.query(
      "SELECT * FROM video_items WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Insert new video item
   */
  async create({
    category = "Session",
    title,
    badge = "",
    description = "",
    parent_name = "",
    video_type = "link",
    video_url,
    thumbnail_url = "",
    display_order = 0,
  }) {
    await this.initTable();
    const [result] = await pool.query(
      `INSERT INTO video_items 
       (category, title, badge, description, parent_name, video_type, video_url, thumbnail_url, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category,
        title,
        badge,
        description,
        parent_name,
        video_type,
        video_url,
        thumbnail_url,
        display_order,
      ]
    );

    return {
      id: result.insertId,
      category,
      title,
      badge,
      description,
      parent_name,
      video_type,
      video_url,
      thumbnail_url,
      display_order,
    };
  },

  /**
   * Update video item details
   */
  async update(
    id,
    {
      category,
      title,
      badge,
      description,
      parent_name,
      video_type,
      video_url,
      thumbnail_url,
      display_order,
    }
  ) {
    await this.initTable();
    const [result] = await pool.query(
      `UPDATE video_items 
       SET category = COALESCE(?, category),
           title = COALESCE(?, title),
           badge = COALESCE(?, badge),
           description = COALESCE(?, description),
           parent_name = COALESCE(?, parent_name),
           video_type = COALESCE(?, video_type),
           video_url = COALESCE(?, video_url),
           thumbnail_url = COALESCE(?, thumbnail_url),
           display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [
        category,
        title,
        badge,
        description,
        parent_name,
        video_type,
        video_url,
        thumbnail_url,
        display_order,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  /**
   * Delete video item by ID
   */
  async delete(id) {
    await this.initTable();
    const [result] = await pool.query(
      "DELETE FROM video_items WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = VideoModel;
