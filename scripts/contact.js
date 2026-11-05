const contactForm = document.querySelector("#contact-form");
const topic = document.querySelector("#contact-topic");
const message = document.querySelector("#contact-message");
const contactStatus = document.querySelector("#contact-status");
const fallback = document.querySelector("#contact-fallback");
const copyField = document.querySelector("#contact-copy");

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  fallback.hidden = true;
  const text = message.value.trim();
  if (!text) {
    contactStatus.textContent = "Write a message before copying.";
    message.focus();
    return;
  }

  const draft = "Big Zix — " + topic.value + "\n\n" + text;
  try {
    await navigator.clipboard.writeText(draft);
    contactStatus.textContent =
      "Message copied. You can paste it wherever you want to share it.";
  } catch {
    copyField.value = draft;
    fallback.hidden = false;
    contactStatus.textContent =
      "Automatic copying is unavailable. Copy the selected text below.";
    copyField.focus();
    copyField.select();
  }
});

const socialStatus = document.querySelector("#social-status");
for (const button of document.querySelectorAll("[data-social]")) {
  button.addEventListener("click", async () => {
    const handle = button.firstElementChild.textContent;
    try {
      await navigator.clipboard.writeText(handle);
      socialStatus.textContent =
        "Copied " + handle + " for " + button.dataset.social + ".";
    } catch {
      socialStatus.textContent = "Copy this handle manually: " + handle;
    }
  });
}

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
