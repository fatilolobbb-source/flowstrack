<?php
require_once __DIR__ . '/config.php';
$pdo = get_pdo();
$data = json_body();

$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing fields']);
    exit;
}

$stmt = $pdo->prepare('SELECT id, nom, prenom, email, filiere, password_hash FROM students WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$stu = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$stu || !password_verify($password, $stu['password_hash'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
    exit;
}

echo json_encode(['success' => true, 'id' => (int)$stu['id'], 'nom' => $stu['nom'], 'prenom' => $stu['prenom'], 'email' => $stu['email'], 'filiere' => $stu['filiere']]);

?>