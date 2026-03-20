// Sample student data (later this comes from database)
const students = {
  CSE: ["Aarav", "Diya", "Rahul"],
  ISE: ["Sneha", "Kiran", "Megha"],
  ECE: ["Arjun", "Pooja", "Nikhil"]
};

const branchSelect = document.getElementById("branch");
const nameSelect = document.getElementById("name");

// When branch changes → update names
branchSelect.addEventListener("change", function () {
  const selectedBranch = this.value;

  // Clear previous options
  nameSelect.innerHTML = `<option value="" disabled selected>Select your name</option>`;

  if (students[selectedBranch]) {
    students[selectedBranch].forEach(student => {
      const option = document.createElement("option");
      option.value = student;
      option.textContent = student;
      nameSelect.appendChild(option);
    });
  }
});

// Form submit
document.getElementById("studentForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const form = this;

  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const batch = document.getElementById("batch").value;
  const branch = document.getElementById("branch").value;
  const name = document.getElementById("name").value;
  const usn = document.getElementById("usn").value;
  const option = document.getElementById("option").value;

  // Store data
  localStorage.setItem("batch", batch);
  localStorage.setItem("branch", branch);
  localStorage.setItem("name", name);
  localStorage.setItem("usn", usn);

  // Redirect
  if (option === "lor") {
    window.location.href = "student-dashboard.html";
  } else if (option === "higher") {
    window.location.href = "higher-studies.html";
  }
});