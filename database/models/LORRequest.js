const mongoose = require("mongoose");

const lorRequestSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },

  faculty1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty"
  },

  faculty2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Faculty"
  },

  university: {
    type: String
  },

  course: {
    type: String
  },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("LORRequest", lorRequestSchema);