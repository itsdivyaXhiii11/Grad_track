/**
 * login.js — Handles login form submission and role-based redirect
 */

document.addEventListener('DOMContentLoaded', () => {
  const form        = document.getElementById('loginForm');
  const alertBox    = document.getElementById('loginAlert');
  const btnText     = document.getElementById('loginBtnText');
  const btnSpinner  = document.getElementById('loginBtnSpinner');
  const togglePwd   = document.getElementById('togglePassword');
  const pwdField    = document.getElementById('loginPassword');

  // --- Toggle password visibility ---
  togglePwd.addEventListener('click', () => {
    const isText = pwdField.type === 'text';
    pwdField.type = isText ? 'password' : 'text';
    togglePwd.querySelector('i').className = isText
      ? 'bi bi-eye text-muted'
      : 'bi bi-eye-slash text-muted';
  });

  // --- Form submit ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role     = document.getElementById('loginRole').value;

    setLoading(true);

    try {
      const res = await apiCall('/auth/login', 'POST', { email, password, role });

      if (res.success) {
        // ✅ Save session
        saveSession(res.token, res.user);

        showAlert('Login successful! Redirecting…', 'success');

        // ✅ Redirect after short delay
        setTimeout(() => redirectByRole(res.user.role), 800);

      } else {
        showAlert(res.message || 'Login failed. Please try again.', 'danger');
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
    form.querySelector('button[type=submit]').disabled = loading;
  }

  function showAlert(msg, type) {
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`;
  }

  function hideAlert() {
    alertBox.className = 'alert d-none';
  }

  // ✅ NEW: Save session
  function saveSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // ✅ NEW: Role-based redirect
  function redirectByRole(role) {
    if (role === 'student') {
      window.location.href = 'student-info.html';
    } 
    else if (role === 'faculty') {
      window.location.href = 'faculty-dashboard.html';
    } 
    else if (role === 'admin' || role === 'coordinator') {
      window.location.href = 'coordinator-dashboard.html';
    } 
    else {
      window.location.href = 'login.html';
    }
  }
});


