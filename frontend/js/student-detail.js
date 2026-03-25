document.addEventListener("DOMContentLoaded", function () {

  const batch = document.getElementById("batch");
  const branch = document.getElementById("branch");
  const nameDropdown = document.getElementById("lorName");
  const usnInput = document.getElementById("lorUSN");

  // Batch years
  const currentYear = new Date().getFullYear();
  for (let i = 2020; i <= currentYear + 2; i++) {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    batch.appendChild(option);
  }

  // Load students from backend
  async function loadStudents() {
    const selectedBatch = batch.value;
    const selectedBranch = branch.value;

    if (!selectedBatch || !selectedBranch) return;

    usnInput.value = "";

    nameDropdown.innerHTML = '<option disabled selected>Loading...</option>';

    try {
      const res = await fetch(`/students?batch=${selectedBatch}&branch=${selectedBranch}`);
      const data = await res.json();

      if (data.length === 0) {
        nameDropdown.innerHTML = '<option disabled selected>No students found</option>';
        return;
      }

      nameDropdown.innerHTML = '<option disabled selected>Select student</option>';

      data.forEach(student => {
        let option = document.createElement("option");
        option.value = student.usn;
        option.textContent = `${student.name} (${student.usn})`;
        nameDropdown.appendChild(option);
      });

    } catch (err) {
      nameDropdown.innerHTML = '<option disabled selected>Error loading students</option>';
    }
  }

  // Events
  batch.addEventListener("change", loadStudents);
  branch.addEventListener("change", loadStudents);

  nameDropdown.addEventListener("change", function () {
    usnInput.value = this.value;
  });

});

