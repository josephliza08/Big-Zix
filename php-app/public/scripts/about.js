const box = document.querySelector("#pizza-box");
const summary = box.querySelector("summary");
const viewer = box.querySelector("model-viewer");
const hint = box.querySelector(".slice-hint");
let started = false;

function showError() {
  hint.textContent =
    "The 3D viewer could not load. Check your connection and reload the page.";
}

viewer.addEventListener("load", () => {
  viewer.setAttribute("data-ready", "");
  hint.removeAttribute("data-loading");
  hint.textContent = "Drag to turn the slice. Scroll or pinch to zoom.";
});
viewer.addEventListener("error", showError);

box.addEventListener("toggle", async () => {
  summary.textContent = box.open ? "Close the pizza box" : "Open the pizza box";
  if (!box.open || started) return;
  started = true;
  try {
    await import(
      "https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js"
    );
    const model = document.querySelector("#slice-asset").textContent;
    const bytes = Uint8Array.from(atob(model), (char) => char.charCodeAt(0));
    viewer.src = URL.createObjectURL(
      new Blob([bytes], { type: "model/gltf-binary" }),
    );
  } catch {
    showError();
  }
});

if (matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    document
      .querySelectorAll("[data-reveal]")
      .forEach((section) => observer.observe(section));
  }

  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const art = document.querySelector(".art");
    art.addEventListener("pointermove", (event) => {
      const bounds = art.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      art.style.setProperty("--tilt-x", -y * 8 + "deg");
      art.style.setProperty("--tilt-y", x * 8 + "deg");
    });
    art.addEventListener("pointerleave", () => {
      art.style.removeProperty("--tilt-x");
      art.style.removeProperty("--tilt-y");
    });
  }
}
