const express = require("express");
const AnalyticsController = require("../controllers/analyticsController");

const router = express.Router();

// Real-time dashboard analytics & chart metrics
router.get("/dashboard", AnalyticsController.getDashboard);

module.exports = router;
