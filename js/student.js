/* student.js - Afficher le détail d'un étudiant et ses présences */

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(location.search);
    const student_id = params.get('student_id');
    const filiere = params.get('filiere');
    
    if (!student_id || !filiere) {
        document.getElementById('studentTitle').textContent = 'Erreur: étudiant non trouvé';
        return;
    }
    
    // Trouver l'étudiant
    const students = window.STUDENTS_BY_FILIERE[filiere] || [];
    const student = students.find(s => s.id == student_id);
    
    if (!student) {
        document.getElementById('studentTitle').textContent = 'Erreur: étudiant non trouvé';
        return;
    }
    
    // Afficher les infos
    document.getElementById('studentTitle').textContent = `${student.nom} ${student.prenom}`;
    document.getElementById('studentInfo').innerHTML = `<strong>Numéro:</strong> ${student.num} | <strong>Filière:</strong> ${filiere.toUpperCase()} | <strong>ZK:</strong> ${student.zk_num}`;
    
    // Charger et afficher les présences pour toutes les semaines
    loadAttendance(student_id, filiere);
});

function loadAttendance(student_id, filiere) {
    const tbody = document.getElementById('attendanceBody');
    tbody.innerHTML = '';
    
    let total = 0;
    let present = 0;
    
    // Parcourir les 12 semaines et afficher les présences sauvegardées
    for (let semaine = 1; semaine <= 12; semaine++) {
        const attendance = JSON.parse(localStorage.getItem(`attendance_${filiere}_${semaine}`) || '{}');
        const status = attendance[student_id] || 'non renseigné';
        
        if (status !== 'non renseigné') {
            total++;
            if (status === 'present') present++;
        }
        
        const tr = document.createElement('tr');
        const statusColor = status === 'present' ? 'green' : (status === 'absent' ? 'red' : 'gray');
        tr.innerHTML = `
            <td style="padding:8px; border:1px solid #ddd;">Semaine ${semaine}</td>
            <td style="padding:8px; border:1px solid #ddd; color:${statusColor}; font-weight:bold;">${status}</td>
        `;
        tbody.appendChild(tr);
    }
    
    // Afficher le taux de présence
    if (total > 0) {
        const pct = Math.round((present / total) * 100);
        document.getElementById('statsText').textContent = `Taux de présence: ${pct}% (${present}/${total} jours)`;
    } else {
        document.getElementById('statsText').textContent = 'Aucune présence enregistrée';
    }
}

function goBack() {
    window.location.href = 'gestion.html';
}
