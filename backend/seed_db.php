<?php
// Run this script once to create tables and seed sample professor and some students.
require_once __DIR__ . '/api/config.php';
$pdo = get_pdo();

try {
    // Create tables
    $pdo->exec("CREATE TABLE IF NOT EXISTS professors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        module VARCHAR(255) DEFAULT ''
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        prenom VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        filiere VARCHAR(128) NOT NULL,
        zk_num VARCHAR(64) DEFAULT NULL,
        password_hash VARCHAR(255) DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $pdo->exec("CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present','absent') NOT NULL,
        teacher_id INT DEFAULT NULL,
        module VARCHAR(255) DEFAULT NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES professors(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Insert a default professor if not exists
    $stmt = $pdo->prepare('SELECT count(*) FROM professors WHERE username = ?');
    $stmt->execute(['professeur']);
    if ($stmt->fetchColumn() == 0) {
        $hash = password_hash('ENSA2024', PASSWORD_DEFAULT);
        $stmt2 = $pdo->prepare('INSERT INTO professors (username, password_hash, name, module) VALUES (?, ?, ?, ?)');
        $stmt2->execute(['professeur', $hash, 'Ahmed Aberqi', 'Algèbre']);
    }

    // Insert some sample students if empty
    $count = $pdo->query('SELECT COUNT(*) FROM students')->fetchColumn();
    if ($count == 0) {
        $students = [
            ['IBRAHIM', 'Ahmed', 'ahmed@asp.me', 'isdia', '1001'],
            ['HASSAN', 'Sara', 'sara@asp.me', 'isdia', '1002'],
            ['ANAS', 'Anas', 'anas@asp.me', 'info', '2001'],
            ['KHADIJA', 'Khadija', 'khadija@asp.me', 'info', '2002']
        ];
        $ins = $pdo->prepare('INSERT INTO students (nom, prenom, email, filiere, zk_num) VALUES (?, ?, ?, ?, ?)');
        foreach ($students as $s) $ins->execute($s);
    }

    echo "Seed completed.\n";
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}

?>