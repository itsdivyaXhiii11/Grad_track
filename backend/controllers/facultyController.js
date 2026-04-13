const db = require("../db");

exports.getAllFaculty = (req, res) => {
  db.query("SELECT id, name FROM faculty", (err, results) => {
    if (err) {
      console.error("ERROR:", err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(results);
  });
};