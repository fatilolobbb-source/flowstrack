/* gestion.js - Professeur: afficher le tableau d'absences pour une filière et semaine */

document.addEventListener('DOMContentLoaded', () => {
    // Afficher le nom du professeur et sa filière/module
    const name = sessionStorage.getItem('current_user_name') || 'Professeur';
    const filiereStored = sessionStorage.getItem('current_user_filiere') || '';
    const moduleStored = sessionStorage.getItem('current_user_module') || '';

    document.getElementById('profName').textContent = `Bienvenue, ${name}`;
    document.getElementById('profModule').textContent = moduleStored ? `Filière assignée: ${filiereStored.toUpperCase()} | Module: ${moduleStored}` : '';

    // Remplir dynamiquement la liste des filières depuis la config
    const filiereSelect = document.getElementById('filiereSelect');
    if (filiereSelect && window.FILIERE_MODULE_MAP) {
        // Si les options ont été placées en dur, on les garde, sinon on reconstruit
        // Assurer qu'au moins les clés sont présentes
        Object.keys(window.FILIERE_MODULE_MAP).forEach(key => {
            if (![...filiereSelect.options].some(o => o.value === key)) {
                const opt = document.createElement('option');
                opt.value = key; opt.textContent = key.toUpperCase(); filiereSelect.appendChild(opt);
            }
        });

        // Pré-sélection seulement si aucune option n'est encore choisie
        if (filiereStored && !filiereSelect.value) {
    filiereSelect.value = filiereStored;
}
filiereSelect.disabled = false;

    }

    initializeWeeks();

    // Si une filière est sélectionnée, charger ses étudiants
    if (filiereSelect && filiereSelect.value) loadStudents();
});

function initializeWeeks() {
    const semaineSelect = document.getElementById('semaineSelect');
    if (!semaineSelect) return;
    while (semaineSelect.options.length > 1) semaineSelect.remove(1);
    for (let i = 1; i <= 12; i++) {
        const opt = document.createElement('option'); opt.value = i; opt.textContent = 'Semaine ' + i; semaineSelect.appendChild(opt);
    }
}

function updateTableau() {
    const filiere = document.getElementById('filiereSelect').value || sessionStorage.getItem('current_user_filiere') || '';
    const semaine = document.getElementById('semaineSelect').value;
    const tableContainer = document.getElementById('tableContainer');
    
   if (!semaine) {
    if (tableContainer) tableContainer.style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    return;
}
document.getElementById('emptyState').style.display = 'none';
if (tableContainer) tableContainer.style.display = 'block';

    
    tableContainer.style.display = 'block';
    
    // Charger les étudiants inscrits pour cette filière (depuis backend si possible)
    const students = window.CURRENT_STUDENTS && Array.isArray(window.CURRENT_STUDENTS) ? window.CURRENT_STUDENTS : (window.STUDENTS_BY_FILIERE[filiere] || []);
    
    // Charger les données de présence sauvegardées pour cette semaine
    const attendance = JSON.parse(localStorage.getItem(`attendance_${filiere}_${semaine}`) || '{}');
    
    // Remplir le tableau
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    students.forEach((student) => {
        const tr = document.createElement('tr');
        const status = attendance[student.id] || ''; // '' = pas marqué, 'present' ou 'absent'
        tr.innerHTML = `
            <td>${student.num || ''}</td>
            <td>${student.nom || ''}</td>
            <td>${student.prenom || ''}</td>
            <td>
                <button class="status-btn ${status === 'present' ? 'present' : ''}" onclick="markStatus(${student.id}, '${filiere}', '${semaine}', 'present')">✓ Présent</button>
                <button class="status-btn ${status === 'absent' ? 'absent' : ''}" onclick="markStatus(${student.id}, '${filiere}', '${semaine}', 'absent')">✗ Absent</button>
            </td>
            <td><button class="btn-detail" onclick="openDetail(${student.id}, '${filiere}')">Détail</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function markStatus(student_id, filiere, semaine, status) {
    const attendance = JSON.parse(localStorage.getItem(`attendance_${filiere}_${semaine}`) || '{}');
    attendance[student_id] = status;
    localStorage.setItem(`attendance_${filiere}_${semaine}`, JSON.stringify(attendance));
    
    // Rafraîchir le tableau
    updateTableau();
}

// Charger les étudiants pour la filière sélectionnée (API puis fallback)
async function loadStudents() {
    const filiere = document.getElementById('filiereSelect').value;
    if (!filiere) return;

    // Sauvegarder la filière sélectionnée en session
    sessionStorage.setItem('current_user_filiere', filiere);

    // Auto-remplir le module depuis la map
    const moduleLabel = document.getElementById('moduleLabel');
    const moduleName = (window.FILIERE_MODULE_MAP && window.FILIERE_MODULE_MAP[filiere]) ? window.FILIERE_MODULE_MAP[filiere] : '';
    if (moduleLabel) moduleLabel.textContent = moduleName || '—';
    if (moduleName) sessionStorage.setItem('current_user_module', moduleName);

    // Essayer le backend
    let students = [];
    try {
        const url = `${window.API_BASE_URL.replace(/\/$/, '')}/get_students.php?filiere=${encodeURIComponent(filiere)}`;
        const res = await fetch(url, {cache: 'no-store'});
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length) students = data.map(s => ({ id: s.id, num: s.num || s.num || s.id, nom: s.nom || s.nom, prenom: s.prenom || s.prenom, zk_num: s.zk_num || s.deviceId || '' }));
        }
    } catch (e) {
        console.warn('API get_students failed, fallback to data file', e);
    }

    // Fallback: local embedded data file or config map
    if (!students.length) {
        try {
            const res2 = await fetch('data/students.json', {cache: 'no-store'});
            if (res2.ok) {
                const all = await res2.json();
                students = all.filter(s => (s.filiere || '').toLowerCase() === filiere.toLowerCase()).map((s, idx) => ({ id: s.id || idx+1, num: s.num || s.id || idx+1, nom: s.nom || '', prenom: s.prenom || '', zk_num: s.deviceId || s.code || '' }));
            }
        } catch (e) {
            // Dernier fallback: use window.STUDENTS_BY_FILIERE demo list
            students = window.STUDENTS_BY_FILIERE[filiere] || [];
        }
    }

    // Merge with locally-signed students (signup fallback)
    try {
        const local = JSON.parse(localStorage.getItem('local_students') || '[]');
        const localForFiliere = local.filter(s => (s.filiere || '').toLowerCase() === filiere.toLowerCase()).map((s, idx) => ({ id: s.id || `local_${idx}_${Date.now()}`, num: s.num || s.id || `L${idx+1}`, nom: s.nom || '', prenom: s.prenom || '', zk_num: s.zk_num || s.deviceId || '' }));
        // Merge, avoiding duplicates by zk_num or email/num
        const seen = new Set();
        const merged = [];
        [...localForFiliere, ...students].forEach(s => {
            const key = (s.zk_num || '') + '::' + (s.num || '') + '::' + (s.nom || '');
            if (!seen.has(key)) { seen.add(key); merged.push(s); }
        });
        students = merged;
    } catch (e) {
        // ignore
    }

    // Mettre en mémoire globale pour updateTableau
    window.CURRENT_STUDENTS = students;

    // Afficher tableau si semaine sélectionnée
    const semaine = document.getElementById('semaineSelect').value;
    if (semaine) updateTableau();
}

function openDetail(student_id, filiere) {
    // Ouvrir la page détail (student_space.html) avec l'ID de l'étudiant
    window.location.href = `student_space.html?student_id=${student_id}&filiere=${filiere}`;
}

function importDAT() {
    const filiere = sessionStorage.getItem('current_user_filiere') || '';
    if (!semaine) {
    if (tableContainer) tableContainer.style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    return;
}  
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.dat,.txt';
    
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
        
        if (!zkNums.length) return alert('Aucun numéro ZK trouvé');
        
        // Charger la présence sauvegardée pour cette semaine
        const attendance = JSON.parse(localStorage.getItem(`attendance_${filiere}_${semaine}`) || '{}');
        const students = window.CURRENT_STUDENTS && Array.isArray(window.CURRENT_STUDENTS) ? window.CURRENT_STUDENTS : (window.STUDENTS_BY_FILIERE[filiere] || []);
        
        let marked = 0;
        students.forEach(s => {
            const status = zkNums.includes(s.zk_num) ? 'present' : 'absent';
            attendance[s.id] = status;
            if (status === 'present') marked++;
        });
        
        localStorage.setItem(`attendance_${filiere}_${semaine}`, JSON.stringify(attendance));
        alert(`Import terminé: ${marked} présences marquées`);
        updateTableau();
    };
    
    input.click();
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}
