const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// CREATE
router.post("/students", studentController.createStudent);

// READ ALL
router.get("/students", studentController.getStudents);

// READ ONE
router.get("/students/:id", studentController.getStudentById);

// UPDATE
router.put("/students/:id", studentController.updateStudent);

// DELETE
router.delete("/students/:id", studentController.deleteStudent);

module.exports = router;