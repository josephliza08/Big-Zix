const contactForm = document.querySelector("#contact-form");
const message = document.querySelector("#contact-message");
const contactStatus = document.querySelector("#contact-status");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = contactForm.querySelector('button[type="submit"]');
  if (submit.disabled) return;
  submit.disabled = true;
  contactStatus.textContent = "Sending your message…";
  try {
    const result = await BigZixAPI.request(
      "contact",
      Object.fromEntries(new FormData(contactForm)),
    );
    contactStatus.textContent =
      result.message + " Reference #" + result.reference;
    message.value = "";
  } catch (error) {
    contactStatus.textContent = error.message + " Your message is still here.";
  } finally {
    submit.disabled = false;
  }
});

message.addEventListener("input", () => {
  contactStatus.textContent = "";
});

if (
  matchMedia(
    "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
  ).matches
) {
  const hero = document.querySelector(".contact-hero");
  hero.addEventListener("pointermove", (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 14;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
    hero.style.setProperty("--photo-x", x + "px");
    hero.style.setProperty("--photo-y", y + "px");
  });
  hero.addEventListener("pointerleave", () => {
    hero.style.removeProperty("--photo-x");
    hero.style.removeProperty("--photo-y");
  });
}
