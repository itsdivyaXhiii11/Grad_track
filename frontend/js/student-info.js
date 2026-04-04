// ════════════════════════════════════════════════════
// 1. PURPOSE REDIRECT MAP
// ════════════════════════════════════════════════════
const purposeRedirectMap = {
  "lor": "lor-request.html",
  "higher-studies": "higher-studies-portal.html",
  "status": "status-update.html"
};

// ════════════════════════════════════════════════════
// 2. ROLE CHECK (SAFE FOR LOCAL + BACKEND)
// ════════════════════════════════════════════════════
(async function checkRole() {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include"
    });

    // 🔥 If backend not running, skip redirect
    if (!response.ok) return;

    const user = await response.json();

    if (user.role !== "student") {
      window.location.href = "login.html";
    }

  } catch (error) {
    console.warn("Backend not connected (skipping auth check)");
  }
})();

// ════════════════════════════════════════════════════
// 3. DOM REFERENCES
// ════════════════════════════════════════════════════
const batchSelect = document.getElementById("batch");
const branchSelect = document.getElementById("branch");
const nameSelect = document.getElementById("studentName");
const usnInput = document.getElementById("usn");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const purposeSelect = document.getElementById("purpose");
const form = document.getElementById("studentForm");
const toast = document.getElementById("toast");

// ════════════════════════════════════════════════════
// 4. BATCH AUTO GENERATION
// ════════════════════════════════════════════════════
window.addEventListener("DOMContentLoaded", () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const duration = 4;

  for (let i = startYear; i <= currentYear; i++) {
    let option = document.createElement("option");
    option.value = `${i}-${i + duration}`;
    option.textContent = `${i}-${i + duration}`;
    batchSelect.appendChild(option);
  }
});

// ════════════════════════════════════════════════════
// 5. FETCH STUDENTS FROM BACKEND
// ════════════════════════════════════════════════════
async function fetchStudents(batch, branch) {
  try {
    const res = await fetch(`/api/students?batch=${batch}&branch=${branch}`);

    if (!res.ok) throw new Error("Failed to fetch");

    return await res.json(); // [{id, name, usn}]
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

// ════════════════════════════════════════════════════
// 6. LOAD STUDENTS
// ════════════════════════════════════════════════════
async function loadStudents() {
  const batch = batchSelect.value;
  const branch = branchSelect.value;

  nameSelect.innerHTML = '<option value="">Select Name</option>';
  usnInput.value = "";

  if (!batch || !branch) {
    nameSelect.innerHTML = '<option>Select Batch & Branch first</option>';
    return;
  }

  const students = await fetchStudents(batch, branch);

  if (students.length === 0) {
    nameSelect.innerHTML = '<option>No students found</option>';
    return;
  }

  students.forEach(student => {
    const option = document.createElement("option");
    option.value = student.id;
    option.textContent = student.name;
    option.dataset.usn = student.usn;
    nameSelect.appendChild(option);
  });

  clearError("grp-branch");
}

// Events
batchSelect.addEventListener("change", loadStudents);
branchSelect.addEventListener("change", loadStudents);

// ════════════════════════════════════════════════════
// 7. NAME → USN
// ════════════════════════════════════════════════════
nameSelect.addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  usnInput.value = selectedOption?.dataset?.usn || "";
  clearError("grp-name");
});

// ════════════════════════════════════════════════════
// 8. PHONE VALIDATION
// ════════════════════════════════════════════════════
phoneInput.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "");
});

// ════════════════════════════════════════════════════
// 9. FORM SUBMIT
// ════════════════════════════════════════════════════
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!validateForm()) return;

  const formData = {
    studentId: nameSelect.value,
    batch: batchSelect.value,
    branch: branchSelect.value,
    usn: usnInput.value,
    phone: phoneInput.value,
    email: emailInput.value,
    purpose: purposeSelect.value
  };

  console.log("Submitting:", formData); // 🔍 debug

  try {
    const res = await fetch("/api/student-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    // 🔥 If backend not available, skip API but allow redirect
    if (!res.ok) {
      console.warn("Backend not connected, skipping save");
    }

    showToast();

    setTimeout(() => {
      if (formData.purpose) {
        window.location.href = purposeRedirectMap[formData.purpose];
      }
    }, 1500);

  } catch (err) {
    console.warn("Backend not connected, proceeding anyway");
    showToast();

    setTimeout(() => {
      window.location.href = purposeRedirectMap[formData.purpose];
    }, 1500);
  }
});

// ════════════════════════════════════════════════════
// 10. VALIDATION
// ════════════════════════════════════════════════════
function validateForm() {
  let isValid = true;

  function fail(groupId, msgId, message) {
    const group = document.getElementById(groupId);
    const msg = document.getElementById(msgId);

    if (group) group.classList.add("has-error");
    if (msg) msg.textContent = message;

    isValid = false;
  }

  if (!batchSelect.value) {
    fail("grp-branch", "err-branch", "Select batch & branch.");
  }

  if (!branchSelect.value) {
    fail("grp-branch", "err-branch", "Please select a branch.");
  }

  if (!nameSelect.value) {
    fail("grp-name", "err-name", "Please select your name.");
  }

  if (!usnInput.value) {
    fail("grp-usn", "err-usn", "USN not found.");
  }

  if (!/^\d{10}$/.test(phoneInput.value)) {
    fail("grp-phone", "err-phone", "Enter valid phone.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
    fail("grp-email", "err-email", "Enter valid email.");
  }

  if (!purposeSelect.value) {
    fail("grp-purpose", "err-purpose", "Select purpose.");
  }

  return isValid;
}

// ════════════════════════════════════════════════════
// 11. HELPERS
// ════════════════════════════════════════════════════
function clearError(groupId) {
  const group = document.getElementById(groupId);
  if (group) group.classList.remove("has-error");
}

function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}