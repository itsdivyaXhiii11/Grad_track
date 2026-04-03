/**
 * student-details.js
 * ─────────────────────────────────────────────────────
 * Handles all logic for the Student Details page:
 *   • Role-based access guard (redirect if not a student)
 *   • Dynamic Name dropdown based on selected Branch
 *   • Auto-fill USN when a student name is chosen
 *   • Pre-fill Email from API (fetched on page load)
 *   • Form validation (phone, email, required fields)
 *   • Save data via API POST and redirect by Purpose
 * ─────────────────────────────────────────────────────
 */

// ════════════════════════════════════════════════════
//  1. SAMPLE STUDENT DATA  (replace with real data or API later)
//     Structure: { BRANCH: [ { name, usn }, … ] }
// ════════════════════════════════════════════════════

const studentData = {
  CSE: [
    { name: "Aarav Sharma",    usn: "1SI21CS001" },
    { name: "Bhavya Nair",     usn: "1SI21CS002" },
    { name: "Chirag Patel",    usn: "1SI21CS003" },
    { name: "Divya Menon",     usn: "1SI21CS004" },
    { name: "Esha Reddy",      usn: "1SI21CS005" },
  ],
  ISE: [
    { name: "Farhan Khan",     usn: "1SI21IS001" },
    { name: "Geetha Rao",      usn: "1SI21IS002" },
    { name: "Harshit Joshi",   usn: "1SI21IS003" },
    { name: "Ishita Desai",    usn: "1SI21IS004" },
    { name: "Jayesh Kumar",    usn: "1SI21IS005" },
  ],
  ECE: [
    { name: "Kavya Shetty",    usn: "1SI21EC001" },
    { name: "Lokesh Bhat",     usn: "1SI21EC002" },
    { name: "Meera Iyer",      usn: "1SI21EC003" },
    { name: "Nikhil Verma",    usn: "1SI21EC004" },
    { name: "Ojasvi Singh",    usn: "1SI21EC005" },
  ],
  MECH: [
    { name: "Pranav Kulkarni", usn: "1SI21ME001" },
    { name: "Qureshi Aman",    usn: "1SI21ME002" },
    { name: "Rohit Nayak",     usn: "1SI21ME003" },
    { name: "Sneha Pillai",    usn: "1SI21ME004" },
    { name: "Tejas Gowda",     usn: "1SI21ME005" },
  ],
  CIVIL: [
    { name: "Uma Prasad",      usn: "1SI21CV001" },
    { name: "Vishal Hegde",    usn: "1SI21CV002" },
    { name: "Wasim Akram",     usn: "1SI21CV003" },
    { name: "Xena D'Souza",    usn: "1SI21CV004" },
    { name: "Yashvi Pandey",   usn: "1SI21CV005" },
  ],
};

// ════════════════════════════════════════════════════
//  2. PURPOSE → REDIRECT MAP
// ════════════════════════════════════════════════════
const purposeRedirectMap = {
  "lor":           "lor-request.html",
  "higher-studies":"higher-studies.html",
  "status":        "student-details.html",
};

// ════════════════════════════════════════════════════
//  3. ROLE GUARD
//  ⚡ CHANGED: Replaced localStorage.getItem("userRole")
//     with a fetch call to GET /api/auth/me.
//     The API should return a JSON object: { role, email }
//     Redirect to index.html if role is not "student".
// ════════════════════════════════════════════════════
(async function checkRole() {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",           // sends session cookie automatically
    });

    if (!response.ok) {
      // Server returned 401/403 — not logged in at all
      window.location.href = "index.html";
      return;
    }

    const user = await response.json();  // expects: { role: "student", email: "..." }

    if (user.role !== "student") {
      alert("Access denied. Please log in as a student.");
      window.location.href = "index.html";
    }

  } catch (error) {
    // Network error or server down
    console.error("Role check failed:", error);
    alert("Could not verify session. Please log in again.");
    window.location.href = "index.html";
  }
})();

// ════════════════════════════════════════════════════
//  4. DOM REFERENCES  (grabbed once, reused everywhere)
// ════════════════════════════════════════════════════
const branchSelect      = document.getElementById("branch");
const nameSelect        = document.getElementById("studentName");
console.log(branchSelect, nameSelect);
const usnInput          = document.getElementById("usn");
const phoneInput        = document.getElementById("phone");
const emailInput        = document.getElementById("email");
const form              = document.getElementById("studentForm");
const toast             = document.getElementById("toast");

// ════════════════════════════════════════════════════
//  5. PRE-FILL EMAIL FROM API
//  ⚡ CHANGED: Replaced localStorage.getItem("userEmail")
//     with a fetch call to GET /api/auth/me.
//     The same endpoint used in Section 3 returns the email.
//     We reuse it here to populate the email field on load.
// ════════════════════════════════════════════════════
(async function prefillEmail() {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",           // sends session cookie automatically
    });

    if (!response.ok) return;           // silently skip if not logged in

    const user = await response.json(); // expects: { role: "student", email: "..." }

    if (user.email) {
      emailInput.value = user.email;
    }

  } catch (error) {
    // Non-critical: email field stays empty, user can type manually
    console.error("Email prefill failed:", error);
  }
})();

// ════════════════════════════════════════════════════
//  6. BRANCH → NAME  (dynamic dropdown population)
// ════════════════════════════════════════════════════
branchSelect.addEventListener("change", function () {
  const selectedBranch = this.value;

  // Reset name and USN whenever branch changes
  usnInput.value = "";
  nameSelect.innerHTML = ""; // clear old options

  if (!selectedBranch) {
    // No branch chosen: show placeholder
    nameSelect.innerHTML = '<option value="">Select Branch First</option>';
    return;
  }

  // Add default placeholder option
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select Name";
  nameSelect.appendChild(placeholder);

  // Populate options from studentData for the chosen branch
  const students = studentData[selectedBranch] || [];
  students.forEach(function (student) {
    const option = document.createElement("option");
    option.value = student.name;          // value = name (used to look up USN)
    option.textContent = student.name;
    nameSelect.appendChild(option);
  });

  // Clear any lingering error on branch/name
  clearError("grp-branch");
  clearError("grp-name");
});

// ════════════════════════════════════════════════════
//  7. NAME → USN  (auto-fill USN based on selection)
// ════════════════════════════════════════════════════
nameSelect.addEventListener("change", function () {
  const selectedName   = this.value;
  const selectedBranch = branchSelect.value;

  if (!selectedName || !selectedBranch) {
    usnInput.value = "";
    return;
  }

  // Find the student object whose name matches the selection
  const students   = studentData[selectedBranch] || [];
  const found      = students.find(s => s.name === selectedName);
  usnInput.value   = found ? found.usn : "";

  clearError("grp-name");
  clearError("grp-usn");
});

// ════════════════════════════════════════════════════
//  8. PHONE: allow only numeric input (UX helper)
// ════════════════════════════════════════════════════
phoneInput.addEventListener("input", function () {
  // Strip any non-digit characters as the user types
  this.value = this.value.replace(/\D/g, "");
  clearError("grp-phone");
});

// ════════════════════════════════════════════════════
//  9. REAL-TIME EMAIL VALIDATION (clear error on fix)
// ════════════════════════════════════════════════════
emailInput.addEventListener("input", function () {
  clearError("grp-email");
});

// ════════════════════════════════════════════════════
//  10. FORM SUBMISSION
//  ⚡ CHANGED: Replaced all localStorage.setItem() calls
//     with a single fetch POST to /api/student/details.
//     - Handler is now async to support await.
//     - Redirect now happens inside .then() after a
//       successful API response, instead of a plain
//       setTimeout. The 1.5s toast delay is preserved.
//     - On API error, a user-facing alert is shown and
//       the page does NOT redirect.
//  ✅ UNCHANGED: validateForm() call, formData object,
//     purposeRedirectMap lookup, showToast() call,
//     event.preventDefault(), variable names.
// ════════════════════════════════════════════════════
form.addEventListener("submit", async function (event) {
  event.preventDefault(); // stop default browser submit

  // --- Run validation; stop if any field fails ---
  if (!validateForm()) return;

  // --- Collect values ---
  const formData = {
    batch:   document.getElementById("batch").value,
    branch:  branchSelect.value,
    name:    nameSelect.value,
    usn:     usnInput.value,
    phone:   phoneInput.value,
    email:   emailInput.value,
    purpose: document.getElementById("purpose").value,
  };

  // ── ⚡ CHANGED: was localStorage.setItem() × 6 ──────
  // Send all form data to the backend as a single POST request.
  // The server should save the record and return { success: true }.
  try {
    const response = await fetch("/api/student/details", {
      method: "POST",
      credentials: "include",           // sends session cookie automatically
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),   // sends: batch, branch, name, usn, phone, email, purpose
    });

    if (!response.ok) {
      // Server returned an error status (400, 500, etc.)
      const errorData = await response.json().catch(() => ({}));
      const message   = errorData.message || "Submission failed. Please try again.";
      alert(message);
      return;                           // stop here — do not redirect
    }

    // ── Success: show toast then redirect (same 1.5s delay as before) ──
    showToast();
    setTimeout(function () {
      const redirectTo = purposeRedirectMap[formData.purpose];
      window.location.href = redirectTo;
    }, 1500);

  } catch (error) {
    // Network error or server unreachable
    console.error("Form submission failed:", error);
    alert("Network error. Please check your connection and try again.");
  }
  // ── end of changed block ─────────────────────────────
});

// ════════════════════════════════════════════════════
//  11. VALIDATION LOGIC
// ════════════════════════════════════════════════════
function validateForm() {
  let isValid = true;

  // Helper: mark a group as errored
  function fail(groupId, msgId, message) {
    const group = document.getElementById(groupId);
    const msg   = document.getElementById(msgId);
    group.classList.add("has-error");
    if (msg) msg.textContent = message;
    isValid = false;
  }
}

 
// --- Batch ---
window.onload = function () {
  const batchSelect = document.getElementById("batch");

  if (!batchSelect) {
    console.error("Batch dropdown not found!");
    return;
  }

  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const duration = 4;

  for (let i = startYear; i <= currentYear; i++) {
    let option = document.createElement("option");
    option.value = `${i}-${i + duration}`;
    option.textContent = `${i}-${i + duration}`;
    batchSelect.appendChild(option);
  }

  console.log("Batch loaded successfully");
};


// ✅ Validation function
function validateForm() {
  let isValid = true;

  if (!branchSelect.value) {
    fail("grp-branch", "err-branch", "Please select a branch.");
    isValid = false;
  }

  if (!nameSelect.value) {
    fail("grp-name", "err-name", "Please select your name.");
    isValid = false;
  }

  if (!usnInput.value) {
    fail("grp-usn", "err-usn", "USN could not be resolved.");
    isValid = false;
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneInput.value)) {
    fail("grp-phone", "err-phone", "Enter a valid phone number.");
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value.trim())) {
    fail("grp-email", "err-email", "Enter a valid email.");
    isValid = false;
  }

  if (!document.getElementById("purpose").value) {
    fail("grp-purpose", "err-purpose", "Please select a purpose.");
    isValid = false;
  }

  return isValid; // ✅ correct
}

  // --- Branch ---
  if (!branchSelect.value) {
    fail("grp-branch", "err-branch", "Please select a branch.");
  }

  // --- Name ---
  if (!nameSelect.value) {
    fail("grp-name", "err-name", "Please select your name.");
  }

  // --- USN (should be auto-filled; just a safety check) ---
  if (!usnInput.value) {
    fail("grp-usn", "err-usn", "USN could not be resolved. Re-select your name.");
  }

  // --- Phone: exactly 10 digits ---
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phoneInput.value)) {
    fail("grp-phone", "err-phone", "Enter a valid 10-digit phone number.");
  }

  // --- Email: basic format check ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value.trim())) {
    fail("grp-email", "err-email", "Enter a valid email address.");
  }

  //--purpose--
 if (!document.getElementById("purpose").value) { 
  fail("grp-purpose", "err-purpose", "Please select a purpose.");
      
  
  return isValid;
 }

// ════════════════════════════════════════════════════
//  12. HELPER: clear error state from a form group
// ════════════════════════════════════════════════════
function clearError(groupId) {
  const group = document.getElementById(groupId);
  if (group) group.classList.remove("has-error");
}

// ════════════════════════════════════════════════════
//  13. HELPER: show the success toast
// ════════════════════════════════════════════════════
function showToast() {
  toast.classList.add("show");
  setTimeout(function () {
    toast.classList.remove("show");
  }, 3000);
}