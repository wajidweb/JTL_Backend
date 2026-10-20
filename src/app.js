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
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev
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

// Welcome / Root Endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Journey Towards Life (JTL) Backend API",
    status: "Running",
    testUrl: "/api/test",
    healthUrl: "/api/health",
  });
});

// API Routes Base
app.use("/api", apiRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
