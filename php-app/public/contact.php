<?php
require dirname(__DIR__) . '/src/bootstrap.php';
$user = current_user();
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="Contact Big Zix about our menu, group orders, or feedback."
    />
    <title>Contact | Big Zix</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&amp;family=DM+Sans:wght@400;500;600;700&amp;display=swap"
    />
    <link rel="stylesheet" href="./styles/menu.css" />
    <link rel="stylesheet" href="./styles/contact.css?v=20261119-3" />
    <script src="./scripts/api.js" defer></script>
    <script src="./scripts/contact.js?v=20261119-3" defer></script>
    <link rel="stylesheet" href="./styles/site-polish.css?v=20261119-1" />
      <meta name="csrf-token" content="<?= e(csrf_token()) ?>" />
    <meta name="bigzix-user" content="<?= e(json_encode($user)) ?>" />
  </head>
  <body id="home">
    <header class="masthead wrap">
      <a class="brand" href="./index.php"
        ><img src="./assets/logo.png" alt="Big Zix home"
      /></a>
      <nav class="nav" aria-label="Main navigation">
        <a href="./index.php#menu">Menu</a>
        <a href="./about-us.php">About us</a>
        <a href="./contact.php" aria-current="page">Contact</a>
      </nav>
    </header>
    <main class="contact-main wrap">
      <section class="contact-hero" aria-labelledby="contact-title">
        <img
          class="contact-photo"
          src="./assets/poster.jpg"
          alt=""
          fetchpriority="high"
        />
        <div class="contact-intro">
          <p class="kicker">Contact Big Zix</p>
          <h1 id="contact-title">What’s<br />cooking?</h1>
          <p>
            Tell us about the pizza you want, the party you’re planning, or the
            slice you’re still thinking about.
          </p>
          <a href="#contact-note"
            >Write a note <span aria-hidden="true">↓</span></a
          >
        </div>
        <div class="pizza-stamp" aria-hidden="true">
          <span>BIG ZIX</span><strong>HOT<br />LINE</strong><span>★ ★ ★</span>
        </div>
      </section>
      <div class="contact-grid">
        <section class="contact-help" aria-labelledby="help-title">
          <p class="kicker section-label">01 / Quick help</p>
          <h2 id="help-title">How can we help?</h2>
          <p class="contact-description">
            Find a dish, plan a meal for your group, or access your account.
          </p>
          <ul class="contact-links">
            <li>
              <span class="contact-monogram" aria-hidden="true">01</span>
              <div class="contact-detail">
                <h3>Explore the menu</h3>
                <p>Browse dishes and prices.</p>
              </div>
              <a href="./index.php#menu"
                >View menu <span aria-hidden="true">↗</span></a
              >
            </li>
            <li>
              <span class="contact-monogram" aria-hidden="true">02</span>
              <div class="contact-detail">
                <h3>Planning for a group?</h3>
                <p>Choose a meal that fits your budget.</p>
              </div>
              <a href="./index.php#pizza-planner"
                >Plan a meal <span aria-hidden="true">↗</span></a
              >
            </li>
            <li>
              <span class="contact-monogram" aria-hidden="true">03</span>
              <div class="contact-detail">
                <h3>Your account</h3>
                <p>Log in before ordering or saving favorites.</p>
              </div>
              <a href="./LOGIN/LOGIN.php"
                >Log in <span aria-hidden="true">↗</span></a
              >
            </li>
          </ul>
        </section>
        <section
          class="contact-note"
          id="contact-note"
          aria-labelledby="contact-form-title"
        >
          <header>
            <p class="kicker section-label">02 / Contact</p>
            <h2 id="contact-form-title">Leave us a note.</h2>
            <p>Have a menu question or feedback? Write your message below.</p>
          </header>
          <form id="contact-form" method="post">
            <label for="contact-name">Your name</label>
            <input id="contact-name" name="name" maxlength="100" autocomplete="name" value="<?= e($user['name'] ?? '') ?>" required />
            <label for="contact-email">Your email</label>
            <input id="contact-email" name="email" type="email" maxlength="254" autocomplete="email" value="<?= e($user['email'] ?? '') ?>" required />
            <label for="contact-topic">What’s it about?</label>
            <select id="contact-topic" name="topic">
              <option>Menu question</option>
              <option>Group order</option>
              <option>Feedback</option>
              <option>Something else</option>
            </select>
            <label for="contact-message">Your message</label>
            <textarea
              id="contact-message"
              name="message"
              rows="5"
              maxlength="2000"
              required
            ></textarea>
            <button class="cart-button" type="submit">Send message</button>
            <p id="contact-status" role="status"></p>
          </form>
        </section>
      </div>
    </main>
    <footer class="site-footer" aria-label="Big Zix footer">
      <div class="footer-inner wrap">
        <div class="footer-brand">
          <a class="footer-logo" href="./index.php" aria-label="Big Zix home"
            ><img src="./assets/logo.png" alt="Big Zix"
          /></a>
          <p>Great pizza. Good company.</p>
        </div>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="./index.php#menu">Menu</a>
          <a href="./about-us.php">About us</a>
          <a href="./contact.php" aria-current="page">Contact</a>
        </nav>
        <a class="footer-top-link" href="#home">Back to top ↑</a>
      </div>
      <p class="site-copyright">&copy; <?= date('Y') ?> Big Zix. All rights reserved.</p>
    </footer>
  </body>
</html>
