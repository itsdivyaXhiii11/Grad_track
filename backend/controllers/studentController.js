const db = require("../db");

// CREATE STUDENT
exports.createStudent = (req, res) => {
  const { name, email, usn, mobile, branch, batch_year, password } = req.body;

  const query = `
    INSERT INTO students (name, email, usn, mobile, branch, batch_year, password)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [name, email, usn, mobile, branch, batch_year, password], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Student created" });
  });
};

// GET ALL STUDENTS
exports.getStudents = (req, res) => {
  const { batch, branch } = req.query;

    console.log("Query params:", batch, branch);

  let query = "SELECT id, name, usn FROM students WHERE 1=1";
  let values = [];

  if (batch) {
    query += " AND batch_year = ?";
    values.push(batch);
  }

  if (branch) {
    query += " AND branch = ?";
    values.push(branch);
  }

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("DB ERROR:", err);  // 👈 ADD THIS
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

// GET ONE STUDENT
exports.getStudentById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM students WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(results[0]);
  });
};

// UPDATE STUDENT
exports.updateStudent = (req, res) => {
  const { id } = req.params;
  const { name, email, usn, mobile, branch, batch_year, password } = req.body;

  const query = `
    UPDATE students 
    SET name=?, email=?, usn=?, mobile=?, branch=?, batch_year=?, password=?
    WHERE id=?
  `;

  db.query(query, [name, email, usn, mobile, branch, batch_year, password, id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Updated successfully" });
  });
};

// DELETE STUDENT
exports.deleteStudent = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM students WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Deleted successfully" });
  });
};