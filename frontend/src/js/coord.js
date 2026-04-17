/**

* coordinator-dashboard.js — FINAL UPDATED (Dynamic Table + View Switch)
  */

let currentView = "lor";
let cAllRequests = [];
let allStudents = [];

document.addEventListener('DOMContentLoaded', async () => {
const user = requireAuth();
if (!user) return;

await injectComponents('Coordinator Dashboard');

setupViewSelector();
setupFilters();
await loadAllRequests();
});

/* ========================= VIEW SELECTOR ========================= */

function setupViewSelector() {
const selector = document.getElementById("viewSelector");

selector.addEventListener("change", () => {
currentView = selector.value;

```
if (currentView === "lor") {
  renderLORTable(cAllRequests);
} else {
  loadStudents();
}
```

});
}

/* ========================= LOAD DATA ========================= */

async function loadAllRequests() {
try {
const [reqRes, statsRes] = await Promise.all([
apiCall('/lor/requests', 'GET'),
apiCall('/analytics/summary', 'GET'),
]);

```
if (reqRes.success) {
  cAllRequests = reqRes.data;
  renderLORTable(cAllRequests);
}

if (statsRes.success) {
  const s = statsRes.data;

  document.getElementById('cStatTotal').textContent    = s.total;
  document.getElementById('cStatApproved').textContent = s.approved;
  document.getElementById('cStatPending').textContent  = s.pending;
  document.getElementById('cStatRejected').textContent = s.rejected;
  document.getElementById('cStatSent').textContent     = s.sent;

  const abroadCount = cAllRequests.filter(r => r.country).length;
  document.getElementById('cStatAbroad').textContent = abroadCount;
}
```

} catch (err) {
document.getElementById('tableBody').innerHTML =
'<tr><td colspan="6" class="text-center text-danger py-4">Failed to load data.</td></tr>';
console.error(err);
}
}

/* ========================= LOR TABLE ========================= */

function renderLORTable(data) {
const head = document.getElementById("tableHead");
const body = document.getElementById("tableBody");

document.getElementById("tableTitle").textContent = "All LOR Requests";
document.getElementById("cRequestCount").textContent = data.length;

// HEADER
head.innerHTML = `     <tr>       <th>#</th>       <th>Batch</th>       <th>Student</th>       <th>Branch</th>       <th>USN</th>       <th>Faculty-1</th>       <th>Faculty-2</th>       <th>Abroad</th>       <th>Submitted</th>       <th>Status</th>       <th>LOR</th>     </tr>
  `;

if (!data.length) {
body.innerHTML =
'<tr><td colspan="11" class="text-center text-muted py-4">No requests found.</td></tr>';
return;
}

// BODY
body.innerHTML = data.map(r => ` <tr> <td>#${r.id}</td> <td>${r.batch || '—'}</td> <td>${r.studentName}</td> <td>${r.branch}</td> <td><code>${r.usn}</code></td> <td>${r.faculty1}</td> <td>${r.faculty2}</td> <td>${r.country || '—'}</td> <td>${formatDate(r.submittedAt)}</td>

```
<td>
    <span class="badge-status badge-${r.status}">
      ${capitalize(r.status)}
    </span>
</td>

  <td>
    ${ 
        r.lorFile
        ? `
            <div class="d-flex gap-2">

            <a href="${r.lorFile}" target="_blank"
               class="btn btn-sm btn-outline-secondary">
              <i class="bi bi-eye"></i>
            </a>

            <a href="${r.lorFile}" download
               class="btn btn-sm btn-outline-primary">
              <i class="bi bi-download"></i>
            </a>

            ${
              r.status === "approved"
                ? `<button class="btn btn-sm btn-success"
                           onclick="markAsSent(${r.id})">
                     Send
                   </button>`
                : ''
            }

          </div>
        `
        : `<span class="text-muted">No File</span>`
    }
  </td>
</tr>
```

`).join('');
}

/* ========================= STUDENTS ========================= */

function loadStudents() {
allStudents = JSON.parse(localStorage.getItem("students")) || [];
renderStudentsTable(allStudents);
}

function renderStudentsTable(data) {
const head = document.getElementById("tableHead");
const body = document.getElementById("tableBody");

document.getElementById("tableTitle").textContent = "All Students";
document.getElementById("cRequestCount").textContent = data.length;

head.innerHTML = `     <tr>       <th>#</th>       <th>Name</th>       <th>USN</th>       <th>Branch</th>       <th>Status</th>       <th>Download</th>     </tr>
  `;

if (!data.length) {
body.innerHTML =
'<tr><td colspan="6" class="text-center text-muted py-4">No students found.</td></tr>';
return;
}

body.innerHTML = data.map((s, i) => `     <tr>       <td>${i + 1}</td>       <td>${s.name}</td>       <td>${s.usn}</td>       <td>${s.branch}</td>       <td>${s.status || "Not Updated"}</td>       <td>         <button class="btn btn-sm btn-success"
                onclick="downloadStudent('${s.usn}')">
          Download         </button>       </td>     </tr>
  `).join('');
}

/* ========================= SEND ========================= */

async function markAsSent(id) {
if (!confirm("Mark as Sent?")) return;

try {
const res = await apiCall(`/lor/${id}/send`, 'PUT');

```
if (res.success) {
  cAllRequests = cAllRequests.map(r =>
    r.id === id ? { ...r, status: 'sent' } : r
  );
  renderLORTable(cAllRequests);
}
```

} catch (err) {
console.error(err);
}
}

/* ========================= FILTERS ========================= */

function setupFilters() {
const statusFilter = document.getElementById('cFilterStatus');
const branchFilter = document.getElementById('cFilterBranch');
const searchInput  = document.getElementById('cSearchInput');
const resetBtn     = document.getElementById('cResetBtn');

const applyFilters = () => {
if (currentView !== "lor") return;

```
let filtered = [...cAllRequests];

if (statusFilter.value) {
  filtered = filtered.filter(r => r.status === statusFilter.value);
}

if (branchFilter.value) {
  filtered = filtered.filter(r => r.branch === branchFilter.value);
}

const q = searchInput.value.toLowerCase();

if (q) {
  filtered = filtered.filter(r =>
    r.studentName.toLowerCase().includes(q) ||
    r.usn.toLowerCase().includes(q)
  );
}

renderLORTable(filtered);
```

};

statusFilter.addEventListener('change', applyFilters);
branchFilter.addEventListener('change', applyFilters);
searchInput.addEventListener('input', applyFilters);

resetBtn.addEventListener('click', () => {
statusFilter.value = '';
branchFilter.value = '';
searchInput.value  = '';
renderLORTable(cAllRequests);
});
}

/* ========================= DOWNLOAD ========================= */

function downloadStudent(usn) {
const student = allStudents.find(s => s.usn === usn);
if (!student) return;

const dataStr = "data:text/json;charset=utf-8," +
encodeURIComponent(JSON.stringify(student, null, 2));

const a = document.createElement("a");
a.href = dataStr;
a.download = `${usn}.json`;
a.click();
}

/* ========================= EXPORT ========================= */

function exportCSV() {
if (currentView !== "lor") {
alert("Export available only for LOR data currently");
return;
}

const headers = ['ID','Student','USN','Branch','Status'];

const rows = cAllRequests.map(r => [
r.id, r.studentName, r.usn, r.branch, r.status
]);

const csv = [headers, ...rows].map(r => r.join(',')).join('\n');

const blob = new Blob([csv], { type: 'text/csv' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = 'lor_requests.csv';
a.click();

URL.revokeObjectURL(url);
}

/* ========================= HELPERS ========================= */

function formatDate(d) {
if (!d) return '—';
return new Date(d).toLocaleDateString('en-IN');
}

function capitalize(s) {
return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
