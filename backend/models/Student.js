const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  usn: {
    type: String,
    required: true,
    unique: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  branch: {
    type: String,
    required: true,
    enum: ["CSE","CSE-AIML","CSE-AIDS", "ECE", "ISE", "EEE"]
  },

  batch: {
    type: Number,
    required: true
  },

  higherStudiesType: {
    type: String,
    enum: ["Abroad", "Within Country"]
  }

});

module.exports = mongoose.model("Student", studentSchema);