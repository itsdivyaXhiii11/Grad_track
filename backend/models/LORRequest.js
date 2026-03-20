const mongoose = require("mongoose");

const lorSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    purpose: {
      type: String,
      required: true,
    },

    university: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    documentUrl: {
      type: String, // later for PDF / upload
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LOR", lorSchema);