const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123", // change if you set password
  database: "gradtrack"
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed", err);
  } else {
    console.log("MySQL connected");
  }
});

module.exports = db;