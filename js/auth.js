/* auth.js
   Handles professor and student login + student signup.
   Uses fetch to interact with PHP backend (see /backend/api)
*/

// Professor login form handling
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleProfLogin);

    const studentLogin = document.getElementById('studentLoginForm');
    if (studentLogin) studentLogin.addEventListener('submit', handleStudentLogin);

    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);
});

async function handleProfLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const err = document.getElementById('errorMessage');
    if (!username || !password) { err.textContent = 'Remplissez tous les champs'; err.style.display='block'; return; }

    // Client-side quick override for local static setups (fallback)
    if (username === window.TEACHER_CREDENTIALS.username && password === window.TEACHER_CREDENTIALS.password) {
        sessionStorage.setItem('user_logged_in', 'true');
        sessionStorage.setItem('current_user', username);
        sessionStorage.setItem('current_user_display', window.TEACHER_CREDENTIALS.name || username);
        sessionStorage.setItem('current_user_id', 'local');
        sessionStorage.setItem('current_user_modules', JSON.stringify(window.TEACHER_CREDENTIALS.modules || {}));
        window.location.href = 'gestion.html';
        return;
    }

    try {
        const res = await fetch(window.API_BASE_URL + '/login_prof.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            err.style.display = 'none';
            sessionStorage.setItem('user_logged_in', 'true');
            sessionStorage.setItem('current_user', data.username);
            sessionStorage.setItem('current_user_display', data.name);
            sessionStorage.setItem('current_user_id', data.id);
            sessionStorage.setItem('current_user_modules', JSON.stringify({ [data.module]: [data.module] }));
            window.location.href = 'gestion.html';
        } else {
            err.textContent = data.error || 'Identifiants invalides';
            err.style.display = 'block';
        }
    } catch (e) {
        // Backend unreachable - try local fallback with hardcoded credentials
        console.warn('Backend unreachable, trying local fallback', e);
        if (username === window.TEACHER_CREDENTIALS.username && password === window.TEACHER_CREDENTIALS.password) {
            sessionStorage.setItem('user_logged_in', 'true');
            sessionStorage.setItem('current_user', username);
            sessionStorage.setItem('current_user_display', window.TEACHER_CREDENTIALS.name || username);
            sessionStorage.setItem('current_user_id', 'local');
            sessionStorage.setItem('current_user_modules', JSON.stringify(window.TEACHER_CREDENTIALS.modules || {}));
            window.location.href = 'gestion.html';
            return;
        }
        err.textContent = 'Identifiants invalides';
        err.style.display = 'block';
    }
}

async function handleStudentLogin(e) {
    e.preventDefault();
    const email = document.getElementById('studentEmail').value.trim();
    const password = document.getElementById('studentPassword').value;
    const err = document.getElementById('studentError');
    if (!email || !password) { err.textContent = 'Remplissez tous les champs'; err.style.display='block'; return; }

    try {
        const res = await fetch(window.API_BASE_URL + '/login_student.php', {
            method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            sessionStorage.setItem('student_logged_in', 'true');
            sessionStorage.setItem('student_id', data.id);
            sessionStorage.setItem('student_name', data.nom + ' ' + data.prenom);
            window.location.href = 'student_space.html';
        } else {
            err.textContent = data.error || 'Identifiants invalides'; err.style.display = 'block';
        }
    } catch (e) {
        err.textContent = 'Erreur réseau, réessayez'; err.style.display = 'block';
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const nom = (document.getElementById('signupNom') || {}).value || '';
    const prenom = (document.getElementById('signupPrenom') || {}).value || '';
    const email = (document.getElementById('signupEmail') || {}).value || '';
    const filiere = (document.getElementById('signupFiliere') || {}).value || '';
    const zk_num = (document.getElementById('signupNum') || {}).value || '';
    const password = (document.getElementById('signupCode') || {}).value || '';
    const msg = document.getElementById('signupMsg');

    if (!nom || !prenom || !email || !filiere || !password) { msg.textContent = 'Remplissez tous les champs requis'; msg.style.display = 'block'; return; }
    if (!/@asp\.me$/i.test(email)) { msg.textContent = "L'email doit se terminer par @asp.me"; msg.style.display='block'; return; }

    try {
        const res = await fetch(window.API_BASE_URL + '/signup_student.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ nom, prenom, email, filiere, zk_num, password }) });
        const data = await res.json();
        if (data.success) {
            msg.style.display = 'none';
            alert('Inscription réussie, vous pouvez vous connecter.');
            window.location.href = 'student_login.html';
        } else {
            msg.textContent = data.error || 'Erreur inscription'; msg.style.display='block';
        }
    } catch (e) {
        // Backend unreachable - save locally
        console.warn('Backend unreachable, saving student locally', e);
        const students = JSON.parse(localStorage.getItem('local_students') || '[]');
        if (students.find(s => s.email === email)) {
            msg.textContent = 'Email déjà inscrit'; msg.style.display='block'; return;
        }
        const hash = btoa(password); // simple encoding for demo (not secure - use backend for production)
        students.push({ id: Date.now(), nom, prenom, email, filiere, zk_num, password_hash: hash });
        localStorage.setItem('local_students', JSON.stringify(students));
        msg.style.display = 'none';
        alert('Inscription réussie (mode local), vous pouvez vous connecter.');
        window.location.href = 'student_login.html';
    }
}
