<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/src/bootstrap.php';
$email = strtolower(trim($argv[1] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fwrite(STDERR, "Usage: php bin/admin.php existing-account@example.com\n");
    exit(1);
}
$updated = query("UPDATE users SET role = 'admin' WHERE email = ?", [$email]);
if (!$updated->rowCount()) {
    fwrite(STDERR, "Register that account through the website first.\n");
    exit(1);
}
echo "Staff access granted to the existing account.\n";
