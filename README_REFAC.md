Refactor + PHP Backend integration

What I added:
- /backend/api - PHP endpoints:
  - config.php, login_prof.php, login_student.php, signup_student.php, mark_attendance.php, import_dat.php, get_students.php, get_attendance.php
- backend/seed_db.php - create tables + seed an example professor and students
- Frontend cleaned pages and JS:
  - student_login.html, student_space.html
  - Modified login.html and signup.html to use `js/auth.js`
  - Added `js/auth.js`, `js/gestion.js`, `js/student.js`
- Updated `js/config.js` to default `API_BASE_URL` to `/backend/api` and professor password to `ENSA2024`.

Quick fetch examples (from frontend):

// Professor login
fetch('/backend/api/login_prof.php', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username:'professeur', password:'ENSA2024' }) })
  .then(r => r.json()).then(console.log)

// Get students by filiere
fetch('/backend/api/get_students.php?filiere=info').then(r=>r.json()).then(console.log)

// Mark attendance
fetch('/backend/api/mark_attendance.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ student_id: 1, date: '2026-02-04', status: 'present' }) })
  .then(r => r.json()).then(console.log)

How to run locally (XAMPP):
1. Copy project to htdocs (or configure virtualhost).
2. Create DB `flowtrack` using phpMyAdmin.
3. Adjust `backend/api/config.php` if your DB credentials differ.
4. Run `php backend/seed_db.php` to create tables and seed data.
5. Open http://localhost/<project>/index.html and test.

If you want, I can also:
- Add admin UI for managing professors and students.
- Implement impersonation and user management endpoints.

Next steps I will take after you confirm:
- Add unit tests or simple e2e tests if desired.
- Optionally remove legacy/unused files and prune repository as you requested (I'll do this only after you confirm backup/time to remove).
