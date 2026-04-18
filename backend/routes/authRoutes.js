const express = require("express");
const router = express.Router();
const db = require("../db");

// LOGIN ROUTE (MySQL)
router.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "DB error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];

    // ⚠️ Plain password check (for now)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Role check
    if (role && user.role !== role) {
      return res.status(403).json({ message: "Role mismatch" });
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

module.exports = router;