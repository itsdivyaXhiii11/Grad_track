/**
 * faculty-dashboard.js — Faculty dashboard: view, accept, reject LOR requests
 */

let allRequests = [];       // cache for filtering
let pendingAction = null;   // { id, action }

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth();
  if (!user) return;

  await injectComponents('Faculty Dashboard');
  await loadRequests();
  setupFilters();

  
});

/** Fetch all LOR requests assigned to this faculty */
async function loadRequests() {
  const tbody = document.getElementById('fRequestsBody');

  try {
    const res = await apiCall('/lor/requests', 'GET');
    if (!res.success) throw new Error(res.message);

    allRequests = res.data;
    updateStats(allRequests);
    renderTable(allRequests);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger py-4">Failed to load requests.</td></tr>`;
    console.error(err);
  }
}

function updateStats(data) {
  document.getElementById('fStatTotal').textContent    = data.length;
  document.getElementById('fStatPending').textContent  = data.filter(r => r.status === 'pending').length;
  document.getElementById('fStatApproved').textContent = data.filter(r => r.status === 'approved').length;
  document.getElementById('fStatRejected').textContent = data.filter(r => r.status === 'rejected').length;
}

function renderTable(data) {
  const tbody = document.getElementById('fRequestsBody');
  document.getElementById('fRequestCount').textContent = data.length;

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">No requests found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(r => `
    <tr>
      <td class="fw-700">#${r.id}</td>
      <td>${r.batch}</td>
      <td>${r.studentName}</td>
      <td><code style="font-size:.8rem;">${r.usn}</code></td>
      <td>${r.branch}</td>
      <td>${r.abroad ? '<i class="bi bi-check-circle-fill text-success"></i>' : '<i class="bi bi-dash text-muted"></i>'}</td>
      <td>${formatDate(r.submittedAt)}</td>
      <td><span class="badge-status badge-${r.status}">${capitalize(r.status)}</span></td>
      <td>
        ${r.status === 'pending' ? `
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-success" onclick="openActionModal(${r.id}, 'approved')">
              <i class="bi bi-check-lg"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="openActionModal(${r.id}, 'rejected')">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>` : `<span class="text-muted" style="font-size:.8rem;">No action</span>`
        }
      </td>
    </tr>
  `).join('');
}

/** Open modal to confirm accept/reject */
function openActionModal(id, action) {
  pendingAction = { id, action };
  const modal = new bootstrap.Modal(document.getElementById('actionModal'));
  const isApprove = action === 'approved';

  document.getElementById('actionModalTitle').textContent = isApprove ? 'Approve Request' : 'Reject Request';
  document.getElementById('actionModalBody').textContent =
    `Are you sure you want to ${isApprove ? 'approve' : 'reject'} request #${id}?`;

  const confirmBtn = document.getElementById('actionModalConfirmBtn');
  confirmBtn.className = `btn btn-sm ${isApprove ? 'btn-success' : 'btn-danger'}`;
  confirmBtn.textContent = isApprove ? 'Approve' : 'Reject';

  modal.show();
}

/** Confirm the pending action (accept/reject) */
async function confirmAction() {
  if (!pendingAction) return;

  const { id, action } = pendingAction;
  pendingAction = null;

  bootstrap.Modal.getInstance(document.getElementById('actionModal')).hide();

  try {
    const res = await apiCall(`/lor/${id}/status`, 'PUT', { status: action });
    if (res.success) {
      // Update local cache + re-render
      allRequests = allRequests.map(r => r.id === id ? { ...r, status: action } : r);
      updateStats(allRequests);
      renderTable(allRequests);
    } else {
      alert('Failed to update status: ' + (res.message || 'Unknown error'));
    }
  } catch (err) {
    alert('Error updating request. Please try again.');
    console.error(err);
  }
}

/** Filter and search */
function setupFilters() {
  const statusFilter = document.getElementById('fFilterStatus');
  const searchInput  = document.getElementById('fSearchInput');
  const resetBtn     = document.getElementById('fResetBtn');

  const applyFilters = () => {
    let filtered = [...allRequests];

    const status = statusFilter.value;
    if (status) filtered = filtered.filter(r => r.status === status);

    const q = searchInput.value.trim().toLowerCase();
    if (q) filtered = filtered.filter(r =>
      r.studentName.toLowerCase().includes(q) || r.usn.toLowerCase().includes(q)
    );

    renderTable(filtered);
  };

  statusFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input',   applyFilters);
  resetBtn.addEventListener('click', () => {
    statusFilter.value = '';
    searchInput.value  = '';
    renderTable(allRequests);
  });
}

// Shared utilities (from student-dashboard.js)
function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
