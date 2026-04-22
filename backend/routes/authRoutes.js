const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs"); // future use
const jwt = require("jsonwebtoken"); // future use

// ==========================================
// 🔐 LOGIN (STUDENT - MySQL)
// ==========================================
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  const query = "SELECT * FROM students WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    const user = results[0];

    // ==========================================
    // ⚠️ CURRENT: Plain password (your DB = 123456)
    // FUTURE: Switch to bcrypt
    // ==========================================
    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // ==========================================
    // 🔐 TOKEN (Future-ready)
    // ==========================================
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: "student"
      },
      "secretkey", // later move to .env
      { expiresIn: "1d" }
    );

    // ==========================================
    // ✅ SUCCESS RESPONSE
    // ==========================================
    res.status(200).json({
      success: true,
      message: "Login successful",
      token, // useful later
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        usn: user.usn,
        branch: user.branch,
        batch: user.batch_year,
        role: "student" // 🔥 fixed
      }
    });
  });
});

// ==========================================
// 🔐 CURRENT USER (OPTIONAL - FUTURE READY)
// ==========================================
router.get("/me", (req, res) => {
  res.json({
    success: true,
    message: "User route working"
  });
});

module.exports = router;