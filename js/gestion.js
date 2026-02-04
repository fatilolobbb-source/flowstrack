/* gestion.js
   Handles professor view: weeks initialization, loading students, updating table and marking attendance.
*/

document.addEventListener('DOMContentLoaded', () => {
    initializeWeeks();
    if (document.getElementById('filiereSelect')) {
        document.getElementById('filiereSelect').addEventListener('change', () => { document.getElementById('semaineSelect').value=''; });
    }
});

function initializeWeeks() {
    const semaineSelect = document.getElementById('semaineSelect');
    if (!semaineSelect) return;
    while (semaineSelect.options.length > 1) semaineSelect.remove(1);
    for (let i = 1; i <= 12; i++) {
        const opt = document.createElement('option'); opt.value = i; opt.textContent = 'Semaine ' + i; semaineSelect.appendChild(opt);
    }
}

async function loadStudents() {
    const filiere = document.getElementById('filiereSelect').value;
    const semaine = document.getElementById('semaineSelect').value;
    const tableContainer = document.getElementById('tableContainer');
    if (!filiere || !semaine) { tableContainer.style.display='none'; return; }
    tableContainer.style.display='block';

    try {
        const res = await fetch(`${window.API_BASE_URL}/get_students.php?filiere=${encodeURIComponent(filiere)}`);
        const students = await res.json();
        renderStudentTable(students, filiere, semaine);
    } catch (e) {
        console.warn('Could not load students', e);
        alert('Erreur lors du chargement des étudiants');
    }
}

function renderStudentTable(students, filiere, semaine) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    students.forEach((s, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx+1}</td>
            <td>${s.nom}</td>
            <td>${s.prenom}</td>
            <td>
                <button class="status-btn" onclick="markStatus(${s.id}, '${filiere}', '${semaine}', 'present')">Présent</button>
                <button class="status-btn" onclick="markStatus(${s.id}, '${filiere}', '${semaine}', 'absent')">Absent</button>
            </td>
            <td><button class="btn-detail" onclick="openDetail(${s.id})">Détail</button></td>
        `;
        tbody.appendChild(tr);
    });
}

async function markStatus(student_id, filiere, semaine, status) {
    const date = new Date();
    // For simplicity we store by date; week-specific logic can be added
    try {
        await fetch(`${window.API_BASE_URL}/mark_attendance.php`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ student_id, date: date.toISOString().slice(0,10), status }) });
        // Refresh table to get latest data if needed
        loadStudents();
    } catch (e) {
        console.warn('Failed mark', e);
        alert('Impossible de marquer la présence');
    }
}

function openDetail(student_id) {
    // Load student history via get_attendance
    window.location.href = `student_space.html?student_id=${student_id}`;
}

async function importDAT() {
    const filiere = document.getElementById('filiereSelect').value;
    if (!filiere) return alert('Sélectionnez une filière d\'abord');
    const input = document.createElement('input'); input.type='file'; input.accept='.dat,.txt';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const form = new FormData(); form.append('file', file); form.append('filiere', filiere);
        const res = await fetch(`${window.API_BASE_URL}/import_dat.php`, { method: 'POST', body: form });
        const data = await res.json();
        if (data.success) { alert('Import terminé: ' + (data.count||0) + ' présences marquées'); loadStudents(); }
        else alert('Erreur import: ' + (data.error||'unknown'));
    };
    input.click();
}
