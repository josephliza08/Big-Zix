<?php
require dirname(__DIR__) . '/src/bootstrap.php';
$user = current_user();
$catalog = query('SELECT * FROM products WHERE active = 1 ORDER BY id')->fetchAll();
?>
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta
      name="description"
      content="Explore Big Zix pizza, bundles, sides, and desserts."
    />
    <title>Big Zix | Pizza &amp; Menu</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&amp;family=DM+Sans:wght@400;500;600;700&amp;display=swap"
    />
    <link rel="stylesheet" href="./styles/menu.css?v=20261119-1" />
    <link rel="stylesheet" href="./styles/menu-polish.css?v=20261119-2" />
    <link rel="stylesheet" href="./styles/auth-popup.css?v=20261113-4" />
    <link rel="stylesheet" href="./styles/product-details.css?v=2" />
    <link rel="stylesheet" href="./styles/site-polish.css?v=20261119-1" />
      <meta name="csrf-token" content="<?= e(csrf_token()) ?>" />
    <meta name="bigzix-user" content="<?= e(json_encode($user)) ?>" />
  </head>
  <body id="home">
    <header class="masthead wrap">
      <a class="brand" href="#home"
        ><img src="./assets/logo.png" alt="Big Zix home"
      /></a>
      <nav class="nav" aria-label="Main navigation">
        <a href="#menu">Menu</a>
        <a href="./about-us.php">About us</a>
        <button class="cart-button" id="cart-button" type="button">
          Log in
        </button>
        <a href="./LOGIN/register.php">Sign up</a>
        <a href="./contact.php">Contact</a>
      </nav>
    </header>
    <main class="wrap">
      <section class="hero" aria-labelledby="headline">
        <div class="hero-slide-window" aria-hidden="true">
          <div class="hero-slide-track">
            <img
              src="./assets/poster.jpg"
              alt=""
              decoding="async"
              fetchpriority="high"
            /><img
              src="./assets/menu/pexels-7813574.jpg"
              alt=""
              decoding="async"
            /><img
              src="./assets/menu/pexels-6223229.jpg"
              alt=""
              decoding="async"
            /><img
              src="./assets/menu/pexels-29908653.jpg"
              alt=""
              decoding="async"
            />
          </div>
        </div>
        <div class="hero-copy">
          <p class="kicker">Big Zix Pizza</p>
          <h1 id="headline">Good night for pizza.</h1>
          <p>
            Pizza for sharing, bundles for the table, and something sweet after.
          </p>
          <a class="cta" href="#menu">Explore the menu ↓</a>
        </div>
        <div
          class="hero-controls"
          role="group"
          aria-label="Featured products"
          hidden
        >
          <button type="button" data-slide="-1" aria-label="Previous product">
            ←
          </button>
          <button
            type="button"
            id="hero-pause"
            aria-label="Pause photo rotation"
          >
            <span aria-hidden="true">Ⅱ</span>
          </button>
          <button type="button" data-slide="1" aria-label="Next product">
            →
          </button>
          <span class="slide-number" aria-hidden="true">01 / 04</span>
        </div>
      </section>
      <section class="menu" id="menu" aria-labelledby="menu-title">
        <div class="menu-heading">
          <div>
            <p class="kicker">What are you craving?</p>
            <h2 id="menu-title">The Big Zix menu</h2>
          </div>
          <div class="search" role="search" aria-label="Search the menu">
            <label for="product-search">Search the menu</label>
            <input
              id="product-search"
              type="search"
              placeholder="Try pepperoni"
            />
          </div>
        </div>
        <div class="filters" role="group" aria-label="Filter menu by category">
          <button type="button" data-category="all" aria-pressed="true">
            All items
          </button>
          <button
            type="button"
            data-category="todays-offer"
            aria-pressed="false"
          >
            Today's Offer
          </button>
          <button
            type="button"
            data-category="best-seller"
            aria-pressed="false"
          >
            Best Seller
          </button>
          <button
            type="button"
            data-category="pizza-sharing"
            aria-pressed="false"
          >
            Pizza for Sharing
          </button>
          <button
            type="button"
            data-category="bundle-meals"
            aria-pressed="false"
          >
            Bundle Meals
          </button>
          <button
            type="button"
            data-category="sides-desserts"
            aria-pressed="false"
          >
            Sides &amp; Desserts
          </button>
          <button
            type="button"
            data-category="drinks-extras"
            aria-pressed="false"
          >
            Drinks &amp; extras
          </button>
        </div>
        <div class="menu-tools">
          <p id="menu-count" role="status"></p>
          <button id="favorites-filter" type="button" aria-pressed="false">
            My favorites
          </button>
          <button id="reset-menu" type="button">Reset filters</button>
        </div>
        <p class="menu-hint">
          Browse by category or search for something you love.
        </p>
        <p id="empty-menu" role="status" hidden>
          No matches. Try a different search or category.
        </p>

        <section
          class="category"
          data-section="todays-offer"
          aria-labelledby="todays-offer"
        >
          <h3 id="todays-offer">Today's Offer</h3>
          <ul class="items">
            <?php foreach ($catalog as $product): ?>
              <?php if ($product['category'] !== 'todays-offer') continue; ?>
              <li data-product-id="<?= (int) $product['id'] ?>">
                <img class="item-photo" src="<?= e($product['image']) ?>" alt="" loading="lazy" decoding="async" />
                <div class="item-details">
                  <h4><?= e($product['name']) ?></h4>
                  <p>₱<?= number_format($product['price_centavos'] / 100, 2) ?></p>
                </div>
              </li>
            <?php endforeach; ?>
          </ul>
        </section>

        <section
          class="category"
          data-section="best-seller"
          aria-labelledby="best-seller"
        >
          <h3 id="best-seller">Best Seller</h3>
          <ul class="items">
            <?php foreach ($catalog as $product): ?>
              <?php if ($product['category'] !== 'best-seller') continue; ?>
              <li data-product-id="<?= (int) $product['id'] ?>">
                <img class="item-photo" src="<?= e($product['image']) ?>" alt="" loading="lazy" decoding="async" />
                <div class="item-details">
                  <h4><?= e($product['name']) ?></h4>
                  <p>₱<?= number_format($product['price_centavos'] / 100, 2) ?></p>
                </div>
              </li>
            <?php endforeach; ?>
          </ul>
        </section>

        <section
          class="category"
          data-section="pizza-sharing"
          aria-labelledby="pizza-sharing"
        >
          <h3 id="pizza-sharing">Pizza for Sharing</h3>
          <ul class="items">
            <?php foreach ($catalog as $product): ?>
              <?php if ($product['category'] !== 'pizza-sharing') continue; ?>
              <li data-product-id="<?= (int) $product['id'] ?>">
                <img class="item-photo" src="<?= e($product['image']) ?>" alt="" loading="lazy" decoding="async" />
                <div class="item-details">
                  <h4><?= e($product['name']) ?></h4>
                  <p>₱<?= number_format($product['price_centavos'] / 100, 2) ?></p>
                </div>
              </li>
            <?php endforeach; ?>
          </ul>
        </section>

        <section
          class="category"
          data-section="bundle-meals"
          aria-labelledby="bundle-meals"
        >
          <h3 id="bundle-meals">Bundle Meals</h3>
          <ul class="items">
            <?php foreach ($catalog as $product): ?>
              <?php if ($product['category'] !== 'bundle-meals') continue; ?>
              <li data-product-id="<?= (int) $product['id'] ?>">
                <img class="item-photo" src="<?= e($product['image']) ?>" alt="" loading="lazy" decoding="async" />
                <div class="item-details">
                  <h4><?= e($product['name']) ?></h4>
                  <p>₱<?= number_format($product['price_centavos'] / 100, 2) ?></p>
                </div>
              </li>
            <?php endforeach; ?>
          </ul>
        </section>

        <section
          class="category"
          data-section="sides-desserts"
          aria-labelledby="sides-desserts"
        >
          <h3 id="sides-desserts">Sides &amp; Desserts</h3>
          <ul class="items">
            <?php foreach ($catalog as $product): ?>
              <?php if ($product['category'] !== 'sides-desserts') continue; ?>
              <li data-product-id="<?= (int) $product['id'] ?>">
                <img class="item-photo" src="<?= e($product['image']) ?>" alt="" loading="lazy" decoding="async" />
                <div class="item-details">
                  <h4><?= e($product['name']) ?></h4>
                  <p>₱<?= number_format($product['price_centavos'] / 100, 2) ?></p>
                </div>
              </li>
            <?php endforeach; ?>
          </ul>
        </section>
        <section
          class="category"
          data-section="drinks-extras"
          aria-labelledby="drinks-extras"
        >
          <h3 id="drinks-extras">Drinks &amp; extras</h3>
          <ul class="items">
            <?php foreach ($catalog as $product): ?>
              <?php if ($product['category'] !== 'drinks-extras') continue; ?>
              <li data-product-id="<?= (int) $product['id'] ?>">
                <img class="item-photo" src="<?= e($product['image']) ?>" alt="" loading="lazy" decoding="async" />
                <div class="item-details">
                  <h4><?= e($product['name']) ?></h4>
                  <p>₱<?= number_format($product['price_centavos'] / 100, 2) ?></p>
                </div>
              </li>
            <?php endforeach; ?>
          </ul>
        </section>
      </section>
      <details
        class="planner-panel"
        id="pizza-planner"
        aria-labelledby="planner-title"
      >
        <summary>
          <h2 id="planner-title">Planning for a group?</h2>
          <span>Open the Pizza Night Planner</span>
        </summary>
        <div class="planner-content">
          <div>
            <p>Set your budget. Find a meal for the table.</p>
            <form id="planner-form">
              <label
                >People
                <input
                  name="people"
                  type="number"
                  min="1"
                  max="30"
                  value="4"
                  required
              /></label>
              <label
                >Food budget (₱)
                <input
                  name="budget"
                  type="number"
                  min="1"
                  step="0.01"
                  value="1200"
                  required
              /></label>
              <label
                >What's the plan?
                <select name="mood">
                  <option value="balanced">Pizza, sides and drinks</option>
                  <option value="pizza">Pizza and sides</option>
                  <option value="bundles">Start with a bundle</option>
                </select>
              </label>
              <button type="submit">Build my plan</button>
            </form>
          </div>
          <div>
            <h3>Your meal plan</h3>
            <p id="planner-status" role="status"></p>
            <ul id="planner-items"></ul>
            <button
              type="button"
              id="planner-order"
              aria-haspopup="dialog"
              hidden
            >
              Order this meal
            </button>
          </div>
        </div>
      </details>
      <form class="delivery" id="delivery-form" aria-label="Delivery location">
        <label for="delivery-address">Where should we deliver?</label>
        <input
          id="delivery-address"
          type="text"
          autocomplete="street-address"
          placeholder="Barangay, street, or city"
          maxlength="200"
        />
        <button type="submit">Save address</button>
        <button type="button" id="locate">Use my location</button>
        <p class="delivery-status" id="delivery-status" role="status"></p>
      </form>
      <section class="menu-help" aria-labelledby="menu-help-title">
        <div class="menu-help-intro">
          <p class="kicker">Your next pizza night</p>
          <h2 id="menu-help-title">Good food. Easy choices.</h2>
          <p>
            Explore a best seller, find a bundle for the table, or add something
            sweet. Take your time finding your favorites.
          </p>
          <a class="help-menu-link" href="#menu">Back to the menu ↑</a>
        </div>
        <div class="menu-faq">
          <details>
            <summary>Where should I start?</summary>
            <p>
              Try Best Seller for pizza favorites, Bundle Meals for a shared
              spread, or Sides &amp; Desserts for a little extra. Use the search
              box to find a dish by name.
            </p>
          </details>
          <details>
            <summary>Do I need an account to order?</summary>
            <p>
              Yes. You must log in or create an account before placing an order.
              You can browse the menu and prices without an account.
            </p>
          </details>
        </div>
      </section>
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
          <a href="#menu">Menu</a>
          <a href="./about-us.php">About us</a>
          <a href="./contact.php">Contact</a>
        </nav>
        <a class="footer-top-link" href="#home">Back to top ↑</a>
      </div>
      <p class="site-copyright">&copy; <?= date('Y') ?> Big Zix. All rights reserved.</p>
    </footer>

    <dialog
      class="order-dialog"
      id="order-dialog"
      aria-labelledby="order-title"
    >
      <form method="dialog">
        <button class="dialog-close" aria-label="Close">×</button>
      </form>
      <p class="kicker" id="order-kicker">Big Zix</p>
      <h2 id="order-title"></h2>
      <p id="order-message"></p>
      <ul class="cart-list" id="cart-list" hidden></ul>
      <form id="checkout-form" hidden>
        <label for="order-method">How will you get your order?</label>
        <select id="order-method" name="method">
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
        </select>
        <div id="order-address-field" hidden>
          <label for="order-address">Delivery address</label>
          <input
            id="order-address"
            name="address"
            autocomplete="street-address"
            maxlength="200"
          />
        </div>
        <label for="order-payment">Payment method</label>
        <select id="order-payment" name="payment_method">
          <option value="cash">Cash on pickup</option>
        </select>
        <p class="checkout-note">No payment is taken now. Pay in cash when you receive your order.</p>
        <details class="optional-extras">
          <summary>Add drinks, sides or dips (optional)</summary>
          <fieldset class="checkout-extras">
            <legend>Want to add anything?</legend>
            <p>
              Pick a drink, side, dip, or dessert. You can also skip straight to
              confirming your order.
            </p>
            <ul id="checkout-extras-list"></ul>
          </fieldset>
        </details>
        <p class="checkout-note">
          Review your items and address before confirming. Pay when you pick up or receive your order.
        </p>
      </form>
      <div class="dialog-actions" id="order-actions"></div>
      <p id="order-status" role="status" hidden></p>
    </dialog>
    <aside
      id="cart-summary"
      class="cart-summary"
      aria-label="Order summary"
      hidden
    >
      <div>
        <strong>Your next pizza night</strong>
        <p id="cart-total"></p>
      </div>
      <button type="button" id="view-cart" aria-haspopup="dialog">
        View cart →
      </button>
    </aside>
    <p id="menu-feedback" class="menu-feedback" role="status"></p>
    <dialog
      id="account-dialog"
      class="account-dialog"
      aria-labelledby="account-title"
      aria-describedby="account-message"
    >
      <button
        type="button"
        id="close-account"
        aria-label="Close login reminder"
      >
        ×
      </button>
      <p class="account-kicker">Before you order</p>
      <h2 id="account-title">Please log in first.</h2>
      <p id="account-message">
        You need to log in before ordering. New to Big Zix? Create an account to
        get started.
      </p>
      <div class="account-actions">
        <a class="account-login" href="./LOGIN/LOGIN.php">Log in</a>
        <a class="account-signup" href="./LOGIN/register.php">Sign up</a>
      </div>
      <button type="button" id="continue-browsing">Keep browsing</button>
    </dialog>
    <script src="./scripts/api.js" defer></script>
    <script src="./scripts/auth-popup.js?v=20261118-2" defer></script>
    <script src="./scripts/menu.js?v=20261119-swipe2" defer></script>
    <script src="./scripts/planner.js?v=20261119-2" defer></script>
    <dialog id="product-dialog" aria-labelledby="product-title">
      <form method="dialog">
        <button aria-label="Close product details">Close</button>
      </form>
      <img id="product-photo" alt="" />
      <p id="product-category"></p>
      <h2 id="product-title"></h2>
      <p id="product-price"></p>
      <div class="product-dialog-actions">
        <button id="product-favorite" type="button" aria-haspopup="dialog">
          Save favorite
        </button>
        <button id="product-order" type="button" aria-haspopup="dialog">
          Order
        </button>
      </div>
    </dialog>
    <script src="./scripts/product-details.js?v=2" defer></script>
    <script src="./scripts/hero-swipe.js?v=20261119-swipe2" defer></script>
  </body>
</html>
