const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

// SSL configuration for remote cloud MySQL (Aiven, Railway, TiDB, PlanetScale, AWS RDS)
const sslConfig =
  process.env.DB_SSL === "true"
    ? { rejectUnauthorized: false }
    : undefined;

// Create connection pool with serverless awareness
const poolConfig = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: process.env.VERCEL ? 5 : 10,
      ssl: sslConfig,
    }
  : {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "jtl_db",
      waitForConnections: true,
      connectionLimit: process.env.VERCEL ? 5 : 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      ssl: sslConfig,
    };

const pool = mysql.createPool(poolConfig);

/**
 * Test MySQL connection on server boot
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✓ Connected to MySQL database successfully.");
    connection.release();
    return true;
  } catch (error) {
    console.warn("⚠ MySQL connection notice:", error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
};
