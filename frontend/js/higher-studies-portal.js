/**
 * higher-studies.js
 * Handles form validation and API submission for the Higher Studies page.
 * No framework dependencies — vanilla JS only.
 */

"use strict";

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const API_ENDPOINT = "/api/higher-studies";
const TOAST_DURATION = 4500; // ms

/* ─────────────────────────────────────────────
   DOM References (populated on DOMContentLoaded)
───────────────────────────────────────────── */
let form, submitBtn, btnSpinner;
let stateInput, collegeNameInput, fieldOfStudySelect;
let customFieldWrap, customFieldInput;
let toast, toastIcon, toastTitle, toastMsg;
let toastTimer = null;

/* ─────────────────────────────────────────────
   Initialise
───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Cache elements
  form               = document.getElementById("higher-studies-form");
  submitBtn          = document.getElementById("submitBtn");
  btnSpinner         = document.getElementById("btn-spinner");

  stateInput         = document.getElementById("state");
  collegeNameInput   = document.getElementById("collegeName");
  fieldOfStudySelect = document.getElementById("fieldOfStudy");
  customFieldWrap    = document.getElementById("customFieldWrap");
  customFieldInput   = document.getElementById("customField");

  toast              = document.getElementById("toast");
  toastIcon          = document.getElementById("toast-icon");
  toastTitle         = document.getElementById("toast-title");
  toastMsg           = document.getElementById("toast-msg");

  // Event: toggle custom field when "Other" is selected
  fieldOfStudySelect.addEventListener("change", handleFieldChange);

  // Event: live validation — remove error state on input
  [stateInput, collegeNameInput, customFieldInput].forEach((el) => {
    el.addEventListener("input", () => clearFieldError(el));
  });
  fieldOfStudySelect.addEventListener("change", () =>
    clearFieldError(fieldOfStudySelect)
  );

  // Event: form submission
  form.addEventListener("submit", handleSubmit);
});

/* ─────────────────────────────────────────────
   Field-of-study toggle
───────────────────────────────────────────── */
function handleFieldChange() {
  const isOther = fieldOfStudySelect.value === "Other";

  if (isOther) {
    customFieldWrap.classList.add("visible");
    customFieldInput.required = true;
    customFieldInput.focus();
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

/**
 * Validates all form fields.
 * Returns true if valid, false otherwise.
 */
function validateForm() {
  let isValid = true;

  // State
  if (!stateInput.value.trim()) {
    showFieldError(stateInput, "state-error", "Please enter your state.");
    isValid = false;
  }

  // College Name
  if (!collegeNameInput.value.trim()) {
    showFieldError(
      collegeNameInput,
      "collegeName-error",
      "Please enter the college / university name."
    );
    isValid = false;
  }

  // Field of Study
  if (!fieldOfStudySelect.value) {
    showFieldError(
      fieldOfStudySelect,
      "fieldOfStudy-error",
      "Please select a field of study."
    );
    isValid = false;
  }

  // Custom field (only required when "Other" is chosen)
  if (
    fieldOfStudySelect.value === "Other" &&
    !customFieldInput.value.trim()
  ) {
    showFieldError(
      customFieldInput,
      "customField-error",
      "Please specify your field of study."
    );
    isValid = false;
  }

  return isValid;
}

/**
 * Marks an input as invalid and shows its error message.
 * @param {HTMLElement} el      – The input / select element
 * @param {string}      errorId – ID of the error <div>
 * @param {string}      msg     – Error message text
 */
function showFieldError(el, errorId, msg) {
  el.classList.add("is-invalid");
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = msg;
}

/**
 * Removes the invalid state from an input.
 * @param {HTMLElement} el
 */
function clearFieldError(el) {
  el.classList.remove("is-invalid");
}

/* ─────────────────────────────────────────────
   Form Submission
───────────────────────────────────────────── */
async function handleSubmit(event) {
  event.preventDefault();

  if (!validateForm()) return;

  // Determine final field value
  const resolvedField =
    fieldOfStudySelect.value === "Other"
      ? customFieldInput.value.trim()
      : fieldOfStudySelect.value;

  const payload = {
    state:       stateInput.value.trim(),
    collegeName: collegeNameInput.value.trim(),
    field:       resolvedField,
  };

  setLoading(true);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Attempt to read an error message from the API response body
      let apiMessage = `Server responded with status ${response.status}.`;
      try {
        const errData = await response.json();
        if (errData && errData.message) apiMessage = errData.message;
      } catch (_) {
        // ignore JSON parse errors
      }
      throw new Error(apiMessage);
    }

    // Success path
    showToast(
      "success",
      "Application Submitted",
      "Your higher studies details have been recorded successfully."
    );
    resetForm();

  } catch (err) {
    // Network error or non-OK response
    showToast(
      "error",
      "Submission Failed",
      err.message || "Unable to reach the server. Please try again."
    );
  } finally {
    setLoading(false);
  }
}

/* ─────────────────────────────────────────────
   UI Helpers
───────────────────────────────────────────── */

/**
 * Toggles the loading/spinner state of the submit button.
 * @param {boolean} loading
 */
function setLoading(loading) {
  submitBtn.disabled = loading;
  if (loading) {
    submitBtn.classList.add("loading");
  } else {
    submitBtn.classList.remove("loading");
  }
}

/**
 * Resets the form back to its initial state.
 */
function resetForm() {
  form.reset();

  // Remove any lingering invalid classes
  [stateInput, collegeNameInput, fieldOfStudySelect, customFieldInput].forEach(
    (el) => el.classList.remove("is-invalid")
  );

  // Hide custom field
  customFieldWrap.classList.remove("visible");
  customFieldInput.required = false;
}

/**
 * Displays a toast notification.
 * @param {"success"|"error"} type
 * @param {string}            title
 * @param {string}            message
 */
function showToast(type, title, message) {
  // Clear any existing timer
  if (toastTimer) {
    clearTimeout(toastTimer);
    toast.classList.remove("show");
  }

  // Set content
  toast.className = `${type}`; // reset classes then add type
  toastTitle.textContent = title;
  toastMsg.textContent   = message;
  toastIcon.textContent  = type === "success" ? "✓" : "✕";

  // Force reflow so transition fires even on rapid successive calls
  void toast.offsetWidth;

  toast.classList.add("show");

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, TOAST_DURATION);
}