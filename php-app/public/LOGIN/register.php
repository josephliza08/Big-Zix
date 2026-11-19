<?php
require dirname(__DIR__, 2) . '/src/bootstrap.php';
$user = current_user();
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Create an account | Big Zix</title>

    <link
      href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap"
      rel="stylesheet"
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
      <p class="welcome-heading">Welcome to Big Zix!</p>
      <p>
        Create your account to start<br />ordering delicious pizza and more.
      </p>
    </header>
    <main class="card">
      <h1>Create your account</h1>

      <form method="post">
        <div class="field">
          <label for="account-name">Name</label>
          <input
            type="text"
            name="name" maxlength="100" autocomplete="name"
            id="account-name"
            placeholder="Enter your name"
            required
          />
        </div>

        <div class="field">
          <label for="account-email">Email</label>
          <input
            type="email"
            name="email" maxlength="254" autocomplete="email"
            id="account-email"
            placeholder="Enter your email address"
            required
          />
        </div>

        <p class="account-notice">Use at least 10 characters for your password.</p>
        <div class="field">
          <label for="account-password">Password</label>
          <div class="password-box">
            <input
              type="password"
              name="password" minlength="10" maxlength="72" autocomplete="new-password"
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
        </div>

        <div class="field">
          <label for="account-confirmPassword">Confirm password</label>
          <div class="password-box">
            <input
              type="password"
              name="confirmPassword"
              id="account-confirmPassword"
              placeholder="Confirm your Password"
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
        </div>

        <input type="submit" id="create-account" value="Create account" />
      </form>
      <p class="account-status" role="status"></p>

      <p class="login-prompt">
        Already have an account? <a href="./LOGIN.php">Log in</a>
      </p>
      <p class="center"><a href="../index.php">← Back to menu</a></p>
    </main>
    <script src="../scripts/api.js" defer></script>
    <script src="../scripts/account.js?v=20261119-3" defer></script>
  </body>
</html>
