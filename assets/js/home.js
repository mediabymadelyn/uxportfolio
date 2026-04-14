(() => {
  const typedElement = document.querySelector("[data-rotate]");

  if (typedElement && typedElement.dataset.rotateInitialized !== "true") {
    typedElement.dataset.rotateInitialized = "true";

    const items = (typedElement.dataset.rotateItems || "")
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    if (items.length > 1) {
      let index = 0;

      window.setInterval(() => {
        typedElement.classList.add("is-changing");

        window.setTimeout(() => {
          index = (index + 1) % items.length;
          typedElement.textContent = items[index];
          typedElement.classList.remove("is-changing");
        }, 260);
      }, 1800);
    }
  }

  const asciiCard = document.querySelector(".hero__ascii-card");

  if (asciiCard && asciiCard.dataset.animated !== "true") {
    asciiCard.dataset.animated = "true";

    const lines = (asciiCard.textContent || "").replace(/\r/g, "").split("\n");

    while (lines.length && !lines[0].trim()) {
      lines.shift();
    }
    const lineDelayMs = 40;

    asciiCard.textContent = "";

    lines.forEach((line, index) => {
      const span = document.createElement("span");
      span.className = "hero__ascii-line";
      span.style.animationDelay = `${index * lineDelayMs}ms`;
      span.textContent = line.length ? line : " ";
      asciiCard.appendChild(span);
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
