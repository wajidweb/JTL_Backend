const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const apiRoutes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

const app = express();

// Security Headers (configured to allow cross-origin image loading for uploads)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// CORS Configuration
const getAllowedOrigins = () => {
  const defaults = [
    "https://jtl-swat.com",
    "https://www.jtl-swat.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  if (process.env.CLIENT_URL) {
    const custom = process.env.CLIENT_URL.split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    defaults.push(...custom);
  }

  return defaults;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      const allowed = getAllowedOrigins();

      // Check direct list or jtl-swat.com domain/subdomains
      const isAllowed =
        allowed.includes(origin) ||
        origin.endsWith("jtl-swat.com") ||
        process.env.NODE_ENV !== "production";

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Request Parsing (configured for high file size payloads)
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// HTTP Request Logger (in development)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Serve Static Uploads Directory (local and Vercel /tmp)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
if (process.env.VERCEL) {
  app.use("/uploads", express.static("/tmp/uploads"));
}

// Welcome / Root Endpoint (Immediate 200 OK for Hostinger/Cloud health checks)
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Journey Towards Life (JTL) Backend API is running!",
    status: "healthy",
    testUrl: "/api/test",
    healthUrl: "/health",
  });
});

// Direct Health Check Endpoint (returns 200 OK without /api prefix)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Journey Towards Life API",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

// API Routes Base
app.use("/api", apiRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
