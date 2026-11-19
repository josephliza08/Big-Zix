<?php
declare(strict_types=1);

function database_path(): string
{
    return getenv('BIGZIX_DB') ?: dirname(__DIR__) . '/storage/big-zix.sqlite';
}

function db(): PDO
{
    static $connection = null;
    if ($connection === null) {
        if (!is_file(database_path())) {
            throw new RuntimeException('Run php bin/init.php before starting the website.');
        }
        $connection = new PDO('sqlite:' . database_path(), null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $connection->exec('PRAGMA foreign_keys = ON');
        $connection->exec('PRAGMA busy_timeout = 5000');
    }
    return $connection;
}

function query(string $sql, array $parameters = []): PDOStatement
{
    $statement = db()->prepare($sql);
    $statement->execute($parameters);
    return $statement;
}

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    $user = query('SELECT id, name, username, email, role, avatar_version, auth_version FROM users WHERE id = ?', [$_SESSION['user_id']])->fetch();
    if ($user && (int) $user['auth_version'] !== (int) ($_SESSION['auth_version'] ?? 1)) {
        unset($_SESSION['user_id']);
        return null;
    }
    if ($user) {
        unset($user['auth_version']);
    }
    return $user ?: null;
}

function csrf_token(): string
{
    return $_SESSION['csrf'] ??= bin2hex(random_bytes(32));
}

if (PHP_SAPI !== 'cli') {
    ini_set('session.use_strict_mode', '1');
    session_name('bigzix_session');
    session_set_cookie_params([
        'httponly' => true,
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'samesite' => 'Lax',
        'path' => '/',
    ]);
    session_start();
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    // Expire idle login sessions after two hours.
    if (isset($_SESSION['last_seen']) && time() - $_SESSION['last_seen'] > 7200) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['last_seen'] = time();
}
