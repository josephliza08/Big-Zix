<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require dirname(__DIR__) . '/src/bootstrap.php';
if (!is_dir(dirname(database_path()))) {
    mkdir(dirname(database_path()), 0700, true);
}
$pdo = new PDO('sqlite:' . database_path());
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('PRAGMA journal_mode = WAL');
$pdo->exec(file_get_contents(dirname(__DIR__) . '/database/schema.sql'));
$pdo->exec(file_get_contents(dirname(__DIR__) . '/database/seed.sql'));
echo "Database initialized. Existing accounts and orders were preserved.\n";
