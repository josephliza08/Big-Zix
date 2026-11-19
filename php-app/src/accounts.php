<?php
declare(strict_types=1);

function username_field(array $data): string
{
    $username = strtolower(text_field($data, 'username', 3, 24));
    if (!preg_match('/^[a-z][a-z0-9_]{2,23}$/D', $username)) {
        fail('Use 3–24 letters, numbers or underscores. Start with a letter.');
    }
    return $username;
}

function password_field(array $data, string $key = 'password'): string
{
    $password = $data[$key] ?? '';
    if (!is_string($password) || strlen($password) < 10 || strlen($password) > 72 || str_contains($password, "\0")) {
        fail('Use a password with at least 10 characters and at most 72 bytes.');
    }
    return $password;
}

function verify_current_password(array $user, array $data): void
{
    rate_limit('settings:' . $user['id'], 20, 900);
    $password = $data['currentPassword'] ?? '';
    $hash = query('SELECT password_hash FROM users WHERE id = ?', [$user['id']])->fetchColumn();
    if (!is_string($password) || !password_verify($password, $hash)) {
        fail('Your current password is incorrect.', 403);
    }
}

function save_profile(array $user, array $data): void
{
    $name = text_field($data, 'name', 2, 100);
    $username = username_field($data);
    if ($username !== $user['username']) {
        verify_current_password($user, $data);
    }
    if (query('SELECT id FROM users WHERE username = ? AND id != ?', [$username, $user['id']])->fetch()) {
        fail('That username is already taken.', 409);
    }
    try {
        query('UPDATE users SET name = ?, username = ? WHERE id = ?', [$name, $username, $user['id']]);
    } catch (PDOException $error) {
        if ($error->getCode() === '23000') {
            fail('That username is already taken.', 409);
        }
        throw $error;
    }
}
