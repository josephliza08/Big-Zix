<?php
declare(strict_types=1);
require dirname(__DIR__) . '/src/bootstrap.php';
$user = current_user();
if (!$user) {
    header('Location: ./LOGIN/LOGIN.php');
    exit;
}
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="<?= e(csrf_token()) ?>" />
    <meta name="bigzix-user" content="<?= e(json_encode($user)) ?>" />
    <title>My profile | Big Zix</title>
    <link rel="stylesheet" href="./styles/menu.css" />
    <link rel="stylesheet" href="./styles/site-polish.css" />
    <link rel="stylesheet" href="./styles/profile.css" />
    <script src="./scripts/api.js" defer></script>
    <script src="./scripts/profile.js" defer></script>
  </head>
  <body>
    <header class="masthead wrap">
      <a class="brand" href="./index.php" aria-label="Big Zix home"><img src="./assets/logo.png" alt="Big Zix" /></a>
      <nav class="nav" aria-label="Main navigation"><a href="./index.php#menu">Menu</a><a href="./contact.php">Contact</a></nav>
    </header>
    <main class="wrap profile-main">
      <p class="profile-kicker">Your Big Zix account</p>
      <h1>Make yourself at home.</h1>
      <p class="profile-intro">A familiar face. Your favorites. Your next pizza night.</p>
      <div class="profile-grid">
        <section class="profile-panel profile-summary" aria-labelledby="profile-heading">
          <img id="profile-picture" class="profile-picture" src="./profile-photo.php?v=<?= (int) $user['avatar_version'] ?>" alt="Your profile picture" width="120" height="120" />
          <h2 id="profile-heading"><?= e($user['name']) ?></h2>
          <p id="profile-handle">@<?= e($user['username']) ?></p>
          <form id="photo-form">
            <label class="profile-button photo-picker" for="profile-photo">Choose picture</label>
            <input class="visually-hidden" id="profile-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" />
            <p id="photo-help" class="profile-help">JPG, PNG or WebP. Your picture is cropped to a square before saving.</p>
            <button class="profile-button" id="save-photo" type="submit" hidden>Save picture</button>
            <button class="profile-secondary" id="cancel-photo" type="button" hidden>Cancel</button>
            <button class="profile-secondary" id="remove-photo" type="button">Remove picture</button>
            <p id="photo-status" class="profile-status" role="status"></p>
          </form>
          <a class="profile-orders" href="./account.php">View my orders →</a>
        </section>
        <div class="profile-settings">
          <section class="profile-panel" aria-labelledby="settings-heading">
            <h2 id="settings-heading">Profile settings</h2>
            <form id="profile-form">
              <label for="display-name">Display name</label>
              <input id="display-name" name="name" minlength="2" maxlength="100" autocomplete="name" value="<?= e($user['name']) ?>" required />
              <label for="profile-username">Username</label>
              <input id="profile-username" name="username" minlength="3" maxlength="24" pattern="[A-Za-z][A-Za-z0-9_]{2,23}" autocomplete="username" value="<?= e($user['username']) ?>" aria-describedby="handle-help" required />
              <p id="handle-help" class="profile-help">3–24 letters, numbers or underscores. Start with a letter. You can log in with this or your email.</p>
              <div id="username-confirmation" hidden>
                <label for="profile-current-password">Current password</label>
                <input id="profile-current-password" name="currentPassword" type="password" maxlength="72" autocomplete="current-password" />
                <p class="profile-help">Confirm your password to change your username.</p>
              </div>
              <label for="profile-email">Account email</label>
              <input id="profile-email" type="email" value="<?= e($user['email']) ?>" readonly />
              <button class="profile-button" type="submit">Save changes</button>
              <p id="profile-status" class="profile-status" role="status"></p>
            </form>
          </section>
          <details class="profile-panel password-settings">
            <summary>Password settings</summary>
            <form id="password-form">
              <label for="old-password">Current password</label>
              <input id="old-password" name="currentPassword" type="password" maxlength="72" autocomplete="current-password" required />
              <label for="new-password">New password</label>
              <input id="new-password" name="newPassword" type="password" minlength="10" maxlength="72" autocomplete="new-password" aria-describedby="new-password-help" required />
              <p id="new-password-help" class="profile-help">Use at least 10 characters.</p>
              <label for="confirm-new-password">Confirm new password</label>
              <input id="confirm-new-password" name="confirmPassword" type="password" minlength="10" maxlength="72" autocomplete="new-password" required />
              <button class="profile-button" type="submit">Update password</button>
              <p id="password-status" class="profile-status" role="status"></p>
            </form>
          </details>
        </div>
      </div>
    </main>
    <footer class="copyright-footer"><p class="site-copyright">&copy; <?= date('Y') ?> Big Zix. All rights reserved.</p></footer>
  </body>
</html>
