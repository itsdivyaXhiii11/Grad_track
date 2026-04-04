/**
 * register.js — Final Version (Fully Aligned)
 */

document.addEventListener('DOMContentLoaded', () => {
  const form        = document.getElementById('registerForm');
  const alertBox    = document.getElementById('registerAlert');
  const btnText     = document.getElementById('regBtnText');
  const btnSpinner  = document.getElementById('regBtnSpinner');
  const registerBtn = document.getElementById('registerBtn');
  const roleSelect  = document.getElementById('regRole');

  const usnInput    = document.getElementById('regUSN');
  const branchInput = document.getElementById('regBranch');
  const usnGroup    = document.getElementById('usnGroup');
  const branchGroup = document.getElementById('branchGroup');

  const passwordInput        = document.getElementById('regPassword');
  const confirmPasswordInput = document.getElementById('regConfirmPassword');

  // --- Role Change Handling ---
  roleSelect.addEventListener('change', () => {
  const role = roleSelect.value;
  const isStudent = role === 'student';

  const usnLabel = document.getElementById('usnLabel');

  // Always show fields
  usnGroup.style.display = 'block';
  branchGroup.style.display = 'block';

  // Change label + placeholder + validation message
  if (isStudent) {
    usnLabel.textContent = 'USN';
    usnInput.placeholder = 'Enter USN (e.g., 4GWXXCS###)';
  } else {
    usnLabel.textContent = 'Employee ID';
    usnInput.placeholder = 'Enter Employee ID';
  }

  // Reset input
  usnInput.value = '';
  usnInput.classList.remove('is-invalid');
});

  // --- Live Password Match Validation ---
  confirmPasswordInput.addEventListener('input', () => {
    if (confirmPasswordInput.value !== passwordInput.value) {
      confirmPasswordInput.classList.add('is-invalid');
    } else {
      confirmPasswordInput.classList.remove('is-invalid');
    }
  });

  // --- Form Submit ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const role = roleSelect.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Password check
    if (password !== confirmPassword) {
      confirmPasswordInput.classList.add('is-invalid');
      return;
    }

    // Bootstrap validation
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Role-based validation
    if (role !== 'coordinator') {
      if (!usnInput.value.trim()) {
        usnInput.classList.add('is-invalid');
        return;
      }

      if (!branchInput.value) {
        branchInput.classList.add('is-invalid');
        return;
      }
    }

    // Payload
    const payload = {
      name: document.getElementById('regName').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      password: password,
      role: role,
      usn: role === 'coordinator' ? null : usnInput.value.trim(),
      branch: role === 'coordinator' ? null : branchInput.value,
    };

    setLoading(true);

    try {
      const res = await apiCall('/auth/register', 'POST', payload);

      if (res.success) {
        // Save user (or fallback to payload)
        const userData = res.user || payload;
        localStorage.setItem('user', JSON.stringify(userData));

        showAlert('Account created successfully! Redirecting...', 'success');

        // Role-based redirect
        const userRole = userData.role;

        setTimeout(() => {
          if (userRole === 'student') {
            window.location.href = 'student-info.html';
          } else if (userRole === 'faculty') {
            window.location.href = 'faculty-dashboard.html';
          } else if (userRole === 'coordinator') {
            window.location.href = 'coordinator-dashboard.html';
          }
        }, 1500);

      } else {
        showAlert(res.message || 'Registration failed. Try again.', 'danger');
      }

    } catch (err) {
      console.error(err);
      showAlert('Server error. Please try again later.', 'danger');
    } finally {
      setLoading(false);
    }
  });

  // --- Helpers ---

  function setLoading(isLoading) {
    btnText.classList.toggle('d-none', isLoading);
    btnSpinner.classList.toggle('d-none', !isLoading);
    registerBtn.disabled = isLoading;
  }

  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type} mb-3`;
  }

  function hideAlert() {
    alertBox.className = 'alert d-none';
  }
});