/* Run: node tests/integration.cjs /path/to/php. Uses a disposable database. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn, execFileSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const php = process.argv[2] || "php";
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "bigzix-test-"));
const env = { ...process.env, BIGZIX_DB: path.join(temp, "test.sqlite") };
execFileSync(php, ["bin/init.php"], { cwd: root, env });
const server = spawn(php, ["-S", "127.0.0.1:8081", "-t", "public"], {
  cwd: root,
  env,
  stdio: "ignore",
});
let checks = 0;
function check(value, message) {
  assert.ok(value, message);
  checks++;
}
function client() {
  let cookie = "",
    csrf = "";
  return async (action, data, expected = 200, token = true) => {
    const response = await fetch(
      "http://127.0.0.1:8081/api.php?action=" + action,
      {
        method: data === undefined ? "GET" : "POST",
        headers: {
          Cookie: cookie,
          "Content-Type": "application/json",
          "X-CSRF-Token": token ? csrf : "invalid",
        },
        ...(data === undefined ? {} : { body: JSON.stringify(data) }),
      },
    );
    const set = response.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    const body = await response.json();
    assert.equal(
      response.status,
      expected,
      action + ": " + JSON.stringify(body),
    );
    checks++;
    if (body.csrf) csrf = body.csrf;
    return body;
  };
}
(async () => {
  try {
    for (let i = 0; i < 30; i++) {
      try {
        await fetch("http://127.0.0.1:8081/api.php?action=session");
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    const a = client(),
      b = client();
    await a("session");
    await a("favorites", undefined, 401);
    await a("orders", {}, 401);
    await a("register", {}, 403, false);
    const credentials = {
      name: "Test Customer",
      email: "customer@example.test",
      password: "Local-test-1234!",
      confirmPassword: "Local-test-1234!",
      role: "admin",
    };
    const registration = await a("register", credentials, 201);
    check(registration.user.role === "customer", "No role escalation");
    await a("register", credentials, 409);
    await a("admin", undefined, 403);
    const { products } = await a("products");
    check(products.length === 23, "Seed has 23 products");
    const product = products[0];
    await a("favorite", { product_id: product.id, saved: true });
    check(
      (await a("favorites")).ids.includes(product.id),
      "Favorite persisted",
    );
    const payload = {
      request_key: "test-order-request-0001",
      method: "pickup",
      items: [{ product_id: product.id, quantity: 2, price: 1 }],
      total: 1,
    };
    const { order } = await a("orders", payload, 201);
    check(
      order.total_centavos === product.price_centavos * 2,
      "Server determines price",
    );
    check(
      (await a("orders", payload, 201)).order.id === order.id,
      "Retry does not duplicate order",
    );
    await a(
      "orders",
      { ...payload, method: "delivery", address: "Test address 123" },
      409,
    );
    await a(
      "orders",
      {
        ...payload,
        request_key: "test-bad-quantity-1",
        items: [{ product_id: product.id, quantity: 0 }],
      },
      422,
    );
    await a(
      "orders",
      { ...payload, method: "delivery", address: "short" },
      422,
    );
    await a(
      "orders",
      {
        ...payload,
        request_key: "test-unknown-item1",
        items: [{ product_id: 99999, quantity: 1 }],
      },
      409,
    );
    check(
      (await a("orders")).orders.length === 1,
      "Invalid requests leave no partial orders",
    );
    await b("session");
    await b("register", { ...credentials, email: "second@example.test" }, 201);
    check((await b("orders")).orders.length === 0, "Orders are private");
    check((await b("favorites")).ids.length === 0, "Favorites are private");
    await a("logout", {});
    await a("favorites", undefined, 401);
    await a("login", { email: credentials.email, password: "incorrect" }, 401);
    await a("login", credentials);
    check(
      (await a("favorites")).ids.includes(product.id),
      "Favorites survive logout/login",
    );
    await a("favorite", { product_id: product.id, saved: false });
    check(
      (await a("favorites")).ids.length === 0,
      "Favorite removal persisted",
    );
    await b("logout", {});
    const message = await b(
      "contact",
      {
        name: "Guest Test",
        email: "guest@example.test",
        topic: "Feedback",
        message: "Local integration test only.",
      },
      201,
    );
    execFileSync(php, ["bin/admin.php", credentials.email], { cwd: root, env });
    const staff = await a("admin");
    check(
      staff.messages.some((item) => item.id === message.reference),
      "Contact message reaches staff inbox",
    );
    await a("message-read", { id: message.reference });
    await a("order-status", { id: order.id, status: "completed" }, 409);
    for (const status of ["preparing", "ready", "completed"])
      await a("order-status", { id: order.id, status });
    await a("product-update", {
      id: product.id,
      price_centavos: product.price_centavos,
      active: false,
    });
    check(
      !(await a("products")).products.some((item) => item.id === product.id),
      "Unavailable product excluded",
    );
    await a("orders", { ...payload, request_key: "unavailable-item-01" }, 409);
    const hash = execFileSync(
      php,
      [
        "-r",
        "require 'src/bootstrap.php'; echo query('SELECT password_hash FROM users LIMIT 1')->fetchColumn();",
      ],
      { cwd: root, env, encoding: "utf8" },
    );
    check(
      hash !== credentials.password && hash.startsWith("$2y$"),
      "Password is hashed",
    );
    for (const page of [
      "index.php",
      "contact.php",
      "about-us.php",
      "LOGIN/LOGIN.php",
      "LOGIN/register.php",
    ]) {
      const response = await fetch("http://127.0.0.1:8081/" + page);
      check(
        response.status === 200 &&
          !(await response.text()).includes("Fatal error"),
        page + " renders",
      );
    }
    console.log("Passed " + checks + " integration checks.");
  } finally {
    server.kill();
    // Test data stays in the OS temporary folder, never in the app database.
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
