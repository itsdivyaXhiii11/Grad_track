require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(cors());

// ===============================
// Routes
// ===============================
const lorRoutes = require("./routes/lorRoutes");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");

app.use("/api/lor", lorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", studentRoutes);

// ===============================
// Test Route
// ===============================
app.get("/", (req, res) => {
  res.send("GradTrack Backend Running 🚀");
});

// ===============================
// Start Server
// ===============================
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

startServer();