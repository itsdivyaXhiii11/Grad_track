
let facultyInput1;
let facultyInput2;
let facultyList1;
let facultyList2;

let facultyData = [];

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
      !timeline
    ) {
      showAlert("warning", "Please fill all required fields.");
      return false;
    }

    // Prevent same faculty selection
    if (faculty1Select.value === faculty2Select.value) {
      showAlert("warning", "Please select two different faculties.");
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

    // Get faculty IDs from selected names
    const faculty1 = facultyData.find(f => f.name === faculty1Select.value);
    const faculty2 = facultyData.find(f => f.name === faculty2Select.value);
    
    const faculty1_id = faculty1?.id;
    const faculty2_id = faculty2?.id;

    if (!faculty1_id || !faculty2_id) {
  showAlert("warning", "Please select valid faculty from the list.");
  return;
}
    
    // TEMP student ID (replace later)
    const student_id = 1;

// Prepare JSON data
const requestData = {
  student_id,
  faculty1_id,
  faculty2_id,
  university: document.getElementById("university").value.trim(),
  country: document.getElementById("country").value.trim(),
  course: document.getElementById("course").value.trim()
};


    try {
      const response = await fetch("http://localhost:3001/api/lor", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(requestData)
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


document.addEventListener("DOMContentLoaded", () => {

  facultyInput1 = document.getElementById("lorFaculty1");
  facultyInput2 = document.getElementById("lorFaculty2");

  facultyList1 = document.getElementById("facultyList1");
  facultyList2 = document.getElementById("facultyList2");

  facultyInput1.addEventListener("input", filterFaculty);
  facultyInput2.addEventListener("input", filterFaculty);

  loadFaculty(); 

});