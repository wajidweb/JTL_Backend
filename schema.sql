-- ============================================================
-- Journey Towards Life (JTL) - Complete Production Database Schema
-- Compatible with MySQL 5.7+ / MySQL 8.0+ / MariaDB
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 1. Table: team_members
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `role` VARCHAR(150) NOT NULL,
  `bio` TEXT NULL,
  `skills` VARCHAR(255) DEFAULT '',
  `whatsapp_number` VARCHAR(50) DEFAULT '',
  `profile_picture` VARCHAR(500) DEFAULT '',
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_team_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Table: gallery_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gallery_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Centre',
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_gallery_category` (`category`),
  INDEX `idx_gallery_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Table: video_items
-- Updated with 'Session', 'Family', and 'Message' categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `video_items` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `category` ENUM('Session', 'Family', 'Message') NOT NULL DEFAULT 'Session',
  `title` VARCHAR(255) NOT NULL,
  `badge` VARCHAR(100) NOT NULL DEFAULT '',
  `description` TEXT NULL,
  `parent_name` VARCHAR(150) DEFAULT '',
  `video_type` ENUM('upload', 'link') NOT NULL DEFAULT 'link',
  `video_url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500) DEFAULT '',
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_video_category` (`category`),
  INDEX `idx_video_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Upgrade existing table if it was created previously with older ENUM
ALTER TABLE `video_items` 
  MODIFY COLUMN `category` ENUM('Session', 'Family', 'Message') NOT NULL DEFAULT 'Session';

SET FOREIGN_KEY_CHECKS = 1;
