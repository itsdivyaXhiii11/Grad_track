<<<<<<< HEAD
=======
const cors = require("cors");
>>>>>>> f3f1184 (LOR dashboard + API fixes + frontend integration)
const express = require("express");
const dotenv = require("dotenv");

// Load env variables
dotenv.config({ path: "../.env" });

// DB connection
const db = require("./db");

// Routes
const facultyRoutes = require("./routes/facultyRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const lorRoutes = require("./routes/lorRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// ================= ROUTES =================

// Health check
app.get("/", (req, res) => {
  res.send("🚀 GradTrack Backend Running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/lor", lorRoutes);

// ================= ERROR HANDLING =================

// 404 handler (VERY IMPORTANT 🔥)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});