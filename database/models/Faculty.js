const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  department: {
    type: String,
    required: true
  },

  designation: {
    type: String
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: {
    type: String,
    required: true
  }

});

module.exports = mongoose.model("Faculty", facultySchema);