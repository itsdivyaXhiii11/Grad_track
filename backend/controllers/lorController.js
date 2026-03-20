const LORRequest = require("../models/LORRequest");

// Create LOR request
const createLOR = async (req, res) => {
  try {
    const newLOR = new LORRequest(req.body);
    await newLOR.save();

    res.json({ message: "LOR request created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLOR
};