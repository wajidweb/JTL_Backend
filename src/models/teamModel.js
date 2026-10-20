const { pool } = require("../config/db");

const TeamModel = {
  /**
   * Automatically ensure team_members table exists in MySQL
   */
  async initTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS \`team_members\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(150) NOT NULL,
        \`role\` VARCHAR(150) NOT NULL,
        \`bio\` TEXT,
        \`skills\` VARCHAR(255) DEFAULT '',
        \`whatsapp_number\` VARCHAR(50) DEFAULT '',
        \`profile_picture\` VARCHAR(500) DEFAULT '',
        \`display_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(sql);
  },

  /**
   * Get all team members ordered by display_order ASC, id ASC
   */
  async getAll() {
    await this.initTable();
    const [rows] = await pool.query(
      "SELECT * FROM team_members ORDER BY display_order ASC, id ASC"
    );
    return rows;
  },

  /**
   * Get single team member by ID
   */
  async getById(id) {
    await this.initTable();
    const [rows] = await pool.query(
      "SELECT * FROM team_members WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Insert new team member
   */
  async create({
    name,
    role,
    bio = "",
    skills = "",
    whatsapp_number = "",
    profile_picture = "",
    display_order = 0,
  }) {
    await this.initTable();
    const [result] = await pool.query(
      `INSERT INTO team_members 
       (name, role, bio, skills, whatsapp_number, profile_picture, display_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, role, bio, skills, whatsapp_number, profile_picture, display_order]
    );

    return {
      id: result.insertId,
      name,
      role,
      bio,
      skills,
      whatsapp_number,
      profile_picture,
      display_order,
    };
  },

  /**
   * Update existing team member
   */
  async update(
    id,
    { name, role, bio, skills, whatsapp_number, profile_picture, display_order }
  ) {
    await this.initTable();

    const [result] = await pool.query(
      `UPDATE team_members 
       SET name = COALESCE(?, name),
           role = COALESCE(?, role),
           bio = COALESCE(?, bio),
           skills = COALESCE(?, skills),
           whatsapp_number = COALESCE(?, whatsapp_number),
           profile_picture = COALESCE(?, profile_picture),
           display_order = COALESCE(?, display_order)
       WHERE id = ?`,
      [
        name,
        role,
        bio,
        skills,
        whatsapp_number,
        profile_picture,
        display_order,
        id,
      ]
    );

    return result.affectedRows > 0;
  },

  /**
   * Delete team member by ID
   */
  async delete(id) {
    await this.initTable();
    const [result] = await pool.query(
      "DELETE FROM team_members WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = TeamModel;
