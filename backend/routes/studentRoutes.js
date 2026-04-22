const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const { batch, branch } = req.query;

  let query = "SELECT id, name, usn FROM students WHERE 1=1";
  let values = [];

  if (batch) {
    query += " AND batch_year = ?";
    values.push(batch);
  }

  if (branch) {
    query += " AND branch = ?";
    values.push(branch);
  }

  query += " ORDER BY name ASC";

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ error: err.message });
    }

    // 🔥 IF NO DATA → RETURN ALL STUDENTS
    if (results.length === 0) {
      console.log("⚠️ No data for filter → sending ALL students");

      db.query(
        "SELECT id, name, usn FROM students ORDER BY name ASC",
        (err2, allResults) => {
          if (err2) {
            return res.status(500).json({ error: err2.message });
          }
          return res.status(200).json(allResults);
        }
      );
    } else {
      res.status(200).json(results);
    }
  });
});

module.exports = router;