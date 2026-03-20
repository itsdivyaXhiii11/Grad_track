const LORRequest = require("../models/LORRequest");


// ✅ Create LOR request (Student)
const createLOR = async (req, res) => {
  try {
    const { student, faculty, purpose, university, description } = req.body;

    if (!student || !faculty || !purpose || !university) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newLOR = await LORRequest.create({
      student,
      faculty,
      purpose,
      university,
      description,
    });

    res.json({
      message: "LOR request created successfully",
      data: newLOR,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get all LORs (Admin / Faculty dashboard)
const getAllLORs = async (req, res) => {
  try {
    const lors = await LORRequest.find()
      .populate("student", "name email")
      .populate("faculty", "name email");

    res.json(lors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get LORs by student
const getStudentLORs = async (req, res) => {
  try {
    const { studentId } = req.params;

    const lors = await LORRequest.find({ student: studentId })
      .populate("faculty", "name email");

    res.json(lors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get LORs assigned to faculty
const getFacultyLORs = async (req, res) => {
  try {
    const { facultyId } = req.params;

    const lors = await LORRequest.find({ faculty: facultyId })
      .populate("student", "name email");

    res.json(lors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// ✅ Update status (Faculty approves/rejects)
const updateLORStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedLOR = await LORRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    res.json({
      message: "Status updated",
      data: updatedLOR,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createLOR,
  getAllLORs,
  getStudentLORs,
  getFacultyLORs,
  updateLORStatus,
};