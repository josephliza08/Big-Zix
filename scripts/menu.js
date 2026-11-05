const search = document.querySelector("#product-search");
const buttons = [...document.querySelectorAll("[data-category]")];
const sections = [...document.querySelectorAll("[data-section]")];
const empty = document.querySelector("#empty-menu");
let activeCategory = "all";

function filterMenu() {
  const term = search.value.trim().toLowerCase();
  let matches = 0;
  for (const section of sections) {
    const inCategory =
      activeCategory === "all" || activeCategory === section.dataset.section;
    let sectionMatches = 0;
    for (const item of section.querySelectorAll("li")) {
      const name = item.querySelector("h4").textContent.toLowerCase();
      item.hidden = !inCategory || !name.includes(term);
      if (!item.hidden) sectionMatches++;
    }
    section.hidden = sectionMatches === 0;
    section.dispatchEvent(new Event("menufilter"));
    matches += sectionMatches;
  }
  empty.hidden = matches > 0;
  document.querySelector("#menu-count").textContent =
    matches + " items to choose from";
}

for (const button of buttons) {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    for (const option of buttons)
      option.setAttribute("aria-pressed", String(option === button));
    document.querySelector("#menu").setAttribute("data-updated", "");
    filterMenu();
  });
}
search.addEventListener("input", filterMenu);
document.querySelectorAll("[data-feature]").forEach((card) => {
  card.addEventListener("click", (event) => {
    const filter = buttons.find(
      (button) => button.dataset.category === card.dataset.feature,
    );
    if (!filter) return;
    event.preventDefault();
    search.value = "";
    filter.click();
    const menu = document.querySelector("#menu");
    menu.scrollIntoView({ block: "start" });
    filter.focus({ preventScroll: true });
  });
});

const delivery = document.querySelector("#delivery-form");
const address = document.querySelector("#delivery-address");
const locationButton = document.querySelector("#locate");
const deliveryStatus = document.querySelector("#delivery-status");
const locationKey = "big-zix.delivery-location";

function showLocation(location, prefix) {
  const label = location.address || location.coordinates;
  deliveryStatus.textContent = prefix + label;
}

function saveLocation(location) {
  try {
    localStorage.setItem(locationKey, JSON.stringify(location));
    showLocation(location, "Saved on this browser · ");
  } catch {
    showLocation(location, "Selected for this visit · ");
  }
}

try {
  const saved = JSON.parse(localStorage.getItem(locationKey));
  if (saved && (saved.address || saved.coordinates)) {
    address.value = saved.address || "";
    showLocation(saved, "Saved on this browser · ");
  }
} catch {
  // The address form still works when browser storage is unavailable.
}

delivery.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = address.value.trim();
  if (!value) {
    deliveryStatus.textContent = "Enter an address before saving.";
    address.focus();
    return;
  }
  saveLocation({ address: value });
});

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation || !window.isSecureContext) {
    deliveryStatus.textContent =
      "Device location needs a secure page. You can type your address above.";
    return;
  }
  locationButton.disabled = true;
  deliveryStatus.textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      saveLocation({
        coordinates: latitude.toFixed(4) + ", " + longitude.toFixed(4),
      });
      address.value = "";
      locationButton.disabled = false;
    },
    (error) => {
      locationButton.disabled = false;
      deliveryStatus.textContent =
        error.code === 1
          ? "Location access was declined. You can type your address above."
          : "Could not find your location. Try again or type your address above.";
    },
    { timeout: 12000, maximumAge: 60000 },
  );
});

const orderDialog = document.querySelector("#order-dialog");
const orderTitle = document.querySelector("#order-title");
const orderKicker = document.querySelector("#order-kicker");
const orderMessage = document.querySelector("#order-message");
const orderActions = document.querySelector("#order-actions");
const orderStatus = document.querySelector("#order-status");
const cartList = document.querySelector("#cart-list");
const cartButton = document.querySelector("#cart-button");

const checkout = document.querySelector("#checkout-form");
const method = document.querySelector("#order-method");
const addressField = document.querySelector("#order-address-field");
const checkoutAddress = document.querySelector("#order-address");
const cartKey = "big-zix.guest-cart";
const orderKey = "big-zix.last-order";
let lastOrder = null;
const cart = new Map();
const products = new Map(
  [...document.querySelectorAll(".items li")].map((item) => {
    const name = item.querySelector("h4").textContent;
    const price = Number(
      item.querySelector("p").textContent.replace(/[^0-9.]/g, ""),
    );
    return [name, { name, price }];
  }),
);
const orderExtras = [
  { name: "Cola", price: 49, image: "./assets/menu/pexels-8879626.jpg" },
  { name: "Iced Tea", price: 49, image: "./assets/menu/pexels-18263138.jpg" },
  { name: "Lemonade", price: 69, image: "./assets/menu/pexels-33107436.jpg" },
  {
    name: "Garlic Bread",
    price: 99,
    image: "./assets/menu/pexels-37043987.jpg",
  },
  {
    name: "Chicken Wings",
    price: 199,
    image: "./assets/menu/pexels-29908653.jpg",
  },
  {
    name: "French Fries",
    price: 89,
    image: "./assets/menu/pexels-5860680.jpg",
  },
  {
    name: "Chocolate Brownie",
    price: 89,
    image: "./assets/menu/pexels-6390686.jpg",
  },
  { name: "Garlic Dip", price: 25, image: "./assets/menu/pexels-9304931.jpg" },
  {
    name: "Chili Flakes",
    price: 15,
    image: "./assets/menu/pexels-11733646.jpg",
  },
];
for (const extra of orderExtras) {
  const menuProduct = products.get(extra.name);
  if (menuProduct) extra.price = menuProduct.price;
  else products.set(extra.name, extra);
}
const extrasList = document.querySelector("#checkout-extras-list");
const pesos = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

try {
  const saved = JSON.parse(localStorage.getItem(cartKey));
  for (const [name, quantity] of Object.entries(saved || {})) {
    if (
      products.has(name) &&
      Number.isSafeInteger(quantity) &&
      quantity > 0 &&
      quantity <= 99
    ) {
      cart.set(name, { ...products.get(name), quantity });
    }
  }
} catch {
  // The cart works in memory if browser storage is unavailable.
}

function syncCart() {
  const items = [...cart.values()];
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  cartButton.textContent = "Cart (" + count + ")";
  document.querySelector("#cart-summary").hidden = count === 0;
  document.querySelector("#cart-total").textContent =
    count +
    (count === 1 ? " item" : " items") +
    " · " +
    pesos.format(subtotal());
  for (const button of document.querySelectorAll(".product-add")) {
    const quantity = cart.get(button.dataset.product)?.quantity || 0;
    button.textContent = quantity
      ? "Add another · " + quantity + " in cart"
      : "+ Add to cart";
    button.disabled = quantity >= 99;
  }
  try {
    localStorage.setItem(
      cartKey,
      JSON.stringify(
        Object.fromEntries(items.map((item) => [item.name, item.quantity])),
      ),
    );
  } catch {
    // Keep the current cart usable.
  }
}

function changeQuantity(product, change) {
  const quantity = Math.min(
    99,
    (cart.get(product.name)?.quantity || 0) + change,
  );
  if (quantity > 0) cart.set(product.name, { ...product, quantity });
  else cart.delete(product.name);
  syncCart();
}

function setDialog(kicker, title, message) {
  orderKicker.textContent = kicker;
  orderTitle.textContent = title;
  orderMessage.textContent = message;
  orderActions.replaceChildren();
  cartList.replaceChildren();
  cartList.hidden = true;
  checkout.hidden = true;
  orderStatus.hidden = true;
}

function action(label, handler, secondary = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "dialog-action" + (secondary ? " secondary" : "");
  button.textContent = label;
  button.addEventListener("click", handler);
  orderActions.append(button);
}

function renderCart(editable, reviewing = false) {
  const items = [...cart.values()];
  cartList.hidden = items.length === 0;
  for (const item of items) {
    const row = document.createElement("li");
    row.className = "order-line";
    const label = document.createElement("div");
    label.className = "order-line-info";
    const name = document.createElement("strong");
    name.textContent = item.name;
    const unit = document.createElement("span");
    unit.textContent = pesos.format(item.price) + " each";
    label.append(name);
    label.append(unit);
    const total = document.createElement("strong");
    total.className = "order-line-total";
    total.textContent = pesos.format(item.quantity * item.price);
    row.append(label);
    row.append(total);
    if (editable) {
      const group = document.createElement("div");
      group.className = "cart-quantity";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", "Quantity for " + item.name);
      for (const [change, text, verb] of [
        [-1, "−", "Remove one"],
        [1, "+", "Add one"],
        [-item.quantity, "Remove", "Remove item"],
      ]) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.className = text === "Remove" ? "remove-item" : "quantity-step";
        button.setAttribute("aria-label", verb + " " + item.name);
        button.disabled = change > 0 && item.quantity >= 99;
        button.addEventListener("click", () => {
          changeQuantity(item, change);
          if (reviewing && cart.size) {
            cartList.replaceChildren();
            renderCart(true, true);
            orderMessage.textContent = "Subtotal · " + pesos.format(subtotal());
            updateCheckoutExtras();
          } else {
            showCart();
          }
          const next = [...cartList.querySelectorAll("button")].find(
            (control) =>
              control.getAttribute("aria-label") ===
                button.getAttribute("aria-label") && !control.disabled,
          );
          (next || orderActions.firstElementChild)?.focus();
        });
        if (text === "Remove") {
          row.append(button);
        } else {
          group.append(button);
          if (change === -1) {
            const count = document.createElement("span");
            count.className = "quantity-value";
            count.textContent = item.quantity;
            group.append(count);
          }
        }
      }
      row.append(group);
    }
    cartList.append(row);
  }
}

function subtotal() {
  return [...cart.values()].reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
}

function showCart() {
  setDialog(
    "Your order",
    "Your cart",
    cart.size
      ? "Subtotal · " + pesos.format(subtotal())
      : "Your cart is empty.",
  );
  renderCart(true);
  if (cart.size) action("Review order", showCheckout);
  const order = readLastOrder();
  if (order) action("View last order", () => showConfirmation(order), true);
  action("Back to menu", () => orderDialog.close(), true);
  orderActions.firstElementChild.focus();
}

function readLastOrder() {
  if (lastOrder) return lastOrder;
  try {
    const order = JSON.parse(localStorage.getItem(orderKey));
    return Array.isArray(order?.items) && Number.isFinite(order.total)
      ? order
      : null;
  } catch {
    return null;
  }
}

function showConfirmation(order) {
  setDialog(
    "Big Zix · Order receipt",
    "Order recorded",
    order.reference + " · " + pesos.format(order.total),
  );
  cartList.hidden = false;
  for (const item of order.items) {
    const row = document.createElement("li");
    row.textContent =
      item.quantity +
      " × " +
      item.name +
      " · " +
      pesos.format(item.price * item.quantity);
    cartList.append(row);
  }
  orderStatus.textContent =
    (order.method === "delivery" ? "Delivery to " + order.address : "Pickup") +
    ". Recorded on this browser. Payment has not been collected.";
  orderStatus.hidden = false;
  action("Back to menu", () => orderDialog.close());
  orderActions.firstElementChild.focus();
}

function updateMethod() {
  const delivery = method.value === "delivery";
  addressField.hidden = !delivery;
  checkoutAddress.required = delivery;
}

function showCheckout() {
  setDialog(
    "Guest checkout",
    "Review your order",
    "Subtotal · " + pesos.format(subtotal()),
  );
  orderDialog.scrollTop = 0;
  renderCart(true, true);
  checkout.hidden = false;
  checkoutAddress.value ||= address.value.trim();
  updateMethod();
  updateCheckoutExtras();
  action("Place order", () => checkout.requestSubmit());
  action("Back to cart", showCart, true);
  method.focus();
}

function updateCheckoutExtras() {
  for (const [index, button] of [
    ...extrasList.querySelectorAll("button"),
  ].entries()) {
    const extra = orderExtras[index];
    const quantity = cart.get(extra.name)?.quantity || 0;
    button.textContent = quantity
      ? "+ Add another (" + quantity + ")"
      : "+ Add";
    button.disabled = quantity >= 99;
  }
}

for (const extra of orderExtras) {
  const row = document.createElement("li");
  const photo = document.createElement("img");
  photo.src = extra.image;
  photo.alt = "";
  photo.loading = "lazy";
  photo.decoding = "async";
  const details = document.createElement("div");
  details.className = "extra-details";
  const label = document.createElement("strong");
  label.textContent = extra.name;
  const price = document.createElement("span");
  price.className = "extra-price";
  price.textContent = pesos.format(extra.price);
  const button = document.createElement("button");
  button.type = "button";
  button.setAttribute(
    "aria-label",
    "Add " + extra.name + " for " + pesos.format(extra.price),
  );
  button.addEventListener("click", () => {
    changeQuantity(extra, 1);
    orderMessage.textContent = "Subtotal · " + pesos.format(subtotal());
    cartList.replaceChildren();
    renderCart(true, true);
    updateCheckoutExtras();
    orderStatus.textContent = extra.name + " added to your order.";
    orderStatus.hidden = false;
  });
  details.append(label, price, button);
  row.append(photo, details);
  extrasList.append(row);
}
method.addEventListener("change", updateMethod);
checkout.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!cart.size) return;
  const deliveryAddress =
    method.value === "delivery" ? checkoutAddress.value.trim() : "";
  if (method.value === "delivery" && !deliveryAddress) {
    orderStatus.textContent = "Enter a delivery address to continue.";
    orderStatus.hidden = false;
    checkoutAddress.focus();
    return;
  }
  const order = {
    reference: "BZ-" + Date.now().toString(36).toUpperCase(),
    items: [...cart.values()],
    total: subtotal(),
    method: method.value,
    address: deliveryAddress,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(orderKey, JSON.stringify(order));
  } catch {
    // The confirmation remains available for this visit without storage.
  }
  lastOrder = order;
  cart.clear();
  syncCart();
  showConfirmation(order);
});

function openOrder() {
  if (!orderDialog.open) orderDialog.showModal();
  showCart();
}

document.querySelectorAll(".items li").forEach((item) => {
  const product = products.get(item.querySelector("h4").textContent);
  item.querySelector("p").textContent = pesos.format(product.price);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "product-add";
  button.dataset.product = product.name;
  button.setAttribute("aria-label", "Add " + product.name + " to cart");
  button.addEventListener("click", () => {
    changeQuantity(product, 1);
    document.querySelector("#menu-feedback").textContent =
      product.name + " added to your cart.";
  });
  item.querySelector(".item-details").append(button);
});
cartButton.addEventListener("click", openOrder);
document.querySelector("#view-cart").addEventListener("click", openOrder);
document.querySelector("#reset-menu").addEventListener("click", () => {
  search.value = "";
  buttons[0].click();
  search.focus();
});
filterMenu();
syncCart();
orderDialog.addEventListener("click", (event) => {
  if (event.target === orderDialog) {
    const bounds = orderDialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      orderDialog.close();
  }
});

const featuredSlides = [
  {
    kicker: "Big Zix Pizza",
    title: "Good night for pizza.",
    description:
      "Pizza for sharing, bundles for the table, and something sweet after.",
    category: "all",
  },
  { kicker: "Best Seller", title: "Pepperoni Feast", category: "best-seller" },
  {
    kicker: "Bundle Meals",
    title: "Pizza & Pasta Bundle",
    category: "bundle-meals",
  },
  {
    kicker: "Sides & Desserts",
    title: "Chicken Wings",
    category: "sides-desserts",
  },
];

const hero = document.querySelector(".hero");
const track = hero.querySelector(".hero-slide-track");
const cards = [...track.children];
const controls = hero.querySelector(".hero-controls");
const pause = hero.querySelector("#hero-pause");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const title = hero.querySelector("h1");
const kicker = hero.querySelector(".kicker");
const caption = hero.querySelector(".hero-copy p:not(.kicker)");
const link = hero.querySelector(".cta");
const counter = hero.querySelector(".slide-number");
let current = 0;
let paused = motion.matches;
let hovered = false;
let reveals = [];

function showProduct(index, animate = true) {
  current = (index + cards.length) % cards.length;
  track.style.transform = "translateX(" + -100 * current + "%)";

  const product = featuredSlides[current];
  kicker.textContent = product.kicker;
  title.textContent = product.title;
  caption.textContent =
    product.description || pesos.format(products.get(product.title).price);
  caption.classList.toggle("hero-product-price", current !== 0);
  link.textContent = current ? "View on the menu ↓" : "Explore the menu ↓";

  counter.textContent =
    String(current + 1).padStart(2, "0") +
    " / " +
    String(cards.length).padStart(2, "0");

  for (const reveal of reveals) reveal.cancel();
  reveals = [];
  if (animate && !motion.matches && title.animate) {
    reveals = [title, caption].map((line, i) =>
      line.animate(
        [
          { clipPath: "inset(100% 0 0)", transform: "translateY(12px)" },
          { clipPath: "inset(0)", transform: "translateY(0)" },
        ],
        {
          duration: 420,
          delay: i * 55,
          fill: "backwards",
          easing: "cubic-bezier(.2,.8,.2,1)",
        },
      ),
    );
  }
}

function setPaused(value) {
  paused = value;
  pause.setAttribute(
    "aria-label",
    paused ? "Play product rotation" : "Pause product rotation",
  );
  pause.firstElementChild.textContent = paused ? "▶" : "Ⅱ";
}

function chooseProduct(index) {
  setPaused(true);
  if ((index + cards.length) % cards.length !== current) showProduct(index);
}

for (const button of controls.querySelectorAll("[data-slide]")) {
  button.addEventListener("click", () =>
    chooseProduct(current + Number(button.dataset.slide)),
  );
}
pause.addEventListener("click", () => setPaused(!paused));
hero.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  chooseProduct(current + (event.key === "ArrowLeft" ? -1 : 1));
});
hero.addEventListener("pointerenter", (event) => {
  if (event.pointerType === "mouse") hovered = true;
});
hero.addEventListener("pointerleave", () => {
  hovered = false;
});
motion.addEventListener("change", (event) => {
  if (event.matches) {
    setPaused(true);
    for (const reveal of reveals) reveal.cancel();
  }
});
link.addEventListener("click", () => {
  search.value = "";
  buttons
    .find(
      (button) => button.dataset.category === featuredSlides[current].category,
    )
    ?.click();
});
setInterval(() => {
  if (
    !paused &&
    !hovered &&
    !document.hidden &&
    !hero.contains(document.activeElement)
  )
    showProduct(current + 1);
}, 6500);
showProduct(0, false);
setPaused(paused);
controls.hidden = false;

// Product carousels are independent of the sliding hero banner.
for (const category of sections) {
  const shelf = category.querySelector(".items");
  const items = [...shelf.children];
  shelf.classList.add("menu-shelf");
  const controls = document.createElement("div");
  controls.className = "menu-shelf-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute(
    "aria-label",
    category.querySelector("h3").textContent + " carousel",
  );
  const previous = document.createElement("button");
  previous.type = "button";
  previous.textContent = "←";
  previous.setAttribute("aria-label", "Previous product");
  const counter = document.createElement("span");
  counter.setAttribute("aria-live", "polite");
  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "→";
  next.setAttribute("aria-label", "Next product");
  controls.append(previous, counter, next);
  const picker = document.createElement("div");
  picker.className = "menu-product-picker";
  picker.setAttribute("role", "group");
  picker.setAttribute("aria-label", "Choose a product");
  let active = items[0];
  let visible = items;
  const choices = items.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.querySelector("h4").textContent;
    button.addEventListener("click", () => {
      active = item;
      render();
    });
    picker.append(button);
    // Clicking a side card brings it forward. Its Add button still adds directly.
    item.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      active = item;
      render();
    });
    return button;
  });
  shelf.after(controls);
  controls.after(picker);
  function render() {
    visible = items.filter((item) => !item.hidden);
    if (!visible.includes(active)) active = visible[0];
    const index = visible.indexOf(active);
    counter.textContent = visible.length
      ? index + 1 + " / " + visible.length
      : "";
    previous.disabled = next.disabled = visible.length < 2;
    choices.forEach((button, i) => {
      button.hidden = items[i].hidden;
      button.setAttribute("aria-pressed", String(items[i] === active));
    });
    visible.forEach((item, i) => {
      let distance = i - index;
      if (distance > visible.length / 2) distance -= visible.length;
      if (distance < -visible.length / 2) distance += visible.length;
      item.style.setProperty("--slide-x", distance * 82 + "%");
      item.style.setProperty(
        "--slide-angle",
        -Math.sign(distance) * 38 + "deg",
      );
      item.style.setProperty("--slide-scale", distance ? ".84" : "1");
      item.style.zIndex = String(5 - Math.abs(distance));
      item.toggleAttribute("data-active", distance === 0);
      item.toggleAttribute("data-far", Math.abs(distance) > 1);
      item.inert = Math.abs(distance) > 1;
    });
  }
  function step(direction) {
    if (visible.length < 2) return;
    active =
      visible[
        (visible.indexOf(active) + direction + visible.length) % visible.length
      ];
    render();
  }
  previous.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  category.addEventListener("menufilter", render);
  shelf.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    step(event.key === "ArrowLeft" ? -1 : 1);
    active.querySelector(".product-add").focus({ preventScroll: true });
  });
  let drag = null;
  let suppressClickUntil = 0;
  const hint = document.createElement("p");
  hint.className = "carousel-hint";
  hint.textContent = "Drag or swipe to explore";
  shelf.before(hint);
  shelf.addEventListener("dragstart", (event) => event.preventDefault());
  shelf.addEventListener(
    "click",
    (event) => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );
  shelf.addEventListener("pointerdown", (event) => {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      visible.length < 2 ||
      event.target.closest("button")
    )
      return;
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      delta: 0,
      moving: false,
    };
  });
  shelf.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const x = event.clientX - drag.x;
    const y = event.clientY - drag.y;
    if (!drag.moving) {
      if (Math.abs(y) > 10 && Math.abs(y) > Math.abs(x)) {
        drag = null;
        return;
      }
      if (Math.abs(x) < 8) return;
      drag.moving = true;
      shelf.setPointerCapture(event.pointerId);
      shelf.classList.add("is-dragging");
    }
    drag.delta = x;
    if (!motion.matches) {
      const offset = Math.max(-150, Math.min(150, x * 0.65));
      shelf.style.setProperty("--drag-x", offset + "px");
      shelf.style.setProperty(
        "--drag-tilt",
        Math.max(-5, Math.min(5, x / 35)) + "deg",
      );
    }
  });
  function finishDrag(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.id) return;
    const ended = drag;
    drag = null;
    shelf.classList.remove("is-dragging");
    shelf.style.removeProperty("--drag-x");
    shelf.style.removeProperty("--drag-tilt");
    if (shelf.hasPointerCapture(ended.id))
      shelf.releasePointerCapture(ended.id);
    if (ended.moving) suppressClickUntil = performance.now() + 350;
    if (!cancelled && ended.moving && Math.abs(ended.delta) > 45)
      step(ended.delta < 0 ? 1 : -1);
  }
  shelf.addEventListener("pointerup", (event) => finishDrag(event));
  shelf.addEventListener("pointercancel", (event) => finishDrag(event, true));
  shelf.addEventListener("lostpointercapture", (event) =>
    finishDrag(event, true),
  );
  shelf.addEventListener("pointerleave", () => {
    if (drag && !drag.moving) drag = null;
  });
  render();
}
