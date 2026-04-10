const mysql = require("mysql2");
require("dotenv").config({ path: "../.env" });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Debug (remove later)
console.log("DB USER:", process.env.DB_USER);
console.log("DB PASS:", process.env.DB_PASSWORD);

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed", err);
  } else {
    console.log("✅ MySQL connected successfully");
  }
});

module.exports = db;