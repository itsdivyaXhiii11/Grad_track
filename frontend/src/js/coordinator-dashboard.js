/**
 * coordinator-dashboard.js — Coordinator Dashboard (FINAL CLEAN VERSION)
 */
let cAllRequests = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth();
  if (!user) return;

  await injectComponents('Coordinator Dashboard');
  await loadAllRequests();
  setupFilters();

  const viewSelector = document.getElementById("viewSelector");
  const lorSection = document.getElementById("lorSection");
  const studentsSection = document.getElementById("studentsSection");

  viewSelector.addEventListener("change", () => {
    if (viewSelector.value === "lor") {
      lorSection.classList.remove("d-none");
      studentsSection.classList.add("d-none");
    } else {
      lorSection.classList.add("d-none");
      studentsSection.classList.remove("d-none");

      loadStudents();
    }
  });
});

/* ========================= LOAD DATA ========================= */

async function loadAllRequests() {
  try {
    const [reqRes, statsRes] = await Promise.all([
      apiCall('/lor/requests', 'GET'),
      apiCall('/analytics/summary', 'GET'),
    ]);

    if (reqRes.success) {
      cAllRequests = reqRes.data;
      renderTable(cAllRequests);
    }

    if (statsRes.success) {
      const s = statsRes.data;

      document.getElementById('cStatTotal').textContent     = s.total;
      document.getElementById('cStatApproved').textContent  = s.approved;
      document.getElementById('cStatPending').textContent   = s.pending;
      document.getElementById('cStatRejected').textContent  = s.rejected;
      document.getElementById('cStatSent').textContent      = s.sent;
     

      const abroadCount = cAllRequests.filter(r => r.country).length;
      document.getElementById('cStatAbroad').textContent = abroadCount;
    }

  } catch (err) {
    document.getElementById('cRequestsBody').innerHTML =
      '<tr><td colspan="11" class="text-center text-danger py-4">Failed to load data.</td></tr>';
    console.error(err);
  }
}

/* ========================= RENDER TABLE ========================= */

function renderTable(data) {
  const tbody = document.getElementById('cRequestsBody');
  document.getElementById('cRequestCount').textContent = data.length;

  if (!data.length) {
    tbody.innerHTML =
      '<tr><td colspan="11" class="text-center text-muted py-4">No requests found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(r => `
    <tr>
      <td>#${r.id}</td>
      <td>${r.batch || '—'}</td>
      <td>${r.studentName}</td>
      <td>${r.branch}</td>
      <td><code>${r.usn}</code></td>
      <td>${r.faculty1}</td>
      <td>${r.faculty2}</td>
      <td>${r.country || '—'}</td>
      <td>${formatDate(r.submittedAt)}</td>

      <!-- STATUS -->
      <td>
        <span class="badge-status badge-${r.status}">
          ${capitalize(r.status)}
        </span>
      </td>

      <!-- LOR FILE (VIEW + DOWNLOAD + SEND) -->
      <td>
        ${
          r.lorFile
            ? `
              <div class="d-flex gap-2 flex-wrap">

                <!-- VIEW -->
                <a href="${r.lorFile}" target="_blank"
                   class="btn btn-sm btn-outline-secondary"
                   title="View LOR">
                  <i class="bi bi-eye"></i>
                </a>

                <!-- DOWNLOAD -->
                <a href="${r.lorFile}" download
                   class="btn btn-sm btn-outline-primary"
                   title="Download LOR">
                  <i class="bi bi-download"></i>
                </a>

                <!-- SEND BUTTON -->
                ${
                  r.status === "approved"
                    ? `
                      <button class="btn btn-sm btn-success"
                              onclick="markAsSent(${r.id})"
                              title="Mark as Sent">
                        Send
                      </button>
                    `
                    : ''
                }

              </div>
            `
            : `<span class="text-muted">No File</span>`
        }
      </td>
    </tr>
  `).join('');
}

/* ========================= MARK AS SENT ========================= */

async function markAsSent(id) {
  if (!confirm("Are you sure you want to mark this as Sent to University?")) return;

  try {
    const res = await apiCall(`/lor/${id}/send`, 'PUT');

    if (res.success) {
      cAllRequests = cAllRequests.map(r =>
        r.id === id ? { ...r, status: 'sent' } : r
      );
      renderTable(cAllRequests);
    } else {
      alert('Failed to update status');
    }

  } catch (err) {
    console.error(err);
    alert('Error updating status');
  }
}

/* ========================= FILTERS ========================= */

function setupFilters() {
  const statusFilter = document.getElementById('cFilterStatus');
  const branchFilter = document.getElementById('cFilterBranch');
  const searchInput  = document.getElementById('cSearchInput');
  const resetBtn     = document.getElementById('cResetBtn');

  const applyFilters = () => {
    let filtered = [...cAllRequests];

    if (statusFilter.value) {
      filtered = filtered.filter(r => r.status === statusFilter.value);
    }

    if (branchFilter.value) {
      filtered = filtered.filter(r => r.branch === branchFilter.value);
    }

    const q = searchInput.value.trim().toLowerCase();

    if (q) {
      filtered = filtered.filter(r =>
        r.studentName.toLowerCase().includes(q) ||
        r.usn.toLowerCase().includes(q) ||
        r.faculty1.toLowerCase().includes(q) ||
        r.faculty2.toLowerCase().includes(q)
      );
    }

    renderTable(filtered);
  };

  statusFilter.addEventListener('change', applyFilters);
  branchFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);

  resetBtn.addEventListener('click', () => {
    statusFilter.value = '';
    branchFilter.value = '';
    searchInput.value  = '';
    renderTable(cAllRequests);
  });
}

/* ========================= EXPORT CSV ========================= */

function exportCSV() {
  const headers = [
    'ID','Batch','Student','USN','Branch',
    'Faculty1','Faculty2','Country',
    'Submitted','Status','LOR File'
  ];

  const rows = cAllRequests.map(r => [
    r.id,
    r.batch,
    r.studentName,
    r.usn,
    r.branch,
    r.faculty1,
    r.faculty2,
    r.country,
    r.submittedAt,
    r.status,
    r.lorFile
      ? `=HYPERLINK("${r.lorFile}", "View LOR")`
      : 'No File'
  ]);

  const csv = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'lor_requests.csv';
  a.click();

  URL.revokeObjectURL(url);
}

/* ========================= HELPERS ========================= */

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}