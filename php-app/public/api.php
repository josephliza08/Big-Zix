<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';
require dirname(__DIR__) . '/src/http.php';
require dirname(__DIR__) . '/src/orders.php';

try {
    $action = $_GET['action'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];
    if (!in_array($method, ['GET', 'POST'], true)) {
        fail('Method not allowed.', 405);
    }
    $data = [];
    if ($method === 'POST') {
        if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
            fail('Request too large.', 413);
        }
        if (!hash_equals(csrf_token(), $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
            fail('Your page has expired. Refresh and try again.', 403);
        }
        $raw = file_get_contents('php://input', false, null, 0, 20001);
        if (strlen($raw) > 20000) {
            fail('Request too large.', 413);
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            fail('Invalid JSON request.', 400);
        }
    }

    switch ($method . ':' . $action) {
        case 'GET:session':
            respond(['user' => current_user(), 'csrf' => csrf_token()]);

        case 'POST:register':
            rate_limit('register', 10, 3600);
            $name = text_field($data, 'name', 2, 100);
            $email = email_field($data);
            $password = $data['password'] ?? '';
            if (!is_string($password) || strlen($password) < 10 || strlen($password) > 72) {
                fail('Use a password between 10 and 72 bytes long.');
            }
            if (($data['confirmPassword'] ?? '') !== $password) {
                fail('The passwords must match.');
            }
            if (query('SELECT id FROM users WHERE email = ?', [$email])->fetch()) {
                fail('An account already uses this email. Please log in.', 409);
            }
            query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int) db()->lastInsertId();
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
            respond(['user' => current_user(), 'csrf' => csrf_token()], 201);

        case 'POST:login':
            rate_limit('login', 20, 900);
            $email = email_field($data);
            $password = $data['password'] ?? '';
            if (!is_string($password) || strlen($password) > 72) {
                fail('Email or password is incorrect.', 401);
            }
            $user = query('SELECT * FROM users WHERE email = ?', [$email])->fetch();
            $hash = $user['password_hash'] ?? '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.';
            if (!password_verify($password, $hash) || !$user) {
                fail('Email or password is incorrect.', 401);
            }
            session_regenerate_id(true);
            $_SESSION['user_id'] = (int) $user['id'];
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
            respond(['user' => current_user(), 'csrf' => csrf_token()]);

        case 'POST:logout':
            $_SESSION = [];
            session_regenerate_id(true);
            respond(['user' => null, 'csrf' => csrf_token()]);

        case 'GET:products':
            respond(['products' => query('SELECT * FROM products WHERE active = 1 ORDER BY id')->fetchAll()]);

        case 'GET:favorites':
            $user = require_user();
            respond(['ids' => array_map('intval', query('SELECT product_id FROM favorites WHERE user_id = ?', [$user['id']])->fetchAll(PDO::FETCH_COLUMN))]);

        case 'POST:favorite':
            $user = require_user();
            $id = positive_id($data['product_id'] ?? null);
            if (!is_bool($data['saved'] ?? null)) {
                fail('Choose whether to save this item.');
            }
            if (!query('SELECT id FROM products WHERE id = ?', [$id])->fetch()) {
                fail('Product not found.', 404);
            }
            if ($data['saved']) {
                query('INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)', [$user['id'], $id]);
            } else {
                query('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [$user['id'], $id]);
            }
            respond(['saved' => $data['saved']]);

        case 'POST:orders':
            $user = require_user();
            rate_limit('orders:' . $user['id'], 40, 3600);
            respond(['order' => create_order($user, $data)], 201);

        case 'GET:orders':
            $user = require_user();
            $orders = query('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 100', [$user['id']])->fetchAll();
            respond(['orders' => array_map('order_details', $orders)]);

        case 'POST:contact':
            rate_limit('contact', 10, 3600);
            $name = text_field($data, 'name', 2, 100);
            $email = email_field($data);
            $topic = text_field($data, 'topic', 1, 60);
            if (!in_array($topic, ['Menu question', 'Group order', 'Feedback', 'Something else'], true)) {
                fail('Choose a valid message topic.');
            }
            $body = text_field($data, 'message', 1, 2000);
            query('INSERT INTO messages (user_id, name, email, topic, body) VALUES (?, ?, ?, ?, ?)', [current_user()['id'] ?? null, $name, $email, $topic, $body]);
            respond(['message' => 'Your message has been sent to the Big Zix team.', 'reference' => (int) db()->lastInsertId()], 201);

        case 'GET:admin':
            require_user(true);
            respond([
                'orders' => array_map('order_details', query('SELECT orders.*, users.name AS customer_name, users.email AS customer_email FROM orders JOIN users ON users.id = orders.user_id ORDER BY orders.id DESC LIMIT 200')->fetchAll()),
                'messages' => query('SELECT * FROM messages ORDER BY id DESC LIMIT 200')->fetchAll(),
                'products' => query('SELECT * FROM products ORDER BY id')->fetchAll(),
            ]);

        case 'POST:order-status':
            require_user(true);
            $id = positive_id($data['id'] ?? null);
            $order = query('SELECT status FROM orders WHERE id = ?', [$id])->fetch();
            if (!$order) {
                fail('Order not found.', 404);
            }
            $transitions = ['pending' => ['preparing', 'cancelled'], 'preparing' => ['ready', 'cancelled'], 'ready' => ['completed', 'cancelled'], 'completed' => [], 'cancelled' => []];
            $status = $data['status'] ?? '';
            if (!in_array($status, $transitions[$order['status']], true)) {
                fail('That status change is not allowed.', 409);
            }
            $updated = query('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = ?', [$status, $id, $order['status']]);
            if (!$updated->rowCount()) {
                fail('This order changed. Refresh and try again.', 409);
            }
            respond(['status' => $status]);

        case 'POST:message-read':
            require_user(true);
            $updated = query("UPDATE messages SET status = 'read' WHERE id = ?", [positive_id($data['id'] ?? null)]);
            if (!$updated->rowCount()) {
                fail('Message not found.', 404);
            }
            respond(['status' => 'read']);

        case 'POST:product-update':
            require_user(true);
            $id = positive_id($data['id'] ?? null);
            $price = $data['price_centavos'] ?? null;
            if (!is_int($price) || $price < 1 || $price > 10000000 || !is_bool($data['active'] ?? null)) {
                fail('Enter a valid price and availability.');
            }
            $updated = query('UPDATE products SET price_centavos = ?, active = ? WHERE id = ?', [$price, (int) $data['active'], $id]);
            if (!$updated->rowCount()) {
                fail('Product not found.', 404);
            }
            respond(['updated' => true]);

        default:
            fail('Endpoint not found.', 404);
    }
} catch (Throwable $error) {
    error_log((string) $error);
    respond(['error' => 'We could not complete your request. Please try again.'], 500);
}
