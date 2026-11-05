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
const draftKey = "big-zix.last-order-draft";
const cart = new Map();
const products = new Map(
  [...document.querySelectorAll(".items li")].map((item) => {
    const name = item.querySelector("h4").textContent;
    const price = Number(
      item.querySelector("p").textContent.replace(/[^0-9]/g, ""),
    );
    return [name, { name, price }];
  }),
);
const orderExtras = [
  { name: "Cola", price: 49, image: "./assets/menu/pexels-8879626.jpg" },
  { name: "Iced Tea", price: 59, image: "./assets/menu/pexels-18263138.jpg" },
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
  maximumFractionDigits: 0,
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

function renderCart(editable) {
  const items = [...cart.values()];
  cartList.hidden = items.length === 0;
  for (const item of items) {
    const row = document.createElement("li");
    const label = document.createElement("span");
    label.textContent =
      item.quantity +
      " × " +
      item.name +
      " · " +
      pesos.format(item.quantity * item.price);
    row.append(label);
    if (editable) {
      const group = document.createElement("div");
      group.className = "cart-quantity";
      for (const [change, text, verb] of [
        [-1, "−", "Remove one"],
        [1, "+", "Add one"],
      ]) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.setAttribute("aria-label", verb + " " + item.name);
        button.disabled = change > 0 && item.quantity >= 99;
        button.addEventListener("click", () => {
          changeQuantity(item, change);
          showCart();
          const next = [...cartList.querySelectorAll("button")].find(
            (control) =>
              control.getAttribute("aria-label") ===
                button.getAttribute("aria-label") && !control.disabled,
          );
          (next || orderActions.firstElementChild)?.focus();
        });
        group.append(button);
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
  const draft = readOrderDraft();
  if (draft) action("View last draft", () => showOrderDraft(draft), true);
  action("Back to menu", () => orderDialog.close(), true);
  orderActions.firstElementChild.focus();
}

function readOrderDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(draftKey));
    return Array.isArray(draft?.items) && Number.isFinite(draft.subtotal)
      ? draft
      : null;
  } catch {
    return null;
  }
}

function showOrderDraft(draft) {
  const destination =
    draft.method === "delivery" ? "Delivery to " + draft.address : "Pickup";
  setDialog(
    "Saved on this device",
    "Order draft",
    destination + " · " + pesos.format(draft.subtotal),
  );
  cartList.hidden = false;
  for (const item of draft.items) {
    const row = document.createElement("li");
    row.textContent = item.quantity + " × " + item.name;
    cartList.append(row);
  }
  orderStatus.textContent = "This draft has not been sent to Big Zix.";
  orderStatus.hidden = false;
  action("Back to cart", showCart, true);
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
  renderCart(false);
  checkout.hidden = false;
  checkoutAddress.value ||= address.value.trim();
  updateMethod();
  updateCheckoutExtras();
  action("Save order draft", () => checkout.requestSubmit());
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
    renderCart(false);
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
  const draft = {
    items: [...cart.values()],
    subtotal: subtotal(),
    method: method.value,
    address: deliveryAddress,
    createdAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(draftKey, JSON.stringify(draft));
  } catch {
    orderStatus.textContent =
      "This browser couldn’t save the draft. Your items are still in the cart.";
    orderStatus.hidden = false;
    return;
  }
  cart.clear();
  syncCart();
  showOrderDraft(draft);
  orderTitle.textContent = "Order draft saved";
});

function openOrder(product) {
  if (!orderDialog.open) orderDialog.showModal();
  if (!product) {
    showCart();
    return;
  }
  setDialog("Add to your order", product.name, pesos.format(product.price));
  action("Add to cart", () => {
    if ((cart.get(product.name)?.quantity || 0) >= 99) {
      orderStatus.textContent = "This item has reached the 99-item cart limit.";
      orderStatus.hidden = false;
      return;
    }
    changeQuantity(product, 1);
    setDialog("Added to cart", product.name, "Your item is in the cart.");
    action("View cart", showCart);
    action("Keep browsing", () => orderDialog.close(), true);
    orderActions.firstElementChild.focus();
  });
  action("Keep browsing", () => orderDialog.close(), true);
  orderActions.firstElementChild.focus();
}

document.querySelectorAll(".items li").forEach((item) => {
  const heading = item.querySelector("h4");
  const product = products.get(heading.textContent);
  const button = document.createElement("button");
  button.type = "button";
  button.className = "product-open";
  button.textContent = product.name;
  button.setAttribute("aria-haspopup", "dialog");
  button.addEventListener("click", () => {
    const select = new Event("menuproductselect", {
      bubbles: true,
      cancelable: true,
    });
    if (item.dispatchEvent(select)) openOrder(product);
  });
  heading.replaceChildren(button);
});
cartButton.addEventListener("click", () => openOrder());
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

for (const category of sections) {
  const shelf = category.querySelector(".items");
  const items = [...shelf.querySelectorAll("li")];
  const controls = document.createElement("div");
  controls.className = "menu-shelf-controls";
  controls.setAttribute("role", "group");
  controls.setAttribute(
    "aria-label",
    category.querySelector("h3").textContent + " carousel",
  );
  controls.innerHTML =
    '<button type="button" data-step="-1" aria-label="Previous item">←</button>' +
    '<span aria-live="polite"></span><button type="button" data-step="1" aria-label="Next item">→</button>';
  shelf.after(controls);
  shelf.classList.add("menu-shelf");
  const picker = document.createElement("div");
  picker.className = "menu-product-picker";
  picker.setAttribute("role", "group");
  picker.setAttribute(
    "aria-label",
    category.querySelector("h3").textContent + " products",
  );
  controls.after(picker);
  const productButtons = items.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.querySelector("h4").textContent;
    button.addEventListener("click", () => {
      if (active === item) {
        item.querySelector(".product-open").click();
      } else {
        active = item;
        render(true);
      }
    });
    picker.append(button);
    return button;
  });
  let active = items[0];
  let visible = items;
  let reveal;

  function render(animate) {
    visible = items.filter((item) => !item.hidden);
    if (!visible.includes(active)) active = visible[0];
    const current = visible.indexOf(active);
    controls.hidden = visible.length < 2;
    productButtons.forEach((button, index) => {
      button.hidden = items[index].hidden;
      button.setAttribute("aria-pressed", String(items[index] === active));
    });
    controls.querySelector("span").textContent = visible.length
      ? current + 1 + " / " + visible.length
      : "";
    visible.forEach((item, index) => {
      let distance = index - current;
      if (distance > visible.length / 2) distance -= visible.length;
      if (distance < -visible.length / 2) distance += visible.length;
      item.style.setProperty("--item-x", distance * 67 + "%");
      item.style.setProperty("--item-y", Math.sign(distance) * -57 + "deg");
      item.style.setProperty("--item-scale", distance ? ".78" : "1");
      item.style.zIndex = String(5 - Math.abs(distance));
      item.toggleAttribute("data-active", distance === 0);
      item.toggleAttribute("data-far", Math.abs(distance) > 1);
      const button = item.querySelector(".product-open");
      button.setAttribute(
        "aria-label",
        (distance ? "Bring forward " : "View ") + button.textContent,
      );
      button.setAttribute("aria-haspopup", distance ? "false" : "dialog");
    });
    reveal?.cancel();
    if (animate && active && !motion.matches && active.animate) {
      reveal = active.querySelector(".item-details").animate(
        [
          { clipPath: "inset(100% 0 0)", transform: "translateY(8px)" },
          { clipPath: "inset(0)", transform: "translateY(0)" },
        ],
        { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
    }
  }

  function step(direction) {
    if (visible.length < 2) return;
    active =
      visible[
        (visible.indexOf(active) + direction + visible.length) % visible.length
      ];
    render(true);
  }
  controls.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => step(Number(button.dataset.step)));
  });
  category.addEventListener("menufilter", () => render(false));
  shelf.addEventListener("menuproductselect", (event) => {
    if (event.target === active) return;
    event.preventDefault();
    active = event.target;
    render(true);
  });
  category.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    step(event.key === "ArrowLeft" ? -1 : 1);
    if (shelf.contains(document.activeElement))
      active?.querySelector(".product-open").focus({ preventScroll: true });
  });
  render(false);
}
