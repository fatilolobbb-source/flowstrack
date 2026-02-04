<?php
require_once __DIR__ . '/config.php';
$pdo = get_pdo();
$data = json_body();

$username = isset($data['username']) ? trim($data['username']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing username or password']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, username, password_hash, name, module FROM professors WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
$prof = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$prof) {
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    exit;
}

if (!password_verify($password, $prof['password_hash'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    exit;
}

echo json_encode(['success' => true, 'id' => (int)$prof['id'], 'username' => $prof['username'], 'name' => $prof['name'], 'module' => $prof['module']]);

?>