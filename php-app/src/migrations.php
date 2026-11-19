<?php
declare(strict_types=1);

function migrate_profiles(PDO $pdo): void
{
    $pdo->beginTransaction();
    try {
        $columns = array_column($pdo->query('PRAGMA table_info(users)')->fetchAll(PDO::FETCH_ASSOC), 'name');
        $fields = [
            'username' => 'TEXT COLLATE NOCASE',
            'avatar' => 'BLOB',
            'avatar_type' => 'TEXT',
            'avatar_version' => 'INTEGER NOT NULL DEFAULT 0',
            'auth_version' => 'INTEGER NOT NULL DEFAULT 1',
        ];
        foreach ($fields as $name => $definition) {
            if (!in_array($name, $columns, true)) {
                $pdo->exec("ALTER TABLE users ADD COLUMN $name $definition");
            }
        }
        $pdo->exec("UPDATE users SET username = 'user_' || id WHERE username IS NULL");
        $pdo->exec('CREATE UNIQUE INDEX IF NOT EXISTS users_username ON users(username COLLATE NOCASE)');
        $orderColumns = array_column($pdo->query('PRAGMA table_info(orders)')->fetchAll(PDO::FETCH_ASSOC), 'name');
        if (!in_array('payment_method', $orderColumns, true)) {
            $pdo->exec("ALTER TABLE orders ADD COLUMN payment_method TEXT NOT NULL DEFAULT 'cash' CHECK(payment_method = 'cash')");
        }
        if (!in_array('payment_status', $orderColumns, true)) {
            $pdo->exec("ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'paid'))");
        }
        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        throw $error;
    }
}
