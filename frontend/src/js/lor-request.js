//const facultyInput1 = document.getElementById("lorFaculty1");
//const facultyInput2 = document.getElementById("lorFaculty2");
let facultyInput1;
let facultyInput2;
let facultyList1;
let facultyList2;

let facultyData = [];
//document.addEventListener("DOMContentLoaded", () => {

  // ================================
  // ELEMENT REFERENCES
  // ================================
  const faculty1Select = document.getElementById("lorFaculty1");
  const faculty2Select = document.getElementById("lorFaculty2");
  const lorForm = document.getElementById("lorRequestForm");
  const alertBox = document.getElementById("requestAlert");

  const file1Input = document.getElementById("file1"); // LOR file
  const file2Input = document.getElementById("file2"); // Proof file

  const submitBtn = document.getElementById("lorSubmitBtn");
  const btnText = document.getElementById("lorBtnText");
  const btnSpinner = document.getElementById("lorBtnSpinner");


  // ================================
  // FETCH FACULTY LIST FROM BACKEND
  // ================================
/*  async function fetchFacultyList() {
    try {
      const response = await fetch("http://localhost:3001/api/faculty");

      if (!response.ok) throw new Error("Failed to fetch faculty");

      const facultyList = await response.json();

      populateDropdown(faculty1Select, facultyList);
      populateDropdown(faculty2Select, facultyList);

    } catch (error) {
      console.error(error);
      showAlert("danger", "Unable to load faculty list. Try again later.");
    }
  } 
*/
  //to fetch
async function loadFaculty() {
  try {
    const res = await fetch("http://localhost:3001/api/faculty");
    facultyData = await res.json();

    console.log("Faculty:", facultyData);

    populateDropdowns();
  } catch (err) {
    console.error("Error loading faculty:", err);
  }
}

function populateDropdowns() {
  facultyList1.innerHTML = "";
  facultyList2.innerHTML = "";

  facultyData.forEach(f => {
    let opt1 = document.createElement("option");
    opt1.value = f.name;
    facultyList1.appendChild(opt1);

    let opt2 = document.createElement("option");
    opt2.value = f.name;
    facultyList2.appendChild(opt2);
  });
}

function filterFaculty() {
  const selected1 = facultyInput1.value;
  const selected2 = facultyInput2.value;

  facultyList1.innerHTML = "";
  facultyList2.innerHTML = "";

  facultyData.forEach(f => {

    if (f.name !== selected2) {
      let opt1 = document.createElement("option");
      opt1.value = f.name;
      facultyList1.appendChild(opt1);
    }

    if (f.name !== selected1) {
      let opt2 = document.createElement("option");
      opt2.value = f.name;
      facultyList2.appendChild(opt2);
    }

  });
}


/*  function populateDropdown(selectElement, facultyList) {
    selectElement.innerHTML = `<option value="">Select Faculty</option>`;

    facultyList.forEach(faculty => {
      const option = document.createElement("option");

      // Store ID (recommended for backend)
      option.value = faculty.id;
      option.textContent = faculty.name;

      selectElement.appendChild(option);
    });
  }

*/
  // ================================
  // VALIDATION
  // ================================
  function validateForm() {

    const university = document.getElementById("university").value.trim();
    const country = document.getElementById("country").value.trim();
    const course = document.getElementById("course").value.trim();
    const timeline = document.getElementById("timeline").value;

    if (
      !faculty1Select.value ||
      !faculty2Select.value ||
      !university ||
      !country ||
      !course ||
      !timeline ||
      !file1Input.files.length ||
      !file2Input.files.length
    ) {
      showAlert("warning", "Please fill all required fields.");
      return false;
    }

    // Prevent same faculty selection
    if (faculty1Select.value === faculty2Select.value) {
      showAlert("warning", "Please select two different faculties.");
      return false;
    }

    // File validation
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!validTypes.includes(file1Input.files[0].type) ||
        !validTypes.includes(file2Input.files[0].type)) {
      showAlert("warning", "Only PDF, DOC, DOCX files are allowed.");
      return false;
    }

    return true;
  }


  // ================================
  // FORM SUBMIT
  // ================================
  lorForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Show loading state
    btnText.classList.add("d-none");
    btnSpinner.classList.remove("d-none");
    submitBtn.disabled = true;

    const formData = new FormData();

    formData.append("faculty1", faculty1Select.value);
    formData.append("faculty2", faculty2Select.value);
    formData.append("university", document.getElementById("university").value.trim());
    formData.append("country", document.getElementById("country").value.trim());
    formData.append("course", document.getElementById("course").value.trim());
    formData.append("timeline", document.getElementById("timeline").value);

    // Files
    formData.append("lorFile", file1Input.files[0]);
    formData.append("proofFile", file2Input.files[0]);

    try {
      const response = await fetch("/api/lor-request", {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Submission failed");

      showAlert("success", "LOR request submitted successfully!");
      lorForm.reset();

    } catch (error) {
      console.error(error);
      showAlert("danger", "Error submitting request. Please try again.");

    } finally {
      // Reset button state
      btnText.classList.remove("d-none");
      btnSpinner.classList.add("d-none");
      submitBtn.disabled = false;
    }
  });


  // ================================
  // ALERT FUNCTION
  // ================================
  function showAlert(type, message) {
    alertBox.className = `alert alert-${type}`;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");

    setTimeout(() => {
      alertBox.classList.add("d-none");
    }, 4000);
  }


  // ================================
  // INIT
  // ================================
  //fetchFacultyList();

//});

document.addEventListener("DOMContentLoaded", () => {

  facultyInput1 = document.getElementById("lorFaculty1");
  facultyInput2 = document.getElementById("lorFaculty2");

  facultyList1 = document.getElementById("facultyList1");
  facultyList2 = document.getElementById("facultyList2");

  facultyInput1.addEventListener("input", filterFaculty);
  facultyInput2.addEventListener("input", filterFaculty);

  loadFaculty(); 

});