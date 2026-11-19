# Big Zix — PHP and SQL application

This is the working backend version of the existing Big Zix website. HTML, CSS and JavaScript keep the current interface; PHP handles requests and SQLite stores records using SQL. No framework or Composer dependencies are required.

## Run locally

Requirements: PHP 8.2 or newer with PDO and `pdo_sqlite` enabled. PHP 8.5 was used for testing.

Open a terminal in this folder:

```sh
php bin/init.php
php -S 127.0.0.1:8080 -t public
```

Open http://127.0.0.1:8080. Register your own account. The initializer creates the database and 23 menu products; running it again preserves existing records. On Joseph's computer, the `Start-Big-Zix-PHP.cmd` launcher in the parent Big Zix folder uses the prepared portable PHP runtime.

Do not open PHP files directly or use VS Code Live Server for this version. PHP must process the pages. GitHub Pages only serves the older static preview; it cannot run this backend.

## Staff access

Create an account normally, then run this on the server using that account's email:

```sh
php bin/admin.php your-email@example.com
```

Refresh the website and open **Staff dashboard**. Staff can change order status, read submitted messages, and edit product prices/availability. There is no shared default admin password. Registration always creates a customer account.

## Features connected to the database

- Signup, login and logout using server sessions and hashed passwords.
- Public menu and product details; login required for favorites and ordering.
- Favorites saved per account and restored after login.
- Cart, pickup/delivery checkout, database-priced receipts and order history.
- Duplicate-submit protection through a unique request key.
- Contact messages saved to the staff inbox (this does not send email).
- Staff-only order processing, message read status and menu editing.
- Existing carousel, search, filters, planner and responsive styling retained.

The cart and delivery-location convenience setting use browser storage. Accounts, favorites, submitted orders and contact messages use SQL. Payment is on pickup/delivery; online payment processing is not integrated.

## Folder structure

```text
public/          Web root: PHP pages, API entry point, CSS, JS and images
src/             Database/session helpers, validation and order logic
src/views/       Existing About page and its embedded 3D asset
database/        SQL table definitions and initial menu data
bin/             CLI database setup and staff-account promotion
storage/         Private runtime SQLite database (excluded from Git)
tests/           Repeatable HTTP integration tests
```

Serve only `public/`. Never expose `storage/`, `src/`, `bin/` or database files as downloadable web content. The root Apache rule denies direct access, while `public/.htaccess` allows the public folder. For hosting, set the document root to `public`, enable HTTPS and give the PHP process write permission to `storage`. Use a PHP-capable host with persistent disk storage. PHP's built-in server is for local development/presentation.

`BIGZIX_DB` can override the database file path. Back up SQLite using its backup API or stop writes before copying the database; the app uses WAL mode, so copying a live `.sqlite` file alone may miss recent records. Keep backups private.

## Testing

With Node.js available:

```sh
node tests/integration.cjs
# Or specify a PHP executable:
node tests/integration.cjs /path/to/php
```

The test starts PHP on port 8081 with a separate database in the OS temporary directory. It does not modify the website's database. It checks authentication, CSRF protection, account isolation, server prices, validation, duplicate orders, staff permissions, contact messages and page rendering.

This classroom application has no email verification, password-recovery service, payment gateway or delivery-provider integration. The staff inbox is the actual contact destination. The PHP version needs PHP hosting before customers can use it online.
