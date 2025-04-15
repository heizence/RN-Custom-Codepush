const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Create a connection pool (only one connection to the database is made and reused)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Wait for a connection if the pool is busy
  connectionLimit: 10, // Maximum number of connections to create at once
  queueLimit: 0, // No limit on the number of queued connection requests
  multipleStatements: true,
});

async function getConnection() {
  return await pool.getConnection();
}

module.exports = { db: pool, getConnection };
