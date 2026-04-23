/**
 * api.js
 * Hybrid API helper (Mock + Real Backend)
 * Toggle USE_MOCK to switch safely
 */

const BASE_URL = "http://localhost:3001/api"; // ✅ FIXED PORT
const USE_MOCK = false; // ⚠️ change to true if something breaks

async function apiCall(endpoint, options = {}) {
  const { method = "GET", headers = {}, body } = options;

  // 🟡 MOCK MODE (SAFE FALLBACK)
  if (USE_MOCK) {
    await sleep(300);

    const payload = typeof body === "string" ? JSON.parse(body) : body;

    if (endpoint === "/auth/login" && method === "POST") {
      return {
        ok: true,
        status: 200,
        data: {
          success: true,
          message: "Login successful (mock)",
          user: {
            name: "Demo User",
            email: payload?.email,
            role: payload?.role,
          },
        },
      };
    }

    if (endpoint === "/auth/register" && method === "POST") {
      return {
        ok: true,
        status: 200,
        data: {
          success: true,
          message: "Registration successful (mock)",
          user: {
            name: payload?.name,
            email: payload?.email,
            role: payload?.role,
          },
        },
      };
    }

    return {
      ok: false,
      status: 404,
      error: { message: "Mock route not found" },
    };
  }

  // 🟢 REAL BACKEND MODE
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      error: { message: error.message },
    };
  }
}

/* ---------------- Layout Loader (KEEP SAME) ---------------- */

async function loadLayoutComponents() {
  await Promise.all([
    injectHtml("#navbarSlot", "../components/navbar.html"),
    injectHtml("#sidebarSlot", "../components/sidebar.html"),
    injectHtml("#footerSlot", "../components/footer.html"),
  ]);

  const yearEl = document.querySelector("#footerSlot #year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const logoutBtn = document.querySelector("#navbarSlot #btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
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
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    slot.innerHTML = await res.text();
  } catch (err) {
    slot.innerHTML = `<div>Error loading component</div>`;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
window.apiCall = apiCall;