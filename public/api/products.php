<?php
include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
        $results = $stmt->fetchAll();
        echo json_encode($results);
    } catch (Exception $e) {
        echo json_encode(["error" => $e->getMessage()]);
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if ($data) {
        try {
            $stmt = $pdo->prepare("INSERT INTO products (sku, name, description, regular_price, stock, visibility, images) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['sku'] ?? '',
                $data['name'] ?? '',
                $data['description'] ?? '',
                $data['regularPrice'] ?? $data['regular_price'] ?? 0,
                $data['stock'] ?? 0,
                $data['visibility'] ?? 'Visible',
                $data['images'] ?? ''
            ]);
            echo json_encode(["id" => $pdo->lastInsertId(), "message" => "Product created successfully"]);
        } catch (Exception $e) {
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
}
?>
