const db = require("../db");
const bcrypt = require("bcryptjs");

// ================= LOGIN =================
exports.login = (req, res) => {
  const { email, password } = req.body;

  const query = "SELECT * FROM students WHERE email = ?";

  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // ❌ User not found
    if (results.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = results[0];

    let isMatch = false;

    try {
      // 🔥 Try bcrypt (future safe)
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      isMatch = false;
    }

    // 🔥 Fallback for plain passwords (your current DB)
    if (!isMatch) {
      if (password === user.password) {
        isMatch = true;
      }
    }

    // ❌ Wrong password
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ✅ Success
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        usn: user.usn,
        branch: user.branch,
        batch: user.batch_year
      }
    });
  });
};