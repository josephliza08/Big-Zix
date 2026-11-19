<?php
require dirname(__DIR__, 2) . '/src/bootstrap.php';
$user = current_user();
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Log in to Big Zix</title>

    <!-- Fredoka font -->
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
    />

    <link rel="stylesheet" href="../styles/account.css?v=20261119-1" />
    <link rel="stylesheet" href="../styles/site-polish.css?v=20261119-1" />
      <meta name="csrf-token" content="<?= e(csrf_token()) ?>" />
    <meta name="bigzix-user" content="<?= e(json_encode($user)) ?>" />
  </head>

  <body>
    <img class="background" src="../assets/BACKGROUND.png" alt="" />

    <header class="welcome">
      <img class="logo" src="../assets/account-logo.jpg" alt="Big Zix logo" />
      <p class="welcome-heading">WELCOME TO<br />BIG ZIX</p>
      <p>
        Great pizza, good vibes, and happy<br />customers — every slice, every
        time.
      </p>
    </header>
    <main class="card">
      <h1>Log in to<br />Big Zix</h1>

      <form method="post">
        <div class="field">
          <label for="account-email">Email or username</label
          ><input
            type="text"
            name="identifier" maxlength="254" autocomplete="username"
            id="account-email"
            placeholder="Enter your email or username"
            required
          />
        </div>

        <label for="account-password">Password</label>
        <div class="password-box">
          <input
            type="password"
            name="password" minlength="10" maxlength="72" autocomplete="current-password"
            id="account-password"
            placeholder="Enter your Password"
            required
          />
          <button
            class="password-toggle"
            type="button"
            aria-label="Show password"
            aria-pressed="false"
          >
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
              <circle cx="12" cy="12" r="2.7" />
              <path class="eye-slash" d="M4 20 20 4" />
            </svg>
          </button>
        </div>

        <input type="submit" id="login-btn" value="Log in" />
      </form>
      <p class="account-status" role="status"></p>

      

      <hr />

      <p class="center">
        New here? <a href="register.php">Create an account</a>
      </p>
      <p class="center"><a href="../index.php">← Back to menu</a></p>
    </main>
    <script src="../scripts/api.js" defer></script>
    <script src="../scripts/account.js?v=20261119-3" defer></script>
    <footer class="copyright-footer"><p class="site-copyright">&copy; <?= date('Y') ?> Big Zix. All rights reserved.</p></footer>
  </body>
</html>
