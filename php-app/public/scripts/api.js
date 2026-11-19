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
    if (result.user && window.BigZixAPI) {
      if (window.BigZixAPI.user)
        Object.assign(window.BigZixAPI.user, result.user);
      else window.BigZixAPI.user = result.user;
      document.dispatchEvent(new Event("profilechange"));
    }
    return result;
  }

  async function uploadPhoto(data) {
    const response = await fetch(new URL("profile-photo.php", homeUrl), {
      method: "POST",
      credentials: "same-origin",
      headers: { "X-CSRF-Token": csrf },
      body: data,
    });
    const result = await response.json();
    if (!response.ok)
      throw new Error(result.error || "Could not save your picture.");
    Object.assign(user, result.user);
    document.dispatchEvent(new Event("profilechange"));
    return result;
  }
  window.BigZixAPI = { user, request, uploadPhoto };
  if (user) {
    const nav = document.querySelector(".nav, .about-nav");
    if (nav) {
      for (const link of nav.querySelectorAll('a[href*="LOGIN/"]'))
        link.remove();
      const account = document.createElement("a");
      account.href = new URL("account.php", homeUrl).href;
      account.textContent = "My orders";
      nav.append(account);
      const profile = document.createElement("a");
      profile.href = new URL("profile.php", homeUrl).href;
      profile.className = "nav-profile";
      profile.setAttribute("aria-label", "My profile and settings");
      const avatar = document.createElement("img");
      avatar.width = avatar.height = 30;
      avatar.alt = "";
      const label = document.createElement("span");
      label.textContent = "Profile";
      const updateAvatar = () => {
        avatar.src = new URL(
          "profile-photo.php?v=" + user.avatar_version,
          homeUrl,
        ).href;
      };
      updateAvatar();
      document.addEventListener("profilechange", updateAvatar);
      profile.append(avatar, label);
      nav.append(profile);
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
