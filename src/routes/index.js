const express = require("express");
const { pool } = require("../config/db");
const authRoutes = require("./authRoutes");
const teamRoutes = require("./teamRoutes");
const galleryRoutes = require("./galleryRoutes");
const videoRoutes = require("./videoRoutes");
const analyticsRoutes = require("./analyticsRoutes");

const router = express.Router();

// 1. Basic Health Check Route
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Journey Towards Life API",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// 2. Server & Database Test Route
router.get("/test", async (req, res) => {
  let dbStatus = "Disconnected";
  let dbDetails = null;

  try {
    const [rows] = await pool.query(
      "SELECT 1 + 1 AS calculation, DATABASE() as current_db, NOW() as db_time"
    );
    dbStatus = "Connected";
    dbDetails = rows[0];
  } catch (err) {
    dbStatus = `Connection Error: ${err.message}`;
  }

  res.json({
    success: true,
    message: "JTL Backend Server is up and running!",
    serverTime: new Date().toISOString(),
    database: {
      status: dbStatus,
      details: dbDetails,
    },
  });
});

// 3. Admin Authentication Route
router.use("/auth", authRoutes);

// 4. Team Members Management Route
router.use("/team", teamRoutes);

// 5. Gallery Photos Management Route
router.use("/gallery", galleryRoutes);

// 6. Video Sessions & Testimonials Management Route
router.use("/videos", videoRoutes);

// 7. Live Dashboard Analytics & Charts Metrics Route
router.use("/analytics", analyticsRoutes);

module.exports = router;
