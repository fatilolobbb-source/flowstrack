<?php
require_once __DIR__ . '/config.php';
$pdo = get_pdo();
// Accept filiere as either query param or POST JSON
$filiere = '';
if (isset($_GET['filiere'])) $filiere = trim($_GET['filiere']);
else {
    $body = json_decode(file_get_contents('php://input'), true);
    if (isset($body['filiere'])) $filiere = trim($body['filiere']);
}

if (!$filiere) {
    // Return all students if no filiere specified
    $stmt = $pdo->query('SELECT id, num, nom, prenom, email, filiere, zk_num FROM students ORDER BY filiere, nom, prenom');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($rows);
    exit;
}

$stmt = $pdo->prepare('SELECT id, num, nom, prenom, email, filiere, zk_num FROM students WHERE LOWER(filiere) = LOWER(?) ORDER BY nom, prenom');
$stmt->execute([$filiere]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows);
?>