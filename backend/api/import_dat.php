<?php
require_once __DIR__ . '/config.php';
$pdo = get_pdo();
// Accept either uploaded file (multipart/form-data, field 'file') or raw text body
$filiere = isset($_POST['filiere']) ? trim($_POST['filiere']) : (isset($_GET['filiere']) ? trim($_GET['filiere']) : '');
$date = isset($_POST['date']) ? $_POST['date'] : date('Y-m-d');

$content = null;
if (!empty($_FILES['file']) && is_uploaded_file($_FILES['file']['tmp_name'])) {
    $content = file_get_contents($_FILES['file']['tmp_name']);
} else {
    // if raw POST body
    $raw = file_get_contents('php://input');
    if ($raw) $content = $raw;
}

if (!$content) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No file content']);
    exit;
}

$lines = preg_split('/\r?\n/', $content);
$zk_nums = [];
foreach ($lines as $line) {
    $line = trim($line);
    if ($line === '') continue;
    // split by whitespace or commas, take first column
    $parts = preg_split('/[\s,;]+/', $line);
    if (count($parts) > 0) {
        $zk_nums[] = $parts[0];
    }
}

if (empty($zk_nums)) {
    echo json_encode(['success' => false, 'error' => 'No ZK numbers found']);
    exit;
}

// Find students in this filiere with matching zk_num
if ($filiere) {
    $stmt = $pdo->prepare('SELECT id, zk_num FROM students WHERE LOWER(filiere)=LOWER(?)');
    $stmt->execute([$filiere]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} else {
    $stmt = $pdo->query('SELECT id, zk_num, filiere FROM students');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
}

$found = [];
foreach ($rows as $r) {
    if ($r['zk_num'] && in_array($r['zk_num'], $zk_nums)) {
        $found[] = $r['id'];
    }
}

// Mark found as present, others in same filiere as absent (for the date)
try {
    foreach ($rows as $r) {
        $sid = $r['id'];
        $status = in_array($sid, $found) ? 'present' : 'absent';
        // upsert
        $stmt = $pdo->prepare('SELECT id FROM attendance WHERE student_id = ? AND date = ? LIMIT 1');
        $stmt->execute([$sid, $date]);
        $ex = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($ex) {
            $u = $pdo->prepare('UPDATE attendance SET status = ? WHERE id = ?');
            $u->execute([$status, $ex['id']]);
        } else {
            $i = $pdo->prepare('INSERT INTO attendance (student_id, date, status) VALUES (?, ?, ?)');
            $i->execute([$sid, $date, $status]);
        }
    }
    echo json_encode(['success' => true, 'found' => $found, 'count' => count($found)]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

?>