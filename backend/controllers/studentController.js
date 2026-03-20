const Student = require("../models/Student");

exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.json({ message: "Student created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await Student.findByIdAndDelete(id);

    res.status(200).json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};