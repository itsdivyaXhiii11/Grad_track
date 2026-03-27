document.addEventListener("DOMContentLoaded", () => {
  const faculty1Select = document.getElementById("faculty1");
  const faculty2Select = document.getElementById("faculty2");
  const lorForm = document.getElementById("lorRequestForm");
  const alertBox = document.getElementById("alertBox");

  // Fetch faculty list from backend
  async function fetchFacultyList() {
    try {
      const response = await fetch("/api/faculty");
      if (!response.ok) throw new Error("Failed to fetch faculty list");

      const data = await response.json();
      populateDropdown(faculty1Select, data);
      populateDropdown(faculty2Select, data);
    } catch (error) {
      showAlert("danger", "Error loading faculty list. Please try again later.");
      console.error(error);
    }
  }

  function populateDropdown(selectElement, facultyList) {
    selectElement.innerHTML = '<option value="">Select Faculty</option>';
    facultyList.forEach(faculty => {
      const option = document.createElement("option");
      option.value = faculty.name;
      option.textContent = faculty.name;
      selectElement.appendChild(option);
    });
  }

  // Form validation
  function validateForm() {
    const university = document.getElementById("university").value.trim();
    const country = document.getElementById("country").value.trim();
    const course = document.getElementById("course").value.trim();
    const timeline = document.getElementById("timeline").value.trim();
    const fileInput = document.getElementById("file");

    if (!university || !country || !course || !timeline || !fileInput.files.length) {
      showAlert("warning", "Please fill all required fields.");
      return false;
    }

    const file = fileInput.files[0];
    const validTypes = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      showAlert("warning", "Invalid file type. Allowed: PDF, DOC, DOCX.");
      return false;
    }

    return true;
  }

  // Handle form submission
  lorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Decide which faculty values to use
    const faculty1 = faculty1Select.value || document.getElementById("faculty1Manual").value.trim();
    const faculty2 = faculty2Select.value || document.getElementById("faculty2Manual").value.trim();

    if (!faculty1 || !faculty2) {
      showAlert("warning", "Please provide names for both faculties.");
      return;
    }

    const formData = new FormData();
    formData.append("faculty1", faculty1);
    formData.append("faculty2", faculty2);
    formData.append("university", document.getElementById("university").value.trim());
    formData.append("country", document.getElementById("country").value.trim());
    formData.append("course", document.getElementById("course").value.trim());
    formData.append("timeline", document.getElementById("timeline").value.trim());
    formData.append("file", document.getElementById("file").files[0]);

    try {
      const response = await fetch("/api/lor-request", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Failed to submit form");

      showAlert("success", "LOR request submitted successfully!");
      lorForm.reset();
    } catch (error) {
      showAlert("danger", "Error submitting form. Please try again.");
      console.error(error);
    }
  });

  // Show alert message
  function showAlert(type, message) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");

    setTimeout(() => {
      alertBox.classList.add("d-none");
    }, 4000);
  }

  // Initialize
  fetchFacultyList();
});


