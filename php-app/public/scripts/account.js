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

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = form.querySelector('[type="submit"]');
  if (submit.disabled) return;
  const data = Object.fromEntries(new FormData(form));
  if (
    data.confirmPassword !== undefined &&
    data.confirmPassword !== data.password
  ) {
    status.textContent = "The passwords must match.";
    return;
  }
  submit.disabled = true;
  status.textContent = "Please wait…";
  try {
    await BigZixAPI.request(
      data.confirmPassword === undefined ? "login" : "register",
      data,
    );
    location.href = "../index.php";
  } catch (error) {
    status.textContent = error.message;
    submit.disabled = false;
  }
});
