const db = require("../db");

exports.getAllFaculty = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM faculty");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};