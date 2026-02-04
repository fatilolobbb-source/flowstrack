<?php
require_once __DIR__ . '/config.php';
$pdo = get_pdo();
// Accept student_id or filiere & date range
$student_id = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
$filiere = isset($_GET['filiere']) ? trim($_GET['filiere']) : '';
$start = isset($_GET['start']) ? $_GET['start'] : null; // YYYY-MM-DD
$end = isset($_GET['end']) ? $_GET['end'] : null;

if ($student_id) {
    $stmt = $pdo->prepare('SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date DESC');
    $stmt->execute([$student_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['student_id' => $student_id, 'records' => $rows]);
    exit;
}

if ($filiere && $start && $end) {
    $stmt = $pdo->prepare('SELECT a.student_id, a.date, a.status, s.nom, s.prenom FROM attendance a JOIN students s ON s.id = a.student_id WHERE LOWER(s.filiere) = LOWER(?) AND a.date BETWEEN ? AND ? ORDER BY a.date DESC');
    $stmt->execute([$filiere, $start, $end]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

echo json_encode([]);

?>