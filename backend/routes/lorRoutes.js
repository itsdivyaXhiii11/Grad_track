const express = require("express");
const router = express.Router();

const {
  createLOR,
  getAllLORs,
  getStudentLORs,
  getFacultyLORs,
  updateLORStatus,
} = require("../controllers/lorController");

// ===============================
// LOR ROUTES
// ===============================

//  Create LOR request
router.post("/create", createLOR);

//  Get all LORs
router.get("/", getAllLORs);

//  Get LORs by student
router.get("/student/:studentId", getStudentLORs);

//  Get LORs by faculty
router.get("/faculty/:facultyId", getFacultyLORs);

// Update LOR status
router.put("/:id", updateLORStatus);

module.exports = router;