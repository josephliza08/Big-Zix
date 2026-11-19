(() => {
  const target = document.querySelector("#dashboard-content");
  const status = document.querySelector("#dashboard-status");
  const staff = document.body.dataset.staff === "true";
  const money = (cents) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(cents / 100);
  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const transitions = {
    pending: ["preparing", "cancelled"],
    preparing: ["ready", "cancelled"],
    ready: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  const date = (value) =>
    new Date(value.replace(" ", "T") + "Z").toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      dateStyle: "medium",
      timeStyle: "short",
    });

  function action(label, endpoint, payload) {
    const button = element("button", label, "dashboard-button");
    button.type = "button";
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        await BigZixAPI.request(
          endpoint,
          typeof payload === "function" ? payload() : payload,
        );
        await load();
        status.textContent = "Changes saved.";
      } catch (error) {
        status.textContent = error.message;
        button.disabled = false;
      }
    });
    return button;
  }

  async function load() {
    status.textContent = "Loading…";
    try {
      const data = await BigZixAPI.request(staff ? "admin" : "orders");
      target.replaceChildren();
      target.append(element("h2", staff ? "Customer orders" : "Your orders"));
      if (!data.orders.length) target.append(element("p", "No orders yet."));
      for (const order of data.orders) {
        const card = element("article", undefined, "dashboard-card");
        card.append(
          element("h3", order.reference),
          element(
            "p",
            `${order.status} · ${money(order.total_centavos)} · ${date(order.created_at)}`,
          ),
        );
        if (staff)
          card.append(
            element("p", `${order.customer_name} · ${order.customer_email}`),
          );
        card.append(
          element(
            "p",
            order.method === "delivery"
              ? `Delivery: ${order.address}`
              : "Pickup at the restaurant",
          ),
        );
        const list = element("ul");
        for (const item of order.items)
          list.append(
            element(
              "li",
              `${item.quantity} × ${item.name} — ${money(item.quantity * item.unit_centavos)}`,
            ),
          );
        card.append(list);
        if (staff) {
          const actions = element("div", undefined, "dashboard-actions");
          for (const next of transitions[order.status] || [])
            actions.append(
              action(`Mark ${next}`, "order-status", {
                id: order.id,
                status: next,
              }),
            );
          card.append(actions);
        }
        target.append(card);
      }
      if (staff) {
        target.append(element("h2", "Customer messages"));
        if (!data.messages.length)
          target.append(element("p", "No messages yet."));
        for (const message of data.messages) {
          const card = element("article", undefined, "dashboard-card");
          card.append(
            element("h3", `${message.topic} · ${message.status}`),
            element("p", `${message.name} · ${message.email}`),
            element("p", message.body, "message-body"),
          );
          if (message.status === "unread")
            card.append(
              action("Mark as read", "message-read", { id: message.id }),
            );
          target.append(card);
        }
        target.append(element("h2", "Menu prices and availability"));
        for (const product of data.products) {
          const card = element("article", undefined, "dashboard-card");
          card.append(element("h3", product.name));
          const label = element("label", "Price (₱)");
          const price = element("input");
          price.type = "number";
          price.min = "0.01";
          price.max = "100000";
          price.step = "0.01";
          price.value = (product.price_centavos / 100).toFixed(2);
          label.append(price);
          const availableLabel = element("label", "Available on menu ");
          const available = element("input");
          available.type = "checkbox";
          available.checked = Boolean(product.active);
          availableLabel.append(available);
          card.append(
            label,
            availableLabel,
            action("Save product", "product-update", () => {
              if (!price.reportValidity() || !price.value)
                throw new Error("Enter a valid price.");
              return {
                id: product.id,
                price_centavos: Math.round(Number(price.value) * 100),
                active: available.checked,
              };
            }),
          );
          target.append(card);
        }
      }
      status.textContent = "";
    } catch (error) {
      status.textContent = error.message;
    }
  }
  document.querySelector("#refresh-dashboard").addEventListener("click", load);
  load();
})();
