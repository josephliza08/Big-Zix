<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';
require dirname(__DIR__) . '/src/http.php';

try {
    $user = require_user();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $photo = query('SELECT avatar, avatar_type FROM users WHERE id = ?', [$user['id']])->fetch();
        if ($photo['avatar'] !== null) {
            header('Content-Type: ' . $photo['avatar_type']);
            echo $photo['avatar'];
        } else {
            header('Content-Type: image/svg+xml');
            echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="50" fill="#f1dfc6"/><circle cx="50" cy="36" r="17" fill="#912020"/><path d="M19 88v-9a31 31 0 0 1 62 0v9" fill="#912020"/></svg>';
        }
        exit;
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        fail('Method not allowed.', 405);
    }
    if (!hash_equals(csrf_token(), $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) {
        fail('Your page has expired. Refresh and try again.', 403);
    }
    rate_limit('photo:' . $user['id'], 20, 3600);
    $file = $_FILES['photo'] ?? null;
    if (!$file || $file['error'] !== UPLOAD_ERR_OK || $file['size'] > 1048576 || !is_uploaded_file($file['tmp_name'])) {
        fail('Choose a JPG, PNG or WebP image up to 1 MB.');
    }
    $bytes = file_get_contents($file['tmp_name']);
    $image = @getimagesizefromstring($bytes);
    if (!$image || !in_array($image['mime'], ['image/jpeg', 'image/png', 'image/webp'], true)
        || $image[0] > 2048 || $image[1] > 2048 || $image[0] < 1 || $image[1] < 1) {
        fail('Choose a valid JPG, PNG or WebP image, no larger than 2048 × 2048 pixels.');
    }
    $statement = db()->prepare('UPDATE users SET avatar = ?, avatar_type = ?, avatar_version = avatar_version + 1 WHERE id = ?');
    $statement->bindValue(1, $bytes, PDO::PARAM_LOB);
    $statement->bindValue(2, $image['mime']);
    $statement->bindValue(3, $user['id'], PDO::PARAM_INT);
    $statement->execute();
    respond(['user' => current_user(), 'message' => 'Profile picture saved.']);
} catch (Throwable $error) {
    error_log('Profile photo request failed: ' . get_class($error));
    fail('We could not save your picture. Please try again.', 500);
}
