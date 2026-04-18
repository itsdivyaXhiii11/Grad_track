// ================= IMPORT =================
// import { apiCall } from "./api.js";

// ================= DOM =================
const batchSelect = document.getElementById("batch");
const branchSelect = document.getElementById("branch");
const nameSelect = document.getElementById("studentName");
const usnInput = document.getElementById("usn");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const purposeSelect = document.getElementById("purpose");
const form = document.getElementById("studentForm");
const toast = document.getElementById("toast");

// ================= BATCH AUTO =================
window.addEventListener("DOMContentLoaded", () => {
  const currentYear = new Date().getFullYear();

  for (let i = 2016; i <= currentYear; i++) {
    const opt = document.createElement("option");
    opt.value = `${i}-${i + 4}`;
    opt.textContent = `${i}-${i + 4}`;
    batchSelect.appendChild(opt);
  }
});

// ================= FETCH STUDENTS =================
async function fetchStudents(batch, branch) {
  try {
    const res = await fetch(`http://localhost:3001/api/students?batch=${batch}&branch=${branch}`);

    if (!res.ok) throw new Error("Backend error");

    const data = await res.json();

    if (!Array.isArray(data)) throw new Error("Not array");

    return data;

  } catch (err) {
    console.warn("⚠️ Backend not ready → using MOCK DATA");

    return [
      { id: 1, name: "Divyanshi Singh", usn: "4XX22CS001" },
      { id: 2, name: "Test Student", usn: "4XX22CS002" }
    ];
  }
}

// ================= LOAD STUDENTS =================
async function loadStudents() {
  const batch = batchSelect.value;
  const branch = branchSelect.value;

  nameSelect.innerHTML = '<option value="">Select Name</option>';
  usnInput.value = "";

  if (!batch || !branch) return;

  const students = await fetchStudents(batch, branch);

  students.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = s.name;
    opt.dataset.usn = s.usn;
    nameSelect.appendChild(opt);
  });
}

// Events
batchSelect.addEventListener("change", loadStudents);
branchSelect.addEventListener("change", loadStudents);

// ================= NAME → USN (🔥 UPDATED LOGIC) =================
nameSelect.addEventListener("change", () => {
  const selected = nameSelect.options[nameSelect.selectedIndex];
  const originalUSN = selected?.dataset?.usn || "";

  const batch = batchSelect.value;
  const branch = branchSelect.value;

  if (!batch || !branch || !originalUSN) {
    usnInput.value = "";
    return;
  }

  // 🔹 Extract year (2018 → 18)
  const startYear = batch.split("-")[0].slice(-2);

  // 🔹 Branch mapping
  const branchMap = {
    CSE: "CS",
    ISE: "IS",
    AIML: "AI",
    AIDS: "AD",
    ECE: "EC",
    EEE: "EE"
  };

  const branchCode = branchMap[branch] || branch;

  // 🔹 Last 3 digits from original USN
  const lastDigits = originalUSN.slice(-3);

  // 🔹 Final USN
  const newUSN = `4GW${startYear}${branchCode}${lastDigits}`;

  usnInput.value = newUSN;
});

// ================= PHONE VALIDATION =================
phoneInput.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "");
});

// ================= SUBMIT =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const purpose = purposeSelect.value;

  const data = {
    name: nameSelect.value,
    usn: usnInput.value,
    branch: branchSelect.value,
    batch_year: batchSelect.value,
    mobile: phoneInput.value,
    email: emailInput.value,
    password: "1234"
  };

  console.log("🚀 Sending:", data);

  try {
    const res = await fetch("http://localhost:3001/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to save");

    showToast();

    setTimeout(() => {
      if (purpose === "lor") {
        window.location.href = "lor-request.html";
      } 
      else if (purpose === "higher-studies") {
        window.location.href = "higher-studies-portal.html";
      } 
      else if (purpose === "status") {
        window.location.href = "status-update.html";
      }
    }, 1500);

  } catch (err) {
    console.error(err);
    alert("❌ Failed to save");
  }
});
// ================= TOAST =================
function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}