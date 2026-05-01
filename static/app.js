document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
  loadStats();
});

// ── Load & render students ───────────────────────────────────────
async function loadStudents(search = "") {
  const url = search ? `/students?search=${encodeURIComponent(search)}` : "/students";
  const res = await fetch(url);
  const students = await res.json();
  renderTable(students);
}

function renderTable(students) {
  const tbody = document.getElementById("table-body");
  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="empty-state">No students found.</td></tr>`;
    return;
  }
  tbody.innerHTML = students.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${s.name}</strong></td>
      <td>${s.maths}</td>
      <td>${s.science}</td>
      <td>${s.english}</td>
      <td>${s.hindi}</td>
      <td>${s.computer}</td>
      <td><strong>${s.total}</strong></td>
      <td>${s.percentage}%</td>
      <td><span class="grade grade-${s.grade}">${s.grade}</span></td>
      <td class="action-btns">
        <button class="edit-btn" onclick="openEditModal(${s.id})">Edit</button>
        <button class="report-btn" onclick="openReportModal(${s.id})">Report</button>
        <button class="del-btn" onclick="deleteStudent(${s.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

// ── Add student ──────────────────────────────────────────────────
async function addStudent() {
  const btn = document.getElementById("add-btn");
  const data = {
    name:     document.getElementById("name").value,
    maths:    document.getElementById("maths").value,
    science:  document.getElementById("science").value,
    english:  document.getElementById("english").value,
    hindi:    document.getElementById("hindi").value,
    computer: document.getElementById("computer").value,
  };

  if (!data.name.trim()) { showMsg("Please enter a student name.", "error"); return; }
  for (let s of ["maths","science","english","hindi","computer"]) {
    if (data[s] === "") { showMsg(`Please enter marks for ${s}.`, "error"); return; }
  }

  btn.disabled = true; btn.textContent = "Adding...";
  try {
    const res = await fetch("/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (res.ok) {
      showMsg(`Added! Grade: ${result.grade} (${result.percentage}%)`, "success");
      clearForm(); loadStudents(); loadStats();
    } else {
      showMsg(result.error || "Something went wrong.", "error");
    }
  } catch (err) { showMsg("Could not connect to server.", "error"); }
  btn.disabled = false; btn.textContent = "Add Student";
}

// ── Delete student ───────────────────────────────────────────────
async function deleteStudent(id) {
  if (!confirm("Delete this student record?")) return;
  const res = await fetch(`/delete/${id}`, { method: "DELETE" });
  if (res.ok) { loadStudents(document.getElementById("search").value); loadStats(); }
}

// ── Search ───────────────────────────────────────────────────────
function searchStudents() {
  loadStudents(document.getElementById("search").value);
}

// ── Stats ────────────────────────────────────────────────────────
async function loadStats() {
  const res = await fetch("/stats");
  const s = await res.json();
  document.getElementById("stat-total").textContent = s.total_students ?? "0";
  document.getElementById("stat-avg").textContent   = s.class_average ? `${s.class_average}%` : "—";
  document.getElementById("stat-high").textContent  = s.highest_percentage ? `${s.highest_percentage}%` : "—";
  document.getElementById("stat-top").textContent   = s.top_student ? s.top_student.name : "—";
}

// ── EDIT MODAL ───────────────────────────────────────────────────
async function openEditModal(id) {
  const res = await fetch(`/students/${id}`);
  const s = await res.json();
  document.getElementById("edit-id").value      = s.id;
  document.getElementById("edit-name").value    = s.name;
  document.getElementById("edit-maths").value   = s.maths;
  document.getElementById("edit-science").value = s.science;
  document.getElementById("edit-english").value = s.english;
  document.getElementById("edit-hindi").value   = s.hindi;
  document.getElementById("edit-computer").value= s.computer;
  document.getElementById("edit-msg").textContent = "";
  document.getElementById("edit-overlay").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("edit-overlay").style.display = "none";
}
function closeEdit(e) {
  if (e.target.id === "edit-overlay") closeEditModal();
}

async function saveEdit() {
  const id  = document.getElementById("edit-id").value;
  const btn = document.getElementById("save-btn");
  const data = {
    name:     document.getElementById("edit-name").value,
    maths:    document.getElementById("edit-maths").value,
    science:  document.getElementById("edit-science").value,
    english:  document.getElementById("edit-english").value,
    hindi:    document.getElementById("edit-hindi").value,
    computer: document.getElementById("edit-computer").value,
  };

  btn.disabled = true; btn.textContent = "Saving...";
  const res = await fetch(`/edit/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (res.ok) {
    closeEditModal();
    loadStudents(document.getElementById("search").value);
    loadStats();
    showMsg(`Updated! New grade: ${result.grade} (${result.percentage}%)`, "success");
  } else {
    const msg = document.getElementById("edit-msg");
    msg.textContent = result.error || "Something went wrong.";
    msg.className = "msg error";
  }
  btn.disabled = false; btn.textContent = "Save Changes";
}

// ── REPORT CARD MODAL ────────────────────────────────────────────
async function openReportModal(id) {
  const res = await fetch(`/students/${id}`);
  const s = await res.json();

  const gradeColor = {A:"#16a34a", B:"#1d4ed8", C:"#854d0e", D:"#c2410c", Fail:"#b91c1c"};
  const color = gradeColor[s.grade] || "#333";
  const today = new Date().toLocaleDateString("en-IN", {day:"2-digit", month:"long", year:"numeric"});

  const subjects = [
    { name: "Mathematics",       marks: s.maths },
    { name: "Science",           marks: s.science },
    { name: "English",           marks: s.english },
    { name: "Hindi",             marks: s.hindi },
    { name: "Computer Science",  marks: s.computer },
  ];

  const rows = subjects.map(sub => {
    const pct = sub.marks;
    const bar = `<div style="background:#e5e7eb;border-radius:4px;height:8px;width:100%">
      <div style="background:${color};width:${pct}%;height:8px;border-radius:4px"></div></div>`;
    return `<tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f2f5">${sub.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f2f5;text-align:center;font-weight:500">${sub.marks}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f2f5;text-align:center">100</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f2f5;width:160px">${bar}</td>
    </tr>`;
  }).join("");

  document.getElementById("report-content").innerHTML = `
    <div id="printable-report" style="font-family:'Segoe UI',Arial,sans-serif;padding:0">
      <div style="text-align:center;padding:1.5rem 0 1rem;border-bottom:2px solid #2c3e7a">
        <div style="font-size:1.4rem;font-weight:700;color:#2c3e7a">Student Report Card</div>
        <div style="font-size:0.85rem;color:#888;margin-top:4px">Generated on ${today}</div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;padding:1.2rem 0;border-bottom:1px solid #eef0f5">
        <div>
          <div style="font-size:1.2rem;font-weight:600;color:#1a1a2e">${s.name}</div>
          <div style="font-size:0.85rem;color:#888;margin-top:2px">Student ID: ${s.id}</div>
        </div>
        <div style="text-align:center;background:${color}18;border:2px solid ${color};border-radius:50%;width:64px;height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center">
          <div style="font-size:1.6rem;font-weight:700;color:${color};line-height:1">${s.grade}</div>
          <div style="font-size:0.65rem;color:${color}">GRADE</div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:1rem 0">
        <thead>
          <tr style="background:#f8f9fc">
            <th style="padding:10px 12px;text-align:left;font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.05em">Subject</th>
            <th style="padding:10px 12px;text-align:center;font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.05em">Marks</th>
            <th style="padding:10px 12px;text-align:center;font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.05em">Max</th>
            <th style="padding:10px 12px;font-size:0.75rem;color:#888;text-transform:uppercase;letter-spacing:0.05em">Performance</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:1rem;padding-top:1rem;border-top:1px solid #eef0f5">
        <div style="text-align:center;background:#f8f9fc;border-radius:8px;padding:12px">
          <div style="font-size:0.72rem;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Total Marks</div>
          <div style="font-size:1.4rem;font-weight:600;color:#2c3e7a">${s.total} / 500</div>
        </div>
        <div style="text-align:center;background:#f8f9fc;border-radius:8px;padding:12px">
          <div style="font-size:0.72rem;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Percentage</div>
          <div style="font-size:1.4rem;font-weight:600;color:#2c3e7a">${s.percentage}%</div>
        </div>
        <div style="text-align:center;background:${color}18;border-radius:8px;padding:12px;border:1px solid ${color}40">
          <div style="font-size:0.72rem;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px">Final Grade</div>
          <div style="font-size:1.4rem;font-weight:700;color:${color}">${s.grade}</div>
        </div>
      </div>

      <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #eef0f5;font-size:0.78rem;color:#aaa;text-align:center">
        Student Management System &nbsp;|&nbsp; Grade: A(75%+) B(60%+) C(45%+) D(33%+) Fail(&lt;33%)
      </div>
    </div>
  `;
  document.getElementById("report-overlay").style.display = "flex";
}

function closeReportModal() {
  document.getElementById("report-overlay").style.display = "none";
}
function closeReport(e) {
  if (e.target.id === "report-overlay") closeReportModal();
}

function printReport() {
  const content = document.getElementById("printable-report").innerHTML;
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>Report Card</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; color: #1a1a2e; }
      @media print { body { margin: 0; } }
    </style>
    </head><body>${content}</body></html>
  `);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); w.close(); }, 400);
}

// ── Export CSV ───────────────────────────────────────────────────
function exportCSV() {
  window.location.href = "/export/csv";
}

// ── Helpers ──────────────────────────────────────────────────────
function showMsg(text, type) {
  const msg = document.getElementById("form-msg");
  msg.textContent = text;
  msg.className = `msg ${type}`;
  setTimeout(() => { msg.textContent = ""; msg.className = "msg"; }, 4000);
}

function clearForm() {
  ["name","maths","science","english","hindi","computer"].forEach(id => {
    document.getElementById(id).value = "";
  });
}