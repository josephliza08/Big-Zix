(() => {
  const profileForm = document.querySelector("#profile-form");
  const username = document.querySelector("#profile-username");
  const confirmation = document.querySelector("#username-confirmation");
  const picture = document.querySelector("#profile-picture");
  const photoInput = document.querySelector("#profile-photo");
  const savePhoto = document.querySelector("#save-photo");
  const cancelPhoto = document.querySelector("#cancel-photo");
  const removePhoto = document.querySelector("#remove-photo");
  const photoStatus = document.querySelector("#photo-status");
  const photoUrl = () =>
    "./profile-photo.php?v=" + BigZixAPI.user.avatar_version;
  let pendingPhoto = null;
  let previewUrl = null;
  let selection = 0;

  function resetPhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
    pendingPhoto = null;
    photoInput.value = "";
    savePhoto.hidden = cancelPhoto.hidden = true;
    picture.src = photoUrl();
  }

  username.addEventListener("input", () => {
    const changed =
      username.value.trim().toLowerCase() !== BigZixAPI.user.username;
    confirmation.hidden = !changed;
    document.querySelector("#profile-current-password").required = changed;
  });

  function connectForm(form, endpoint, statusId) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = form.querySelector("[type=submit]");
      if (button.disabled) return;
      const status = document.querySelector(statusId);
      button.disabled = true;
      status.textContent = "Saving…";
      try {
        const result = await BigZixAPI.request(
          endpoint,
          Object.fromEntries(new FormData(form)),
        );
        status.textContent = result.message;
        if (endpoint === "profile") {
          document.querySelector("#profile-heading").textContent =
            result.user.name;
          document.querySelector("#profile-handle").textContent =
            "@" + result.user.username;
          username.value = result.user.username;
          confirmation.hidden = true;
          document.querySelector("#profile-current-password").required = false;
        }
        for (const input of form.querySelectorAll("input[type=password]"))
          input.value = "";
      } catch (error) {
        status.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  }
  connectForm(profileForm, "profile", "#profile-status");
  connectForm(
    document.querySelector("#password-form"),
    "password",
    "#password-status",
  );

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    const currentSelection = ++selection;
    resetPhoto();
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      file.size > 10 * 1024 * 1024
    ) {
      photoStatus.textContent =
        "Choose a JPG, PNG or WebP image smaller than 10 MB.";
      return;
    }
    photoStatus.textContent = "Preparing preview…";
    try {
      const image = await createImageBitmap(file);
      // Resize and re-encode to remove metadata and keep uploads small.
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 384;
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff8ee";
      context.fillRect(0, 0, 384, 384);
      const side = Math.min(image.width, image.height);
      context.drawImage(
        image,
        (image.width - side) / 2,
        (image.height - side) / 2,
        side,
        side,
        0,
        0,
        384,
        384,
      );
      image.close();
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.88),
      );
      if (currentSelection !== selection) return;
      if (!blob) throw new Error("Please try another image.");
      pendingPhoto = blob;
      previewUrl = URL.createObjectURL(blob);
      picture.src = previewUrl;
      savePhoto.hidden = cancelPhoto.hidden = false;
      photoStatus.textContent =
        "Preview ready. Select Save picture to keep it.";
    } catch {
      photoStatus.textContent =
        "That image could not be opened. Please choose another.";
    }
  });

  cancelPhoto.addEventListener("click", () => {
    selection++;
    resetPhoto();
    photoStatus.textContent = "Picture change cancelled.";
  });

  async function photoAction(action) {
    photoInput.disabled =
      savePhoto.disabled =
      cancelPhoto.disabled =
      removePhoto.disabled =
        true;
    photoStatus.textContent = "Saving…";
    try {
      await action();
      resetPhoto();
      photoStatus.textContent = "Profile picture updated.";
    } catch (error) {
      photoStatus.textContent = error.message;
    } finally {
      photoInput.disabled =
        savePhoto.disabled =
        cancelPhoto.disabled =
        removePhoto.disabled =
          false;
    }
  }

  document.querySelector("#photo-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!pendingPhoto || savePhoto.disabled) return;
    const data = new FormData();
    data.append("photo", pendingPhoto, "profile.jpg");
    photoAction(() => BigZixAPI.uploadPhoto(data));
  });
  removePhoto.addEventListener("click", () => {
    selection++;
    photoAction(() => BigZixAPI.request("remove-photo", {}));
  });
})();
