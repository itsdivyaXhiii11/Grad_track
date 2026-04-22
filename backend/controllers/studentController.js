const db = require("../db");

// ================= CREATE STUDENT =================
exports.createStudent = (req, res) => {
  const { name, email, usn, mobile, branch, batch_year, password } = req.body;

  const query = `
    INSERT INTO students (name, email, usn, mobile, branch, batch_year, password)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, email, usn, mobile, branch, batch_year, password],
    (err, result) => {
      if (err) {
        console.error("CREATE ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create student"
        });
      }

      res.status(201).json({
        success: true,
        message: "Student created successfully"
      });
    }
  );
};

// ================= GET STUDENTS =================
exports.getStudents = (req, res) => {
  const { batch, branch } = req.query;

  let query = "SELECT id, name, usn FROM students";
  let conditions = [];
  let values = [];

  if (batch) {
    conditions.push("batch_year = ?");
    values.push(batch);
  }

  if (branch) {
    conditions.push("branch = ?");
    values.push(branch);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY name ASC";

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("DB ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    res.status(200).json(results);
  });
};

// ================= GET ONE =================
exports.getStudentById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM students WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("GET ONE ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Database error"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    res.status(200).json(results[0]);
  });
};

// ================= UPDATE =================
exports.updateStudent = (req, res) => {
  const { id } = req.params;
  const { name, email, usn, mobile, branch, batch_year, password } = req.body;

  const query = `
    UPDATE students 
    SET name=?, email=?, usn=?, mobile=?, branch=?, batch_year=?, password=?
    WHERE id=?
  `;

  db.query(
    query,
    [name, email, usn, mobile, branch, batch_year, password, id],
    (err) => {
      if (err) {
        console.error("UPDATE ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update student"
        });
      }

      res.status(200).json({
        success: true,
        message: "Student updated successfully"
      });
    }
  );
};

// ================= DELETE =================
exports.deleteStudent = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM students WHERE id = ?", [id], (err) => {
    if (err) {
      console.error("DELETE ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to delete student"
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully"
    });
  });
};