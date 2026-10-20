const jwt = require("jsonwebtoken");

const AuthController = {
  /**
   * POST /api/auth/login
   * Authenticate admin using credentials configured in environment variables (.env)
   */
  login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate inputs
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please enter both email and password.",
        });
      }

      // Read configured credentials strictly from environment variables (.env)
      const configuredEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
      const configuredPassword = process.env.ADMIN_PASSWORD || "";
      const adminName = process.env.ADMIN_NAME || "Administrator";
      const adminRole = process.env.ADMIN_ROLE || "super_admin";
      const jwtSecret = process.env.JWT_SECRET;
      const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

      // Safety checks: ensure required .env variables exist
      if (!configuredEmail || !configuredPassword) {
        console.error(
          "⚠️  Security Alert: ADMIN_EMAIL or ADMIN_PASSWORD is not set in backend/.env"
        );
        return res.status(500).json({
          success: false,
          message: "Admin authentication credentials are not configured in .env file.",
        });
      }

      if (!jwtSecret) {
        console.error(
          "⚠️  Security Alert: JWT_SECRET is not set in backend/.env"
        );
        return res.status(500).json({
          success: false,
          message: "JWT_SECRET is not configured in .env file.",
        });
      }

      const inputEmail = String(email).trim().toLowerCase();
      const inputPassword = String(password);

      // Verify credentials against environment variables
      if (inputEmail !== configuredEmail || inputPassword !== configuredPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password. Please check your credentials.",
        });
      }

      // Generate JWT Token strictly with process.env.JWT_SECRET
      const token = jwt.sign(
        {
          name: adminName,
          email: configuredEmail,
          role: adminRole,
        },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );

      return res.status(200).json({
        success: true,
        message: `Login successful. Welcome back, ${adminName}!`,
        token,
        user: {
          name: adminName,
          email: configuredEmail,
          role: adminRole,
        },
      });
    } catch (error) {
      console.error("Login controller error:", error);
      return res.status(500).json({
        success: false,
        message: "An internal server error occurred during login.",
      });
    }
  },

  /**
   * GET /api/auth/verify
   * Verify JWT token for authenticated requests
   */
  verify(req, res) {
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("⚠️  Security Alert: JWT_SECRET is not configured in .env");
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured in .env file.",
      });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      return res.status(200).json({
        success: true,
        user: decoded,
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or has expired.",
      });
    }
  },
};

module.exports = AuthController;
