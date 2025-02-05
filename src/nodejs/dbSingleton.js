// dbSingleton.js
const mysql = require('mysql2');

// Configure your database connection credentials
const config = {
  host: 'localhost', // Use just "localhost" (do not include a URL or phpMyAdmin path)
  port: 5001,
  user: 'root',
  password: 'FinalProject_db',
  database: 'users', // Ensure this database exists in your MySQL instance
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create a connection pool
const pool = mysql.createPool(config);

// Export the pool so it can be used throughout your application
module.exports = pool;
