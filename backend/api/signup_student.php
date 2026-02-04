<?php
require_once __DIR__ . '/config.php';
$pdo = get_pdo();
$data = json_body();

$nom = isset($data['nom']) ? trim($data['nom']) : '';
$prenom = isset($data['prenom']) ? trim($data['prenom']) : '';
$email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
$filiere = isset($data['filiere']) ? trim($data['filiere']) : '';
$zk_num = isset($data['zk_num']) ? trim($data['zk_num']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (!$nom || !$prenom || !$email || !$filiere || !$password) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing fields']);
    exit;
}

if (!preg_match('/@asp\.me$/i', $email)) {
    echo json_encode(['success' => false, 'error' => 'Email must end with @asp.me']);
    exit;
}

// Check unique email
$stmt = $pdo->prepare('SELECT id FROM students WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'error' => 'Email already exists']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('INSERT INTO students (nom, prenom, email, filiere, zk_num, password_hash) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->execute([$nom, $prenom, $email, $filiere, $zk_num, $hash]);
$id = $pdo->lastInsertId();

echo json_encode(['success' => true, 'id' => (int)$id]);

?>