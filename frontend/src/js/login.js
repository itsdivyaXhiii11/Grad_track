import { apiCall } from "./api.js";

// 🔥 Load login.html dynamically
fetch("/src/pages/login.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("app").innerHTML = html;

    // ✅ After HTML loads → attach events
    initLogin();
  });

function initLogin() {
  const form        = document.getElementById('loginForm');
  const alertBox    = document.getElementById('loginAlert');
  const btnText     = document.getElementById('loginBtnText');
  const btnSpinner  = document.getElementById('loginBtnSpinner');
  const togglePwd   = document.getElementById('togglePassword');
  const pwdField    = document.getElementById('loginPassword');

  // 🔐 Toggle password
  togglePwd?.addEventListener('click', () => {
    const isText = pwdField.type === 'text';
    pwdField.type = isText ? 'password' : 'text';
  });

  // 🚀 Form submit
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role     = document.getElementById('loginRole').value;

    setLoading(true);

    try {
      const res = await apiCall('/auth/login', {
        method: 'POST',
        body: { email, password, role }
      });

      console.log("API RESPONSE:", res);

      if (res.ok && res.data?.success) {
        saveSession(res.data.token, res.data.user);
        showAlert('Login successful! Redirecting…', 'success');
        setTimeout(() => redirectByRole(res.data.user.role), 800);
      } else {
        showAlert(res.data?.message || 'Login failed', 'danger');
      }

    } catch (err) {
      console.error(err);
      showAlert('Server error', 'danger');
    } finally {
      setLoading(false);
    }
  });

  // --- Helpers ---
  function setLoading(loading) {
    btnText?.classList.toggle('d-none', loading);
    btnSpinner?.classList.toggle('d-none', !loading);
    form.querySelector('button[type=submit]').disabled = loading;
  }

  function showAlert(msg, type) {
    alertBox.textContent = msg;
    alertBox.className = `alert alert-${type}`;
  }

  function saveSession(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('user', JSON.stringify(user));
  }

  function redirectByRole(role) {
    if (role === 'student') {
      window.location.href = '/src/pages/student-info.html';
    } 
    else if (role === 'faculty') {
      window.location.href = '/src/pages/faculty-dashboard.html';
    } 
    else {
      window.location.href = '/src/pages/coordinator-dashboard.html';
    }
  }
}