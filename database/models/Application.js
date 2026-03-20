const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },

  university: {
    type: String
  },

  program: {
    type: String
  },

  country: {
    type: String
  },

  intake: {
    type: String,
    enum: ["Fall", "Spring"]
  },

  status: {
    type: String,
    enum: [
      "Applied",
      "Admit Received",
      "Enrolled",
      "Not pursuing"
    ]
  }

});

module.exports = mongoose.model("Application", applicationSchema);