<?php
require dirname(__DIR__) . '/src/bootstrap.php';
$user = current_user();
if (!$user) { header('Location: ./LOGIN/LOGIN.php'); exit; }

?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="<?= e(csrf_token()) ?>" />
    <meta name="bigzix-user" content="<?= e(json_encode($user)) ?>" />
    <title>My orders | Big Zix</title>
    <link rel="stylesheet" href="./styles/menu.css" />
    <link rel="stylesheet" href="./styles/site-polish.css" />
    <link rel="stylesheet" href="./styles/dashboard.css" />
    <script src="./scripts/api.js" defer></script>
    <script src="./scripts/dashboard.js" defer></script>
  </head>
  <body data-staff="false">
    <header class="masthead wrap"><a href="./index.php">Big Zix</a><nav class="nav" aria-label="Main navigation"><a href="./index.php#menu">Menu</a><a href="./contact.php">Contact</a></nav></header>
    <main class="wrap dashboard-main">
      <h1>My orders</h1>
      <p>Welcome, <?= e($user['name']) ?>.</p>
      <button id="refresh-dashboard" type="button" class="dashboard-button">Refresh</button>
      <p id="dashboard-status" role="status"></p>
      <div id="dashboard-content"></div>
    </main>
    <footer class="copyright-footer"><p class="site-copyright">&copy; <?= date('Y') ?> Big Zix. All rights reserved.</p></footer>
  </body>
</html>
