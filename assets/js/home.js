(() => {
  const typedElement = document.querySelector(".hero__typed");

  if (typedElement && typedElement.dataset.typedInitialized !== "true") {
    typedElement.dataset.typedInitialized = "true";

    const items = typedElement.dataset.typedItems
      .split(",")
      .map(item => item.trim());

    new Typed(".hero__typed", {
      strings: items,
      typeSpeed: 44,
      backSpeed: 24,
      backDelay: 1900,
      startDelay: 150,
      smartBackspace: false,
      loop: true,
      showCursor: false,
      fadeOut: false
    });
  }

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const nextState = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(nextState));
      navMenu.classList.toggle("is-open", nextState);
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.14 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }
})();
