/**
 * register.js — Handles registration form submission and validation
 */

document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('registerForm');
  const alertBox   = document.getElementById('registerAlert');
  const btnText    = document.getElementById('regBtnText');
  const btnSpinner = document.getElementById('regBtnSpinner');
  const roleSelect = document.getElementById('regRole');

  // --- Show/hide USN field based on role ---
  roleSelect.addEventListener('change', () => {
    const role = roleSelect.value;
    document.getElementById('usnGroup').style.display    = role === 'coordinator' ? 'none' : 'block';
    document.getElementById('branchGroup').style.display = role === 'coordinator' ? 'none' : 'block';
  });

  // --- Form submit ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const password        = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    // Password match check
    if (password !== confirmPassword) {
      document.getElementById('regConfirmPassword').classList.add('is-invalid');
      document.getElementById('confirmPwdFeedback').textContent = 'Passwords do not match.';
      return;
    } else {
      document.getElementById('regConfirmPassword').classList.remove('is-invalid');
    }

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const payload = {
      name:     document.getElementById('regName').value.trim(),
      email:    document.getElementById('regEmail').value.trim(),
      password,
      role:     document.getElementById('regRole').value,
      usn:      document.getElementById('regUSN').value.trim(),
      branch:   document.getElementById('regBranch').value,
    };

    setLoading(true);

    try {
      const res = await apiCall('/auth/register', 'POST', payload);

      if (res.success) {
        showAlert('Account created! Redirecting to login…', 'success');
        setTimeout(() => window.location.href = 'login.html', 1500);
      } else {
        showAlert(res.message || 'Registration failed. Try again.', 'danger');
      }
    } catch (err) {
      showAlert('An error occurred. Please try again.', 'danger');
      console.error(err);
    } finally {
      setLoading(false);
    }
  });

  // --- Helpers ---
  function setLoading(loading) {
    btnText.classList.toggle('d-none', loading);
    btnSpinner.classList.toggle('d-none', !loading);
    document.getElementById('registerBtn').disabled = loading;
  }

  function showAlert(msg, type) {
    alertBox.textContent = msg;
    alertBox.className   = `alert alert-${type}`;
  }

  function hideAlert() {
    alertBox.className = 'alert d-none';
  }
});
