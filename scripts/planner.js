(() => {
  const form = document.querySelector("#planner-form");
  const items = document.querySelector("#planner-items");
  const status = document.querySelector("#planner-status");
  const copy = document.querySelector("#planner-copy");
  const share = document.querySelector("#planner-share");
  const format = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  });
  const money = (cents) => format.format(cents / 100);
  const catalog = [
    ...document.querySelectorAll("[data-section] .items li"),
  ].map((item) => {
    const name = item.querySelector("h4").textContent.trim();
    const price = Number(
      item.querySelector("p").textContent.replace(/[^0-9.]/g, ""),
    );
    return {
      name,
      image: item.querySelector("img")?.getAttribute("src"),
      cents: Math.round(price * 100),
      category: item.closest("[data-section]").dataset.section,
    };
  });
  const pizzas = catalog.filter(({ category }) =>
    ["pizza-sharing", "best-seller", "todays-offer"].includes(category),
  );
  const bundles = catalog.filter(({ category }) => category === "bundle-meals");
  const sides = catalog.filter(({ name }) =>
    [
      "Garlic Bread",
      "Chicken Wings",
      "French Fries",
      "Chocolate Brownie",
    ].includes(name),
  );
  const drinks = catalog.filter(({ name }) =>
    ["Cola", "Iced Tea", "Lemonade"].includes(name),
  );
  let plans = [];
  let current;

  function buildPlans(people, budget, mood) {
    const options = [];
    const mains = mood === "bundles" ? bundles : pizzas;
    const mainQuantity = Math.ceil(people / 4);
    for (const main of mains) {
      for (const side of [null, ...sides]) {
        for (const drink of mood === "pizza" ? [null] : [null, ...drinks]) {
          const lines = [
            { item: main, quantity: mainQuantity },
            { item: side, quantity: mainQuantity },
            { item: drink, quantity: people },
          ];
          const total = lines.reduce(
            (sum, { item, quantity }) => sum + (item?.cents ?? 0) * quantity,
            0,
          );
          if (total <= budget)
            options.push({
              lines,
              total,
              variety: lines.filter(({ item }) => item).length,
            });
        }
      }
    }
    return options.sort((a, b) => b.variety - a.variety || a.total - b.total);
  }

  function render(people) {
    items.replaceChildren();
    copy.textContent = "Copy meal plan";
    share.hidden = true;
    copy.hidden = !current;
    if (!current) {
      status.textContent =
        "No plan fits that budget. Try a larger budget or a different meal style.";
      return;
    }

    const summary = `${money(current.total)} total · ${money(current.total / people)} per person`;
    status.textContent =
      summary + ". Estimated quantities. Confirm portions before ordering.";
    const lines = [];
    current.lines.forEach(({ item, quantity }, index) => {
      if (!item) return;
      const line = `${quantity} × ${item.name} · ${money(item.cents * quantity)}`;
      lines.push(line);
      const row = document.createElement("li");
      const photo = document.createElement("img");
      photo.src = item.image;
      photo.alt = "";
      photo.loading = "lazy";
      photo.width = 76;
      photo.height = 76;
      const details = document.createElement("div");
      const description = document.createElement("strong");
      description.textContent = line;
      details.append(description);
      row.append(photo, details);
      const alternatives = [
        ...new Set(plans.map((plan) => plan.lines[index].item).filter(Boolean)),
      ];
      if (alternatives.length > 1) {
        const label = document.createElement("label");
        label.textContent = `Swap ${item.name} `;
        const select = document.createElement("select");
        for (const alternative of alternatives) {
          const option = document.createElement("option");
          option.value = alternative.name;
          option.textContent = alternative.name;
          option.selected = alternative === item;
          select.append(option);
        }
        select.addEventListener("change", () => {
          const name = select.value;
          const candidates = plans.filter(
            (plan) => plan.lines[index].item?.name === name,
          );
          const changes = (plan) =>
            plan.lines.reduce(
              (count, entry, slot) =>
                count +
                Number(
                  slot !== index && entry.item !== current.lines[slot].item,
                ),
              0,
            );
          candidates.sort(
            (a, b) =>
              changes(a) - changes(b) ||
              b.variety - a.variety ||
              a.total - b.total,
          );
          current = candidates[0];
          render(people);
          items.querySelector(`[data-slot="${index}"]`)?.focus();
        });
        select.dataset.slot = index;
        label.append(select);
        details.append(label);
      }
      items.append(row);
    });
    share.value = [
      "Big Zix Pizza Night",
      ...lines,
      summary,
      "Estimated quantities. Confirm portions before ordering.",
    ].join("\n");
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const people = Number(data.get("people"));
    plans = buildPlans(
      people,
      Math.round(Number(data.get("budget")) * 100),
      data.get("mood"),
    );
    current = plans[0];
    render(people);
  });

  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(share.value);
      copy.textContent = "Copied!";
    } catch {
      share.hidden = false;
      share.focus();
      share.select();
    }
  });
  form.requestSubmit();
})();
