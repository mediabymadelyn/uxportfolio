(() => {
  const typedTarget = document.querySelector("[data-typed]");

  if (typedTarget) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const typedItems = (typedTarget.dataset.typedItems || "")
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean);

    if (typedItems.length) {
      if (reducedMotion) {
        typedTarget.textContent = typedItems[0];
      } else {
        const typingSpeed = 60;
        const deletingSpeed = 34;
        const holdDelay = 1700;
        const startDelay = 720;
        const betweenDelay = 280;

        let itemIndex = 0;
        let charIndex = 0;
        let deleting = false;

        const step = () => {
          const current = typedItems[itemIndex];

          if (!deleting) {
            charIndex = Math.min(charIndex + 1, current.length);
            typedTarget.textContent = current.slice(0, charIndex);

            if (charIndex === current.length) {
              deleting = true;
              window.setTimeout(step, holdDelay);
              return;
            }

            window.setTimeout(step, typingSpeed);
            return;
          }

          charIndex = Math.max(charIndex - 1, 0);
          typedTarget.textContent = current.slice(0, charIndex);

          if (charIndex === 0) {
            deleting = false;
            itemIndex = (itemIndex + 1) % typedItems.length;
            window.setTimeout(step, betweenDelay);
            return;
          }

          window.setTimeout(step, deletingSpeed);
        };

        window.setTimeout(step, startDelay);
      }
    }
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
