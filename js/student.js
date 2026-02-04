/* student.js - student space rendering */

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('studentName')) {
        const name = sessionStorage.getItem('student_name') || 'Étudiant';
        document.getElementById('studentName').textContent = name;
        const id = sessionStorage.getItem('student_id') || new URLSearchParams(location.search).get('student_id');
        if (id) loadStudentRecords(id);
    }
});

async function loadStudentRecords(id) {
    try {
        const res = await fetch(`${window.API_BASE_URL}/get_attendance.php?student_id=${encodeURIComponent(id)}`);
        const data = await res.json();
        const container = document.getElementById('studentRecords');
        if (!data.records || !data.records.length) { container.innerHTML = '<p>Aucune présence enregistrée.</p>'; return; }
        let html = '<table><thead><tr><th>Date</th><th>Statut</th></tr></thead><tbody>';
        let present = 0;
        data.records.forEach(r => { html += `<tr><td>${r.date}</td><td>${r.status}</td></tr>`; if (r.status==='present') present++; });
        html += '</tbody></table>';
        container.innerHTML = html;
        const pct = Math.round((present / data.records.length) * 100);
        document.getElementById('studentStats').textContent = `Taux présence: ${pct}% (${present}/${data.records.length})`;
    } catch (e) {
        console.warn('Could not load attendance', e);
        document.getElementById('studentRecords').textContent = 'Erreur de chargement';
    }
}
