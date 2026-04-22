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
  batchSelect.innerHTML = '<option value="">Select Batch</option>';

  for (let i = 2016; i <= 2030; i++) {
    const opt = document.createElement("option");
    opt.value = `${i}-${i + 4}`;
    opt.textContent = `${i}-${i + 4}`;
    batchSelect.appendChild(opt);
  }
});

// ================= FETCH STUDENTS =================
async function fetchStudents(batch, branch) {
  try {
    const res = await fetch(
      `http://localhost:3001/api/students?batch=${batch}&branch=${branch}`
    );

    if (!res.ok) throw new Error();

    return await res.json();
  } catch {
    return [];
  }
}

// ================= LOAD STUDENTS =================
async function loadStudents() {
  const batch = batchSelect.value;
  const branch = branchSelect.value;

  nameSelect.innerHTML = '<option value="">Select Student</option>';
  usnInput.value = "";

  if (!batch || !branch) return;

  const students = await fetchStudents(batch, branch);

  students.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    opt.dataset.usn = s.usn;
    nameSelect.appendChild(opt);
  });
}

// ================= BATCH CHANGE =================
batchSelect.addEventListener("change", () => {
  const batch = batchSelect.value;
  if (!batch) return;

  const startYear = parseInt(batch.split("-")[0]);

  branchSelect.querySelectorAll("option").forEach((opt) => {
    if (opt.value === "AIML" || opt.value === "AIDS") {
      opt.disabled = startYear < 2020;
    }
  });

  if (
    startYear < 2020 &&
    (branchSelect.value === "AIML" || branchSelect.value === "AIDS")
  ) {
    branchSelect.value = "";
  }

  loadStudents();
});

// ================= BRANCH CHANGE =================
branchSelect.addEventListener("change", loadStudents);

// ================= NAME → USN =================
nameSelect.addEventListener("change", () => {
  const selected = nameSelect.options[nameSelect.selectedIndex];
  const usn = selected?.dataset?.usn || "";

  if (!usn) return;

  const batch = batchSelect.value;
  const branch = branchSelect.value;

  const year = batch.split("-")[0].slice(-2);

  const branchMap = {
    CSE: "CS",
    ISE: "IS",
    AIML: "AI",
    AIDS: "AD",
    ECE: "EC",
    EEE: "EE"
  };

  const code = branchMap[branch] || branch;

  usnInput.value = `4GW${year}${code}${usn.slice(-3)}`;
});

// ================= PHONE =================
phoneInput.addEventListener("input", function () {
  this.value = this.value.replace(/\D/g, "");
});

// ================= SUBMIT =================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: nameSelect.options[nameSelect.selectedIndex]?.textContent,
    usn: usnInput.value,
    branch: branchSelect.value,
    batch_year: batchSelect.value,
    mobile: phoneInput.value,
    email: emailInput.value,
    password: "1234"
  };

  try {
    const res = await fetch("http://localhost:3001/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error();

    showToast();

    setTimeout(() => {
      const purpose = purposeSelect.value;

      if (purpose === "lor") window.location.href = "lor-request.html";
      if (purpose === "higher-studies") window.location.href = "higher-studies-portal.html";
      if (purpose === "status") window.location.href = "status-update.html";
    }, 1500);

  } catch {
    alert("❌ Failed");
  }
});

// ================= TOAST =================
function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}