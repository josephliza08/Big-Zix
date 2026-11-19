<?php
declare(strict_types=1);

function order_details(array $order): array
{
    $order['items'] = query('SELECT product_id, product_name AS name, quantity, unit_centavos
        FROM order_items WHERE order_id = ? ORDER BY id', [$order['id']])->fetchAll();
    return $order;
}

function create_order(array $user, array $data): array
{
    $key = text_field($data, 'request_key', 16, 100);
    $method = $data['method'] ?? '';
    if (!in_array($method, ['pickup', 'delivery'], true)) {
        fail('Choose pickup or delivery.');
    }
    if (($data['payment_method'] ?? 'cash') !== 'cash') {
        fail('Please choose cash for this order.');
    }
    $address = $method === 'delivery' ? text_field($data, 'address', 8, 500) : '';
    $items = $data['items'] ?? null;
    if (!is_array($items) || !array_is_list($items) || count($items) < 1 || count($items) > 50) {
        fail('Choose between 1 and 50 different menu items.');
    }
    $quantities = [];
    foreach ($items as $item) {
        if (!is_array($item)) {
            fail('Invalid order item.');
        }
        $id = positive_id($item['product_id'] ?? null);
        $quantity = $item['quantity'] ?? null;
        if (!is_int($quantity) || $quantity < 1 || $quantity > 99 || isset($quantities[$id])) {
            fail('Choose a quantity from 1 to 99 for each unique item.');
        }
        $quantities[$id] = $quantity;
    }
    ksort($quantities);
    $hash = hash('sha256', json_encode([$method, $address, $quantities], JSON_THROW_ON_ERROR));
    $pdo = db();
    $pdo->exec('BEGIN IMMEDIATE');
    try {
        $existing = query('SELECT * FROM orders WHERE user_id = ? AND request_key = ?', [$user['id'], $key])->fetch();
        if ($existing) {
            if (!hash_equals($existing['request_hash'], $hash)) {
                $pdo->exec('ROLLBACK');
                fail('This request has already been used for another order.', 409);
            }
            $result = order_details($existing);
            $pdo->exec('COMMIT');
            return $result;
        }
        $total = 0;
        $lines = [];
        foreach ($quantities as $id => $quantity) {
            $product = query('SELECT * FROM products WHERE id = ? AND active = 1', [$id])->fetch();
            if (!$product) {
                $pdo->exec('ROLLBACK');
                fail('A selected item is no longer available. Refresh the menu.', 409);
            }
            // Only database prices are trusted; client totals are ignored.
            $total += (int) $product['price_centavos'] * $quantity;
            $lines[] = [$product, $quantity];
        }
        $reference = 'BZ-' . strtoupper(bin2hex(random_bytes(5)));
        query('INSERT INTO orders (reference, user_id, request_key, request_hash, method, address, total_centavos)
            VALUES (?, ?, ?, ?, ?, ?, ?)', [$reference, $user['id'], $key, $hash, $method, $address, $total]);
        $orderId = (int) $pdo->lastInsertId();
        foreach ($lines as [$product, $quantity]) {
            query('INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_centavos)
                VALUES (?, ?, ?, ?, ?)', [$orderId, $product['id'], $product['name'], $quantity, $product['price_centavos']]);
        }
        $result = order_details(query('SELECT * FROM orders WHERE id = ?', [$orderId])->fetch());
        $pdo->exec('COMMIT');
        return $result;
    } catch (Throwable $error) {
        $pdo->exec('ROLLBACK');
        throw $error;
    }
}
