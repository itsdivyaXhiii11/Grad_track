const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./db");

const facultyRoutes = require("./routes/facultyRoutes");
const lorRoutes = require("./routes/lorRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/lor", lorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", studentRoutes);
app.use("/api/faculty", facultyRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("GradTrack Backend Running ");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});