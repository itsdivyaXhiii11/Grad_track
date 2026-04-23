const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "gradtrack"
});

console.log("✅ MySQL connected successfully");

module.exports = db;