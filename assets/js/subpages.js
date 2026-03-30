(() => {
  const galleryItems = document.querySelectorAll("[data-gallery-image]");
  const lightbox = document.querySelector("[data-lightbox]");
  const lightboxImage = document.querySelector("[data-lightbox-image]");
  const lightboxClose = document.querySelector("[data-lightbox-close]");

  if (!galleryItems.length || !lightbox || !lightboxImage || !lightboxClose) {
    return;
  }

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  };

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const source = item.getAttribute("data-gallery-image");
      if (!source) return;
      lightboxImage.src = source;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
})();
