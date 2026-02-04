Setup instructions for backend (PHP + MySQL)

1) Create MySQL database
   - Using phpMyAdmin / MySQL CLI create a DB named `flowtrack` (or update `backend/api/config.php` DB_NAME constant if you want a different name).

2) Configure DB credentials
   - Edit `backend/api/config.php` and set DB_HOST, DB_NAME, DB_USER, DB_PASS accordingly.

3) Run the seed script to create tables and initial data
   - From project root: `php backend/seed_db.php`
   - It will create `professors`, `students`, `attendance` tables and insert one default professor (`professeur` / `ENSA2024`) and sample students.

4) Use XAMPP or other stack
   - Place this repo in your web server's document root (e.g., htdocs) or configure a virtual host pointing to the project root.
   - Access backend endpoints at `http://localhost/<project>/backend/api/<endpoint>.php`

5) Notes
   - Passwords are hashed with `password_hash()`; all SQL interactions use PDO with prepared statements.
   - For production, disable `Access-Control-Allow-Origin: *` and restrict origin, add HTTPS, and secure error reporting.
