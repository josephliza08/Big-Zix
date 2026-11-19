<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';
$user = current_user();

// Keep the existing 3D About page in a separate view to preserve its design.
$page = file_get_contents(dirname(__DIR__) . '/src/views/about.html');
$page = str_replace(
    ['index.html', 'about-us.html', 'contact.html', 'LOGIN.html', 'register.html'],
    ['index.php', 'about-us.php', 'contact.php', 'LOGIN.php', 'register.php'],
    $page
);
$metadata = '<meta name="csrf-token" content="' . e(csrf_token()) . '" />'
    . '<meta name="bigzix-user" content="' . e(json_encode($user)) . '" />'
    . '<script src="./scripts/api.js" defer></script>';
echo str_replace('</head>', $metadata . '</head>', $page);
