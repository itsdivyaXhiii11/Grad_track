/**
 * coordinator-dashboard.js — Admin/Coordinator overview of all LOR requests
 */

let cAllRequests = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth();
  if (!user) return;

  await injectComponents('Coordinator Dashboard');
  await loadAllRequests();
  setupFilters();
});

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
      document.getElementById('cStatTotal').textContent    = s.total;
      document.getElementById('cStatApproved').textContent = s.approved;
      document.getElementById('cStatPending').textContent  = s.pending;
      document.getElementById('cStatRejected').textContent = s.rejected;
      document.getElementById('cStatSent').textContent     = s.sent;
      document.getElementById('cStatThisMonth').textContent = s.thisMonth;
      const abroad = cAllRequests.filter(r => r.abroad).length;
      document.getElementById('cStatAbroad').textContent   = abroad;
    }
  } catch (err) {
    document.getElementById('cRequestsBody').innerHTML =
      '<tr><td colspan="10" class="text-center text-danger py-4">Failed to load data.</td></tr>';
    console.error(err);
  }
}

function renderTable(data) {
  const tbody = document.getElementById('cRequestsBody');
  document.getElementById('cRequestCount').textContent = data.length;

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">No requests match filters.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(r => `
    <tr>
      <td class="fw-700">#${r.id}</td>
      <td>${r.studentName}</td>
      <td><code style="font-size:.8rem;">${r.usn}</code></td>
      <td>${r.branch}</td>
      <td>${r.faculty}</td>
      <td>${r.purpose}</td>
      <td class="text-center">${r.abroad
        ? '<i class="bi bi-check-circle-fill text-success"></i>'
        : '<i class="bi bi-dash text-muted"></i>'}</td>
      <td>${formatDate(r.submittedAt)}</td>
      <td><span class="badge-status badge-${r.status}">${capitalize(r.status)}</span></td>
      <td>
        ${
            r.status === "pending"
                ? `
                    <button class="btn btn-sm btn-success me-1"
                        onclick="openActionModal(${r.id}, 'approved')">
                        Approve
                    </button>

                    <button class="btn btn-sm btn-danger"
                        onclick="openActionModal(${r.id}, 'rejected')">
                        Reject
                     </button>
                `
                : `<span class="text-muted">No Action</span>`
        }
      </td>
    </tr>
  `).join('');
}

/** Update a request's status from dropdown */
async function updateStatus(id, newStatus) {
  if (!newStatus) return;
  try {
    const res = await apiCall(`/lor/${id}/status`, 'PUT', { status: newStatus });
    if (res.success) {
      cAllRequests = cAllRequests.map(r => r.id === id ? { ...r, status: newStatus } : r);
      renderTable(cAllRequests);
    } else {
      alert('Update failed: ' + res.message);
    }
  } catch (err) {
    alert('Error: Could not update status.');
    console.error(err);
  }
}

function setupFilters() {
  const statusFilter = document.getElementById('cFilterStatus');
  const branchFilter = document.getElementById('cFilterBranch');
  const searchInput  = document.getElementById('cSearchInput');
  const resetBtn     = document.getElementById('cResetBtn');

  const applyFilters = () => {
    let filtered = [...cAllRequests];
    if (statusFilter.value) filtered = filtered.filter(r => r.status === statusFilter.value);
    if (branchFilter.value) filtered = filtered.filter(r => r.branch === branchFilter.value);
    const q = searchInput.value.trim().toLowerCase();
    if (q) filtered = filtered.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.usn.toLowerCase().includes(q) ||
      r.faculty.toLowerCase().includes(q)
    );
    renderTable(filtered);
  };

  statusFilter.addEventListener('change', applyFilters);
  branchFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input',   applyFilters);

  resetBtn.addEventListener('click', () => {
    statusFilter.value = '';
    branchFilter.value = '';
    searchInput.value  = '';
    renderTable(cAllRequests);
  });
}

/** Export visible table rows as CSV */
function exportCSV() {
  const headers = ['ID', 'Student', 'USN', 'Branch', 'Faculty', 'Purpose', 'Abroad', 'Submitted', 'Status'];
  const rows = cAllRequests.map(r => [
    r.id, r.studentName, r.usn, r.branch, r.faculty, r.purpose,
    r.abroad ? 'Yes' : 'No', r.submittedAt, r.status
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'lor_requests_export.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }