const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 🔐 LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // 1️⃣ Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // 3️⃣ Optional: check role
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Role mismatch",
      });
    }

    // 4️⃣ Success
    return res.json({
      success: true,
      token: "dummy-token", // later JWT
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;