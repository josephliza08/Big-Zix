/* The server session, not localStorage, determines account access. */
(() => {
  const apiUrl = new URL("../api.php", document.currentScript.src);
  const homeUrl = new URL("../index.php", document.currentScript.src);
  const user = JSON.parse(
    document.querySelector('meta[name="bigzix-user"]').content,
  );
  let csrf = document.querySelector('meta[name="csrf-token"]').content;

  async function request(action, data) {
    const url = new URL(apiUrl);
    url.searchParams.set("action", action);
    const response = await fetch(url, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
      method: data === undefined ? "GET" : "POST",
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Please try again.");
    if (result.csrf) csrf = result.csrf;
    return result;
  }

  window.BigZixAPI = { user, request };
  if (user) {
    const nav = document.querySelector(".nav, .about-nav");
    if (nav) {
      for (const link of nav.querySelectorAll('a[href*="LOGIN/"]'))
        link.remove();
      const account = document.createElement("a");
      account.href = new URL("account.php", homeUrl).href;
      account.textContent = "My orders";
      nav.append(account);
      if (user.role === "admin") {
        const staff = document.createElement("a");
        staff.href = new URL("admin.php", homeUrl).href;
        staff.textContent = "Staff dashboard";
        nav.append(staff);
      }
      const logout = document.createElement("button");
      logout.type = "button";
      logout.className = "cart-button";
      logout.textContent = "Log out";
      logout.addEventListener("click", async () => {
        logout.disabled = true;
        try {
          await request("logout", {});
          location.href = homeUrl.href;
        } catch {
          logout.textContent = "Retry logout";
          logout.disabled = false;
        }
      });
      nav.append(logout);
    }
  }
})();
