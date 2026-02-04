/* gestion.js - Professeur: afficher le tableau d'absences pour une filière et semaine */

document.addEventListener('DOMContentLoaded', () => {
    // Afficher le nom du professeur et sa filière/module
    const name = sessionStorage.getItem('current_user_name') || 'Professeur';
    const filiere = sessionStorage.getItem('current_user_filiere') || '';
    const module = sessionStorage.getItem('current_user_module') || '';
    
    document.getElementById('profName').textContent = `Bienvenue, ${name}`;
    document.getElementById('profModule').textContent = `Filière assignée: ${filiere.toUpperCase()} | Module: ${module}`;
    
    // Le professeur ne peut voir que sa filière
    const filiereSelect = document.getElementById('filiereSelect');
    if (filiereSelect) {
        filiereSelect.value = filiere;
        filiereSelect.disabled = true; // Filière fixe
    }
    
    initializeWeeks();
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
    const filiere = sessionStorage.getItem('current_user_filiere') || '';
    const semaine = document.getElementById('semaineSelect').value;
    const tableContainer = document.getElementById('tableContainer');
    
    if (!semaine) { 
        tableContainer.style.display = 'none'; 
        return; 
    }
    
    tableContainer.style.display = 'block';
    
    // Charger les étudiants inscrits pour cette filière
    const students = window.STUDENTS_BY_FILIERE[filiere] || [];
    
    // Charger les données de présence sauvegardées pour cette semaine
    const attendance = JSON.parse(localStorage.getItem(`attendance_${filiere}_${semaine}`) || '{}');
    
    // Remplir le tableau
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    students.forEach((student) => {
        const tr = document.createElement('tr');
        const status = attendance[student.id] || ''; // '' = pas marqué, 'present' ou 'absent'
        
        tr.innerHTML = `
            <td>${student.num}</td>
            <td>${student.nom}</td>
            <td>${student.prenom}</td>
            <td>
                <button class="status-btn ${status === 'present' ? 'present' : ''}" onclick="markStatus(${student.id}, '${filiere}', ${semaine}, 'present')">✓ Présent</button>
                <button class="status-btn ${status === 'absent' ? 'absent' : ''}" onclick="markStatus(${student.id}, '${filiere}', ${semaine}, 'absent')">✗ Absent</button>
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

function openDetail(student_id, filiere) {
    // Ouvrir la page détail (student_space.html) avec l'ID de l'étudiant
    window.location.href = `student_space.html?student_id=${student_id}&filiere=${filiere}`;
}

function importDAT() {
    const filiere = sessionStorage.getItem('current_user_filiere') || '';
    const semaine = document.getElementById('semaineSelect').value;
    
    if (!semaine) return alert('Sélectionnez une semaine d\'abord');
    
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
        const students = window.STUDENTS_BY_FILIERE[filiere] || [];
        
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
