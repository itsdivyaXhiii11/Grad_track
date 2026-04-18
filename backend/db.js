const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",        
  password: "0211",        
  database: "gradtrack"
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed", err);
  } else {
    console.log("✅ MySQL connected successfully");
  }
});

module.exports = db;