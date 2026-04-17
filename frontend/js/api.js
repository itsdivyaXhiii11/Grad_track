/**
 * api.js
 * Reusable API helper (mocked for now).
 * - No localStorage usage
 * - Uses fetch-style function signature to be backend-ready later
 */

async function apiCall(endpoint, options = {}) {
    const { method = "GET", headers = {}, body } = options;
  
    // Mock network delay
    await sleep(400);
  
    // Minimal mock routing (replace with real fetch later)
    const normalized = endpoint.replace(/\/+$/, "");
  
    if (normalized === "/auth/login" && method.toUpperCase() === "POST") {
      const payload = safeJsonParse(body);
  
      if (!payload?.email || !payload?.password || !payload?.role) {
        return mockError(400, "Missing email/password/role");
      }
  
      // Mock success token/user (do not persist)
      return mockOk({
        message: "Login successful (mock)",
        user: {
          name: "Demo User",
          email: payload.email,
          role: payload.role,
        },
      });
    }
  
    if (normalized === "/auth/register" && method.toUpperCase() === "POST") {
      const payload = safeJsonParse(body);
  
      if (!payload?.name || !payload?.email || !payload?.password || !payload?.role) {
        return mockError(400, "Missing name/email/password/role");
      }
  
      return mockOk({
        message: "Registration successful (mock)",
        user: {
          name: payload.name,
          email: payload.email,
          role: payload.role,
        },
      });
    }
  
    return mockError(404, `No mock route for ${method} ${endpoint}`);
  }
  
  /**
   * Loads shared HTML components into slots.
   * Expected slots: #navbarSlot, #sidebarSlot, #footerSlot
   */
   async function loadLayoutComponents() {
    await Promise.all([
      injectHtml("#navbarSlot", "../components/navbar.html"),
      injectHtml("#sidebarSlot", "../components/sidebar.html"),
      injectHtml("#footerSlot", "../components/footer.html"),
    ]);
  
    // Footer year
    const yearEl = document.querySelector("#footerSlot #year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  
    // Logout button (frontend-only)
    const logoutBtn = document.querySelector("#navbarSlot #btnLogout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        // No persistence to clear; just navigate
        window.location.href = "../pages/login.html";
      });
    }
  }
  
  /* ---------------- Helpers ---------------- */
  
  async function injectHtml(selector, path) {
    const slot = document.querySelector(selector);
    if (!slot) return;
  
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${path} (${res.status})`);
      slot.innerHTML = await res.text();
    } catch (err) {
      slot.innerHTML = `
        <div class="alert alert-warning m-3">
          <div class="fw-semibold">Component load failed</div>
          <div class="small">${escapeHtml(String(err.message))}</div>
          <div class="small text-secondary mt-2">
            Tip: open via a local server (not file://) so fetch can load components.
          </div>
        </div>
      `;
    }
  }
  
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  function safeJsonParse(maybeJson) {
    try {
      return typeof maybeJson === "string" ? JSON.parse(maybeJson) : maybeJson;
    } catch {
      return null;
    }
  }
  
  function mockOk(data) {
    return {
      ok: true,
      status: 200,
      data,
    };
  }
  
  function mockError(status, message) {
    return {
      ok: false,
      status,
      error: { message },
    };
  }
  
  function escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
  
  // ================= AUTH HELPERS =================

  function getSessionUser() {
    return JSON.parse(localStorage.getItem("user"));
  }

  function requireAuth() {
  let user = getSessionUser();

  // 👉 TEMP: allow demo access without login
  if (!user) {
    console.warn("Demo mode: no login, using mock coordinator");

    user = {
      name: "Demo Coordinator",
      role: "coordinator"
    };

    return user;
  }

  return user;
}