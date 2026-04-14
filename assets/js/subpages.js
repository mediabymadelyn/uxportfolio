(() => {
  const marquee = document.querySelector("[data-art-marquee]");
  const track = document.querySelector("[data-art-track]");

  if (!marquee || !track) {
    return;
  }

  const originalItems = Array.from(track.querySelectorAll(".art-marquee__item:not([data-clone])"));

  if (!originalItems.length) {
    return;
  }

  const cloneItems = originalItems.map((item) => {
    const clone = item.cloneNode(true);
    clone.dataset.clone = "true";
    clone.setAttribute("aria-hidden", "true");
    clone.tabIndex = -1;
    clone.disabled = true;
    return clone;
  });

  cloneItems.forEach((clone) => track.appendChild(clone));

  let selectedItem = null;

  const clearSelection = () => {
    if (selectedItem) {
      selectedItem.classList.remove("is-selected");
      selectedItem = null;
    }

    marquee.classList.remove("is-paused");
    document.body.classList.remove("art-gallery-paused");
  };

  const selectItem = (item) => {
    if (selectedItem === item) {
      clearSelection();
      return;
    }

    clearSelection();
    selectedItem = item;
    item.classList.add("is-selected");
    marquee.classList.add("is-paused");
    document.body.classList.add("art-gallery-paused");
    item.focus({ preventScroll: true });
  };

  originalItems.forEach((item) => {
    item.addEventListener("click", () => selectItem(item));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      clearSelection();
    }
  });
})();
