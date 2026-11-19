/* Touch gestures reuse the existing slide buttons and their pause behavior. */
(() => {
  const hero = document.querySelector(".hero");
  let gesture = null;

  hero.addEventListener("pointerdown", (event) => {
    if (
      event.pointerType !== "touch" ||
      !event.isPrimary ||
      event.target.closest("a, button")
    ) {
      gesture = null;
      return;
    }

    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    hero.setPointerCapture(event.pointerId);
  });

  hero.addEventListener("pointerup", (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;

    // Short taps and vertical scrolling must not switch slides.
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const direction = dx < 0 ? 1 : -1;
    hero.querySelector(`[data-slide="${direction}"]`).click();
  });

  for (const name of ["pointercancel", "lostpointercapture"]) {
    hero.addEventListener(name, (event) => {
      // A child releases capture when the banner takes over the gesture.
      if (name === "lostpointercapture" && event.target !== hero) return;
      if (!gesture || event.pointerId !== gesture.id) return;
      gesture = null;
    });
  }
})();
