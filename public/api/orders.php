<?php
include 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY date DESC");
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
            $stmt = $pdo->prepare("INSERT INTO orders (id, customer_name, customer_email, customer_phone, address, total_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['order_id'] ?? '',
                $data['customer_name'] ?? '',
                $data['customer_email'] ?? '',
                $data['customer_phone'] ?? '',
                $data['address'] ?? '',
                $data['total_amount'] ?? 0,
                $data['payment_method'] ?? ''
            ]);
            
            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $item) {
                    $stmt_item = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)");
                    $stmt_item->execute([
                        $data['order_id'] ?? '',
                        $item['id'] ?? 0,
                        $item['name'] ?? '',
                        $item['qty'] ?? 1,
                        $item['price'] ?? 0
                    ]);
                }
            }
            echo json_encode(["message" => "Order received successfully"]);
        } catch (Exception $e) {
            echo json_encode(["error" => $e->getMessage()]);
        }
    }
}
?>
