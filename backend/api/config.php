<?php
// Simple DB config using PDO. Adjust constants as necessary.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Database settings
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'flowtrack'); // change if needed
define('DB_USER', 'root');
define('DB_PASS', '');

// Create (and return) PDO connection
function get_pdo() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'DB connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}

// Helper: read JSON body
function json_body() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true);
}

?>