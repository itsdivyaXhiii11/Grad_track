const db = require("../db");

// ===============================
// GET ALL LOR REQUESTS
// ===============================
exports.getAllLOR = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        l.id,
        l.status,
        l.request_date,
        l.university,
        l.country,
        l.course,

        f1.name AS faculty1_name,
        f2.name AS faculty2_name,

        s.name AS studentName,
        s.usn,
        s.branch

      FROM lor_requests l
      JOIN faculty f1 ON l.faculty1_id = f1.id
      JOIN faculty f2 ON l.faculty2_id = f2.id
      JOIN students s ON l.student_id = s.id
      ORDER BY l.request_date DESC
    `);

    const formatted = rows.map(r => ({
      id: r.id,
      faculty: `${r.faculty1_name}, ${r.faculty2_name}`,
      purpose: r.course,
      abroad: r.country !== "India",
      university: r.university,
      submittedAt: r.request_date,
      status: r.status,
      studentName: r.studentName,
      usn: r.usn,
      branch: r.branch
    }));

    res.json({ success: true, data: formatted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===============================
// CREATE LOR
// ===============================
exports.createLOR = async (req, res) => {
  try {
    const {
      student_id,
      faculty1_id,
      faculty2_id,
      university,
      country,
      course
    } = req.body;

    const query = `
      INSERT INTO lor_requests 
      (student_id, faculty1_id, faculty2_id, university, country, course)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      student_id,
      faculty1_id,
      faculty2_id,
      university,
      country,
      course
    ]);

    res.json({ success: true, message: "LOR request created successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};