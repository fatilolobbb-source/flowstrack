<?php
require_once __DIR__ . '/config.php';
$pdo = get_pdo();
$data = json_body();

$student_id = isset($data['student_id']) ? (int)$data['student_id'] : 0;
$date = isset($data['date']) ? $data['date'] : date('Y-m-d');
$status = isset($data['status']) && in_array($data['status'], ['present','absent']) ? $data['status'] : null;
$teacher_id = isset($data['teacher_id']) ? (int)$data['teacher_id'] : null;
$module = isset($data['module']) ? $data['module'] : null;

if (!$student_id || !$status) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing student_id or status']);
    exit;
}

// Upsert: if record exists for student+date, update; else insert
try {
    $stmt = $pdo->prepare('SELECT id FROM attendance WHERE student_id = ? AND date = ? LIMIT 1');
    $stmt->execute([$student_id, $date]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($existing) {
        $upd = $pdo->prepare('UPDATE attendance SET status = ?, teacher_id = ?, module = ? WHERE id = ?');
        $upd->execute([$status, $teacher_id, $module, $existing['id']]);
    } else {
        $ins = $pdo->prepare('INSERT INTO attendance (student_id, date, status, teacher_id, module) VALUES (?, ?, ?, ?, ?)');
        $ins->execute([$student_id, $date, $status, $teacher_id, $module]);
    }
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

?>