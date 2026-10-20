const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const { testConnection, pool } = require("./src/config/db");

let PORT = Number(process.env.PORT) || 5001;

// Port 5000 is occupied by macOS AirPlay (AirTunes). Avoid 403 collision on Mac.
if (PORT === 5000) {
  console.warn("⚠️  Notice: Port 5000 is used by macOS AirPlay (AirTunes).");
  console.warn("   Automatically using port 5001 to avoid conflicts.");
  PORT = 5001;
}

async function startServer() {
  console.log("==========================================");
  console.log("Starting JTL Backend API Server...");
  console.log("==========================================");

  // Test database connection
  await testConnection();

  // Start HTTP Listener
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 JTL Server listening on http://0.0.0.0:${PORT}`);
    console.log(`🔐 Admin Login:  http://localhost:${PORT}/api/auth/login`);
    console.log(`👥 Team API:     http://localhost:${PORT}/api/team`);
    console.log(`🖼  Gallery API:  http://localhost:${PORT}/api/gallery`);
    console.log(`🎬 Videos API:   http://localhost:${PORT}/api/videos`);
    console.log(`📋 Test API:     http://localhost:${PORT}/api/test`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log("==========================================");
  });

  // Graceful Shutdown
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down...`);
    server.close(async () => {
      console.log("✓ HTTP server closed.");
      try {
        await pool.end();
        console.log("✓ MySQL connection pool drained.");
      } catch (err) {
        console.error("Error closing MySQL pool:", err.message);
      }
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer();
