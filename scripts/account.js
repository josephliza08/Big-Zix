const form = document.querySelector("form");
const status = document.querySelector(".account-status");
for (const button of document.querySelectorAll(".password-toggle")) {
  button.addEventListener("click", () => {
    const input = button.previousElementSibling;
    const visible = input.type === "password";
    input.type = visible ? "text" : "password";
    button.setAttribute(
      "aria-label",
      visible ? "Hide password" : "Show password",
    );
    button.setAttribute("aria-pressed", String(visible));
  });
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const confirmation = form.elements.namedItem("confirmPassword");
  if (
    confirmation &&
    confirmation.value !== form.elements.namedItem("password").value
  ) {
    status.textContent = "The passwords must match.";
    confirmation.focus();
    return;
  }
  status.textContent = confirmation
    ? "Sign-up is not available yet. No account was created. Please check back soon."
    : "Log-in is not available yet. Online ordering is coming soon.";
  for (const input of form.querySelectorAll(
    'input[type="password"], .password-box input',
  ))
    input.value = "";
});
document.querySelector("[data-reset]")?.addEventListener("click", (event) => {
  event.preventDefault();
  status.textContent =
    "Password reset will be available once the account service is connected.";
});
