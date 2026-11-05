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
