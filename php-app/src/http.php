<?php
declare(strict_types=1);

function respond(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_THROW_ON_ERROR);
    exit;
}

function fail(string $message, int $status = 422): never
{
    respond(['error' => $message], $status);
}

function require_user(bool $admin = false): array
{
    $user = current_user();
    if (!$user) {
        fail('Please log in to continue.', 401);
    }
    if ($admin && $user['role'] !== 'admin') {
        fail('Staff access is required.', 403);
    }
    return $user;
}

function text_field(array $data, string $key, int $minimum, int $maximum): string
{
    $value = $data[$key] ?? null;
    if (!is_string($value) || strlen(trim($value)) < $minimum || strlen(trim($value)) > $maximum) {
        fail('Please check the ' . $key . ' field.');
    }
    return trim($value);
}

function email_field(array $data): string
{
    $email = strtolower(text_field($data, 'email', 3, 254));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        fail('Enter a valid email address.');
    }
    return $email;
}

function positive_id(mixed $value): int
{
    if (!is_int($value) || $value < 1) {
        fail('Invalid record ID.');
    }
    return $value;
}

function rate_limit(string $scope, int $maximum, int $seconds): void
{
    $key = hash('sha256', $scope . ':' . ($_SERVER['REMOTE_ADDR'] ?? 'local'));
    $now = time();
    query('DELETE FROM rate_limits WHERE expires_at <= ?', [$now]);
    query('INSERT INTO rate_limits (bucket, hits, expires_at) VALUES (?, 1, ?)
        ON CONFLICT(bucket) DO UPDATE SET hits = hits + 1', [$key, $now + $seconds]);
    $hits = query('SELECT hits FROM rate_limits WHERE bucket = ?', [$key])->fetchColumn();
    if ((int) $hits > $maximum) {
        header('Retry-After: ' . $seconds);
        fail('Too many attempts. Please try again later.', 429);
    }
}
