/**
 * lor-request-list.js — Logic for lor-requests.html
 * Renders the full requests table with filter, search, and PDF download.
 * Loaded after student-dashboard.js (reuses injectComponents, downloadLOR, etc.)
 */

let lorAllRequests = [];
let lorCurrentModal = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = requireAuth();
  if (!user) return;
  await injectComponents('My LOR Requests');
  await loadAllLorRequests();
  setupLorFilters();
});

async function loadAllLorRequests() {
  const tbody = document.getElementById('requestsBody');
  try {
    const res = await apiCall('/lor/requests', 'GET');
    if (!res.success) throw new Error(res.message);
    lorAllRequests = res.data;
    renderLorTable(lorAllRequests);
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Failed to load requests.</td></tr>';
    console.error(err);
  }
}

function renderLorTable(data) {
  const tbody = document.getElementById('requestsBody');
  document.getElementById('requestCount').textContent = data.length;

  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No requests found.</td></tr>';
    return;
  }

  tbody.innerHTML = data.map(r => `
    <tr>
      <td class="fw-700">#${r.id}</td>
      <td>${r.faculty}</td>
      <td>${r.purpose}</td>
      <td class="text-center">
        ${r.abroad
          ? '<i class="bi bi-check-circle-fill text-success"></i>'
          : '<i class="bi bi-dash text-muted"></i>'}
      </td>
      <td>${r.university || <span class="text-muted">—</span>}</td>
      <td>${formatDate(r.submittedAt)}</td>
      <td><span class="badge-status badge-${r.status}">${capitalize(r.status)}</span></td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-secondary"
                  onclick="openDetailModal(${JSON.stringify(r).replace(/"/g,'&quot;')})">
            <i class="bi bi-eye"></i>
          </button>
          ${r.status === 'approved'
            ? `<button class="btn btn-sm btn-outline-primary"
                       onclick="downloadLOR(${JSON.stringify(r).replace(/"/g,'&quot;')})">
                 <i class="bi bi-download"></i>
               </button>`
            : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

/** Open detail modal */
function openDetailModal(r) {
  lorCurrentModal = r;
  const body = document.getElementById('detailModalBody');
  const downloadBtn = document.getElementById('modalDownloadBtn');

  body.innerHTML = `
    <div class="row g-3" style="font-size:.875rem;">
      <div class="col-6"><div class="form-label">Request ID</div><div class="fw-700">#${r.id}</div></div>
      <div class="col-6"><div class="form-label">Status</div><span class="badge-status badge-${r.status}">${capitalize(r.status)}</span></div>
      <div class="col-6"><div class="form-label">Student Name</div><div>${r.studentName}</div></div>
      <div class="col-6"><div class="form-label">USN</div><code>${r.usn}</code></div>
      <div class="col-6"><div class="form-label">Branch</div><div>${r.branch}</div></div>
      <div class="col-6"><div class="form-label">Faculty</div><div>${r.faculty}</div></div>
      <div class="col-6"><div class="form-label">Purpose</div><div>${r.purpose}</div></div>
      <div class="col-6"><div class="form-label">Abroad</div><div>${r.abroad ? 'Yes' : 'No'}</div></div>
      ${r.abroad ? `<div class="col-12"><div class="form-label">University</div><div>${r.university || '—'}</div></div>` : ''}
      <div class="col-12"><div class="form-label">Submitted On</div><div>${formatDate(r.submittedAt)}</div></div>
    </div>
  `;

  downloadBtn.style.display = r.status === 'approved' ? 'inline-flex' : 'none';
  new bootstrap.Modal(document.getElementById('detailModal')).show();
}

function downloadFromModal() {
  if (lorCurrentModal) downloadLOR(lorCurrentModal);
}

function setupLorFilters() {
  const statusFilter = document.getElementById('filterStatus');
  const searchInput  = document.getElementById('searchInput');

  const apply = () => {
    let list = [...lorAllRequests];
    if (statusFilter.value) list = list.filter(r => r.status === statusFilter.value);
    const q = searchInput.value.trim().toLowerCase();
    if (q) list = list.filter(r =>
      r.faculty.toLowerCase().includes(q) || r.purpose.toLowerCase().includes(q)
    );
    renderLorTable(list);
  };

  statusFilter.addEventListener('change', apply);
  searchInput.addEventListener('input', apply);
}

function resetFilters() {
  document.getElementById('filterStatus').value = '';
  document.getElementById('searchInput').value  = '';
  renderLorTable(lorAllRequests);
}
