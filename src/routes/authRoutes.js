const express = require("express");
const AuthController = require("../controllers/authController");

const router = express.Router();

// Admin Login
router.post("/login", AuthController.login);

// Verify Token
router.get("/verify", AuthController.verify);

module.exports = router;
