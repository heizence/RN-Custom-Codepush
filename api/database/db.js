const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

// Create a connection pool (only one connection to the database is made and reused)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Wait for a connection if the pool is busy
  connectionLimit: 10, // Maximum number of connections to create at once
  queueLimit: 0, // No limit on the number of queued connection requests
});

// Promisify the pool's query method to work with async/await
const promisePool = pool.promise();

module.exports = promisePool;
