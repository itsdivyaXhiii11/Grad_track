# GradTrack Database Schema

Database: MongoDB

## Collections

### 1. Students
Stores student details.

Fields:
- name
- usn
- email
- branch
- batch
- higherStudiesType (Abroad / Within Country)

---

### 2. Faculty
Stores faculty information.

Fields:
- name
- department
- designation
- email
- phone

---

### 3. LORRequests
Stores LOR request details.

Fields:
- studentId
- faculty1
- faculty2
- university
- course
- status (Pending / Approved / Rejected)

---

### 4. Applications
Tracks higher studies applications.

Fields:
- studentId
- university
- program
- country
- intake (Fall / Spring)
- status (Applied / Admit Received / Enrolled / Not pursuing)
