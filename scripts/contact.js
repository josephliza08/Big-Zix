const contactForm = document.querySelector("#contact-form");
const message = document.querySelector("#contact-message");
const contactStatus = document.querySelector("#contact-status");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!message.value.trim()) {
    contactStatus.textContent = "Please enter your message.";
    message.focus();
    return;
  }

  // Connect delivery here before reporting success. Keep the customer's text.
  contactStatus.textContent =
    "Your message could not be sent. Your text is still here.";
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
