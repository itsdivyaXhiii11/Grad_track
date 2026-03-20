const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const lorRoutes = require("./routes/lorRoutes");
const studentRoutes = require("./routes/studentRoutes");

dotenv.config({ path: "../.env" });
const PORT = process.env.PORT || 3001;

const app = express();

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

app.use(express.json());
app.use(cors());

app.use("/api", lorRoutes);
app.use("/api", studentRoutes);

app.get("/", (req, res) => {
  res.send("GradTrack Backend Running 🚀");
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);



