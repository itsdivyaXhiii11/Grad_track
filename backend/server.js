require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

// middleware FIRST
app.use(express.json());
app.use(cors());

//  routes
const lorRoutes = require("./routes/lorRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/lor", lorRoutes);
app.use("/api/auth", authRoutes);

// test route
app.get("/", (req, res) => {
  res.send("GradTrack Backend Running 🚀");
});

// ✅ start server AFTER everything
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