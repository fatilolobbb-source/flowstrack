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
        console.warn('Could not load students from backend, using local fallback', e);
        // Fallback: use hardcoded students
        const fallbackStudents = {
            isdia: [{ id: 1, nom: 'IBRAHIM', prenom: 'Ahmed' }, { id: 2, nom: 'HASSAN', prenom: 'Sara' }],
            info: [{ id: 3, nom: 'ANAS', prenom: 'Anas' }, { id: 4, nom: 'KHADIJA', prenom: 'Khadija' }],
            logiciel: [{ id: 5, nom: 'RANIA', prenom: 'Rania' }],
            cyber: [{ id: 6, nom: 'ZINEB', prenom: 'Zineb' }]
        };
        const students = fallbackStudents[filiere] || [];
        renderStudentTable(students, filiere, semaine);
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
        const content = await file.text();
        const lines = content.split('\n');
        const zkNums = [];
        lines.forEach(line => {
            const parts = line.trim().split(/[\s,;]+/);
            if (parts[0]) zkNums.push(parts[0]);
        });
        if (!zkNums.length) return alert('Aucun numéro trouvé');

        // Try server first
        try {
            const form = new FormData(); form.append('file', file); form.append('filiere', filiere);
            const res = await fetch(`${window.API_BASE_URL}/import_dat.php`, { method: 'POST', body: form });
            const data = await res.json();
            if (data.success) { alert('Import: ' + (data.count||0) + ' présences marquées'); loadStudents(); return; }
        } catch (e) { console.warn('Server import failed, trying local'); }

        // Local fallback: load data from localStorage and mark present/absent based on ZK match
        const attendance = JSON.parse(localStorage.getItem('attendance_' + filiere) || '{}');
        const semaine = document.getElementById('semaineSelect').value;
        const date = new Date().toISOString().slice(0, 10);
        const key = date + '_' + semaine;
        
        // Hardcoded students with ZK numbers for demo
        const studentDb = {
            isdia: [{ id: 1, nom: 'IBRAHIM', zk_num: '1001' }, { id: 2, nom: 'HASSAN', zk_num: '1002' }],
            info: [{ id: 3, nom: 'ANAS', zk_num: '2001' }, { id: 4, nom: 'KHADIJA', zk_num: '2002' }],
            logiciel: [{ id: 5, nom: 'RANIA', zk_num: '3001' }],
            cyber: [{ id: 6, nom: 'ZINEB', zk_num: '4001' }]
        };
        
        const students = studentDb[filiere] || [];
        let marked = 0;
        students.forEach(s => {
            const status = zkNums.includes(s.zk_num) ? 'present' : 'absent';
            if (!attendance[key]) attendance[key] = {};
            attendance[key][s.id] = status;
            if (status === 'present') marked++;
        });
        localStorage.setItem('attendance_' + filiere, JSON.stringify(attendance));
        alert('Import local: ' + marked + ' présences marquées');
        loadStudents();
    };
    input.click();
}
