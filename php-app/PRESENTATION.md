# Simple presentation explanation

“Big Zix lets customers browse food, view product details, save favorites and place orders. The menu remains the main focus. The smaller meal planner helps groups choose food within a budget.”

“We use HTML for page structure, CSS for appearance and responsive layouts, and JavaScript for interactions such as slides, filters and dialogs. PHP runs on the server. It checks accounts, validates requests and communicates with our SQLite database using SQL.”

## Explain an order

1. The customer signs in. PHP stores their account ID in a server session; the browser receives a session cookie.
2. JavaScript collects the product IDs and quantities from the cart.
3. The browser sends those items to `public/api.php` using `fetch`.
4. PHP checks the session, request token, quantities and product availability.
5. PHP reads the real prices from SQL and calculates the total. Editing the browser's displayed price cannot change the server price.
6. A transaction saves the order and its item rows together. If saving fails, neither part remains half-saved.
7. PHP returns the receipt. The customer sees it in order history, and staff can update its status.

## Explain the tables

| Table | Purpose |
|---|---|
| users | Account name, email, password hash and role |
| products | Food names, images, prices and availability |
| favorites | Links one user to saved products |
| orders | Customer, reference, delivery/pickup, total and status |
| order_items | The products, quantities and prices saved for an order |
| messages | Contact-form submissions and read status |
| rate_limits | Limits repeated login, signup and submission attempts |

One user can have many orders. One order can have many order items. Favorites connect users and products. Foreign keys keep these relationships consistent. Product prices are also copied into order items so an old receipt does not change when staff updates today's menu price.

## Questions your professor may ask

**Why SQLite?** It is a relational database that supports SQL. It stores data in a file and needs no separate database server, making the project easy to run for class. MySQL is another database system; SQL is the language.

**How do you protect passwords?** PHP's `password_hash` stores a hash, and `password_verify` checks login attempts. We do not store readable passwords.

**How do you avoid SQL injection?** Queries use PDO prepared statements, with user values supplied separately from SQL text.

**Can a guest order by calling the API directly?** No. PHP checks the session again, even if someone bypasses the login popup.

**What is CSRF protection?** Each session has a random token. Requests that change data must include that token, helping prevent another website from submitting actions using the customer's session.

**How are favorites saved?** The favorites table stores the user's ID and product ID. Logging out does not erase them.

**Does the contact form send email?** It saves the message in the database for staff to read in the dashboard.

**Why keep JavaScript when we have PHP?** JavaScript controls the browser interface; PHP handles trusted server operations. They have different jobs.

**Can GitHub Pages run it?** No. It can show the static frontend, but the PHP app runs on a PHP server. For the presentation we use the local PHP server.

## Suggested demonstration

Browse while logged out → try a favorite to show the login requirement → register → save a favorite → place a pickup order → open order history → show staff status updates and the contact inbox. Use test records and explain that payments are made on pickup/delivery.
