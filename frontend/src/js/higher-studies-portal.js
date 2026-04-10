"use strict";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const API_ENDPOINT = "/api/higher-studies";
const TOAST_DURATION = 4500;

/* ─────────────────────────────────────────────
   DOM References
───────────────────────────────────────────── */
let form, submitBtn;
let stateInput, collegeNameInput, fieldOfStudyInput;
let customFieldWrap, customFieldInput;
let fileInput;

let toast, toastIcon, toastTitle, toastMsg;
let toastTimer = null;

/* ─────────────────────────────────────────────
   Initialise
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  form = document.getElementById("higher-studies-form");
  submitBtn = document.getElementById("submitBtn");

  stateInput = document.getElementById("state");
  collegeNameInput = document.getElementById("collegeName");
  fieldOfStudyInput = document.getElementById("fieldOfStudy");

  customFieldWrap = document.getElementById("customFieldWrap");
  customFieldInput = document.getElementById("customField");

  fileInput = document.getElementById("file");

  toast = document.getElementById("toast");
  toastIcon = document.getElementById("toast-icon");
  toastTitle = document.getElementById("toast-title");
  toastMsg = document.getElementById("toast-msg");

  /* Events */
  fieldOfStudyInput.addEventListener("input", handleFieldChange);

  [stateInput, collegeNameInput, customFieldInput].forEach(el => {
    el.addEventListener("input", () => clearFieldError(el));
  });

  form.addEventListener("submit", handleSubmit);
});

/* ─────────────────────────────────────────────
   Field Toggle
───────────────────────────────────────────── */
function handleFieldChange() {
  const value = fieldOfStudyInput.value.trim().toLowerCase();

  if (value === "other") {
    customFieldWrap.classList.add("visible");
    customFieldInput.required = true;
  } else {
    customFieldWrap.classList.remove("visible");
    customFieldInput.required = false;
    customFieldInput.value = "";
    clearFieldError(customFieldInput);
  }
}

/* ─────────────────────────────────────────────
   Validation
───────────────────────────────────────────── */
function validateForm() {
  let isValid = true;

  if (!stateInput.value.trim()) {
    showFieldError(stateInput, "state-error", "Please enter your state.");
    isValid = false;
  }

  if (!collegeNameInput.value.trim()) {
    showFieldError(collegeNameInput, "collegeName-error", "Please enter college name.");
    isValid = false;
  }

  if (!fieldOfStudyInput.value.trim()) {
    showFieldError(fieldOfStudyInput, "fieldOfStudy-error", "Please select a field.");
    isValid = false;
  }

  if (
    fieldOfStudyInput.value.trim().toLowerCase() === "other" &&
    !customFieldInput.value.trim()
  ) {
    showFieldError(customFieldInput, "customField-error", "Please specify your field.");
    isValid = false;
  }

  // File validation (optional but recommended)
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const allowedTypes = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Invalid File", "Only PDF, DOC, DOCX allowed.");
      isValid = false;
    }
  }

  return isValid;
}

function showFieldError(el, errorId, msg) {
  el.classList.add("is-invalid");
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = msg;
}

function clearFieldError(el) {
  el.classList.remove("is-invalid");
}

/* ─────────────────────────────────────────────
   Submit
───────────────────────────────────────────── */
async function handleSubmit(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const resolvedField =
    fieldOfStudyInput.value.trim().toLowerCase() === "other"
      ? customFieldInput.value.trim()
      : fieldOfStudyInput.value.trim();

  /* FormData for backend */
  const formData = new FormData();
  formData.append("state", stateInput.value.trim());
  formData.append("collegeName", collegeNameInput.value.trim());
  formData.append("field", resolvedField);

  // Optional: attach userId if stored
  const userId = localStorage.getItem("userId");
  if (userId) formData.append("userId", userId);

  // File
  if (fileInput.files.length > 0) {
    formData.append("file", fileInput.files[0]);
  }

  setLoading(true);

  try {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      let msg = "Something went wrong";
      try {
        const data = await res.json();
        msg = data.message || msg;
      } catch {}
      throw new Error(msg);
    }

    showToast("success", "Submitted", "Details saved successfully.");
    resetForm();

  } catch (err) {
    showToast("error", "Error", err.message);
  } finally {
    setLoading(false);
  }
}

/* ─────────────────────────────────────────────
   UI Helpers
───────────────────────────────────────────── */
function setLoading(loading) {
  submitBtn.disabled = loading;
  submitBtn.classList.toggle("loading", loading);
}

function resetForm() {
  form.reset();

  [stateInput, collegeNameInput, fieldOfStudyInput, customFieldInput]
    .forEach(el => el.classList.remove("is-invalid"));

  customFieldWrap.classList.remove("visible");
}

/* ─────────────────────────────────────────────
   Toast
───────────────────────────────────────────── */
function showToast(type, title, message) {
  if (toastTimer) clearTimeout(toastTimer);

  toast.className = type;
  toastTitle.textContent = title;
  toastMsg.textContent = message;
  toastIcon.textContent = type === "success" ? "✓" : "✕";

  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, TOAST_DURATION);
}