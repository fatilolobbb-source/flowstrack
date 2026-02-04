<?php
require_once __DIR__ . '/config.php';
$pdo = get_pdo();
$filiere = isset($_GET['filiere']) ? trim($_GET['filiere']) : '';
if (!$filiere) {
    echo json_encode([]);
    exit;
}
$stmt = $pdo->prepare('SELECT id, nom, prenom, email, filiere, zk_num FROM students WHERE LOWER(filiere) = LOWER(?) ORDER BY nom, prenom');
$stmt->execute([$filiere]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($rows);
?>