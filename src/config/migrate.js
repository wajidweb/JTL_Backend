const { pool, testConnection } = require("./db");

async function runMigration() {
  console.log("==========================================");
  console.log("Starting JTL Database Migration...");
  console.log("==========================================");

  const connected = await testConnection();
  if (!connected) {
    console.error("❌ Cannot connect to MySQL database. Please verify credentials in backend/.env.");
    process.exit(1);
  }

  try {
    // 1. Team Members Table
    console.log("⚙️  Migrating `team_members` table...");
    await pool.query(`
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
    `);
    console.log("   ✓ `team_members` table is ready.");

    // 2. Gallery Items Table
    console.log("⚙️  Migrating `gallery_items` table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`gallery_items\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`image_url\` VARCHAR(500) NOT NULL,
        \`category\` VARCHAR(100) DEFAULT 'Centre',
        \`display_order\` INT DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("   ✓ `gallery_items` table is ready.");

    // 3. Video Items Table (with 'Session', 'Family', 'Message' ENUM)
    console.log("⚙️  Migrating `video_items` table...");
    await pool.query(`
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
    `);

    // Ensure category column in video_items includes 'Message' even if table already existed
    try {
      await pool.query(`
        ALTER TABLE \`video_items\` 
        MODIFY COLUMN \`category\` ENUM('Session', 'Family', 'Message') NOT NULL DEFAULT 'Session';
      `);
      console.log("   ✓ `video_items` schema verified (category ENUM includes 'Session', 'Family', 'Message').");
    } catch (err) {
      console.warn("   ℹ Notice updating `video_items` category column:", err.message);
    }

    // Verify tables and print status
    const [tables] = await pool.query("SHOW TABLES;");
    const tableNames = tables.map((t) => Object.values(t)[0]);

    const [[{ teamCount }]] = await pool.query("SELECT COUNT(*) AS teamCount FROM `team_members`");
    const [[{ galleryCount }]] = await pool.query("SELECT COUNT(*) AS galleryCount FROM `gallery_items`");
    const [[{ videoCount }]] = await pool.query("SELECT COUNT(*) AS videoCount FROM `video_items`");

    console.log("\n==========================================");
    console.log("✓ Migration Completed Successfully!");
    console.log("Database tables present:", tableNames.join(", "));
    console.log(`- team_members:  ${teamCount} records`);
    console.log(`- gallery_items: ${galleryCount} records`);
    console.log(`- video_items:   ${videoCount} records`);
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
