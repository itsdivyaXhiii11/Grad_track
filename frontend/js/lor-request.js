/**
 * lor-request.js — LOR request form logic
 * Handles faculty loading, conditional abroad fields, and form submission
 */

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth();
  if (!user) return;

  await injectComponents('Request LOR');

  // Pre-fill student details from session
  if (user.name)   document.getElementById('lorName').value   = user.name;
  if (user.usn)    document.getElementById('lorUSN').value    = user.usn;
  if (user.branch) document.getElementById('lorBranch').value = user.branch;

  await loadFacultyDropdown();
  setupAbroadToggle();
  setupFormSubmission();
});

/** Fetch faculty list from API and populate dropdown */
async function loadFacultyDropdown() {
  const select = document.getElementById('lorFaculty');
  try {
    const res = await apiCall('/faculty/list', 'GET');
    if (res.success && res.data.length) {
      select.innerHTML = '<option value="" disabled selected>Select faculty</option>' +
        res.data.map(f => `<option value="${f.id}">${f.name} — ${f.department}</option>`).join('');
    } else {
      select.innerHTML = '<option value="" disabled selected>No faculty available</option>';
    }
  } catch {
    select.innerHTML = '<option value="" disabled selected>Failed to load</option>';
  }
}

/** Show/hide abroad-specific fields based on purpose selection */
function setupAbroadToggle() {
  const purposeSelect   = document.getElementById('lorPurpose');
  const abroadSection   = document.getElementById('abroadSection');
  const universityField = document.getElementById('lorUniversity');

  purposeSelect.addEventListener('change', () => {
    const isAbroad = purposeSelect.value === 'Masters Abroad' || purposeSelect.value === 'PhD';
    abroadSection.classList.toggle('d-none', !isAbroad);
    universityField.required = isAbroad;
  });
}

/** Handle form submission */
function setupFormSubmission() {
  const form       = document.getElementById('lorRequestForm');
  const alertBox   = document.getElementById('requestAlert');
  const btnText    = document.getElementById('lorBtnText');
  const btnSpinner = document.getElementById('lorBtnSpinner');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const purpose   = document.getElementById('lorPurpose').value;
    const isAbroad  = purpose === 'Masters Abroad' || purpose === 'PhD';

    const payload = {
      name:         document.getElementById('lorName').value.trim(),
      usn:          document.getElementById('lorUSN').value.trim().toUpperCase(),
      branch:       document.getElementById('lorBranch').value,
      semester:     document.getElementById('lorSemester').value,
      facultyId:    document.getElementById('lorFaculty').value,
      purpose,
      description:  document.getElementById('lorDescription').value.trim(),
      achievements: document.getElementById('lorAchievements').value.trim(),
      abroad: isAbroad,
      university:   isAbroad ? document.getElementById('lorUniversity').value.trim() : '',
      country:      isAbroad ? document.getElementById('lorCountry').value.trim()    : '',
      program:      isAbroad ? document.getElementById('lorProgram').value.trim()    : '',
      deadline:     isAbroad ? document.getElementById('lorDeadline').value          : '',
    };

    setLoading(true);
    try {
      const res = await apiCall('/lor/submit', 'POST', payload);
      if (res.success) {
        showAlert(`✅ Request submitted successfully! Your request ID is #${res.id}.`, 'success');
        form.reset();
        form.classList.remove('was-validated');
        document.getElementById('abroadSection').classList.add('d-none');
      } else {
        showAlert(res.message || 'Submission failed. Try again.', 'danger');
      }
    } catch (err) {
      showAlert('An error occurred. Please try again.', 'danger');
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  function setLoading(loading) {
    btnText.classList.toggle('d-none', loading);
    btnSpinner.classList.toggle('d-none', !loading);
    document.getElementById('lorSubmitBtn').disabled = loading;
  }

  function showAlert(msg, type) {
    alertBox.innerHTML  = msg;
    alertBox.className  = `alert alert-${type}`;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    alertBox.className = 'alert d-none';
  }
}