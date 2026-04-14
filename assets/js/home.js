(() => {
  document.documentElement.classList.add("js");

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

  const ctaSection = document.querySelector(".footer-cta");

  if (ctaSection) {
    const chars = ["*", ".", "+", "\u00B7", "\u00D7"];

    for (let i = 0; i < 15; i++) {
      const el = document.createElement("span");
      el.className = "cta-particle";
      el.textContent = chars[Math.floor(Math.random() * chars.length)];
      el.style.left = (50 + Math.random() * 48) + "%";
      el.style.top = (10 + Math.random() * 80) + "%";
      el.style.fontSize = (10 + Math.random() * 6) + "px";
      el.style.animationDuration = (4 + Math.random() * 2).toFixed(2) + "s";
      el.style.animationDelay = (Math.random() * 5).toFixed(2) + "s";
      ctaSection.appendChild(el);
    }
  }

  const ctaForStars = document.querySelector(".footer-cta");

  if (ctaForStars) {
    const starChars = ["\u2726", "*", "\u00B7", "+", "\u00D7"];

    for (let i = 0; i < 50; i++) {
      const el = document.createElement("span");
      el.className = "cta-star";
      el.textContent = starChars[Math.floor(Math.random() * starChars.length)];

      const left        = (1 + Math.random() * 97).toFixed(1);
      const size        = (14 + Math.random() * 12).toFixed(1);
      const fallDur     = (3  + Math.random() * 4).toFixed(2);
      const twinkleDur  = (1.5 + Math.random() * 2.5).toFixed(2);
      // Negative delay pre-seeds stars at random points in their fall cycle
      const fallDelay   = -(Math.random() * parseFloat(fallDur)).toFixed(2);
      const twinkDelay  = (Math.random() * 3).toFixed(2);

      el.style.left      = left + "%";
      el.style.top       = "-20px";
      el.style.fontSize  = size + "px";
      el.style.animation =
        `starFall ${fallDur}s linear ${fallDelay}s infinite, ` +
        `starTwinkle ${twinkleDur}s ease-in-out ${twinkDelay}s infinite`;

      ctaForStars.appendChild(el);
    }
  }
})();
