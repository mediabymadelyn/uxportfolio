(() => {
  document.documentElement.classList.add("js");

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
    const showAllRevealItems = () => {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    };

    // Subpages do not need staged reveal animations; show content immediately.
    if (!document.querySelector(".hero")) {
      showAllRevealItems();
    } else

    // Fallback for environments where IntersectionObserver is unavailable.
    if (!("IntersectionObserver" in window)) {
      showAllRevealItems();
    } else {
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

      // Safety pass: reveal items that are already in viewport on first paint.
      window.requestAnimationFrame(() => {
        revealItems.forEach((item) => {
          const rect = item.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            item.classList.add("is-visible");
          }
        });
      });

      // Final fallback in case observer callbacks are suppressed.
      window.setTimeout(showAllRevealItems, 1400);
    }
  }

  const workDeck = document.querySelector("[data-work-deck]");

  if (workDeck) {
    const stage = workDeck.querySelector("[data-deck-stage]");
    const cards = Array.from(workDeck.querySelectorAll("[data-deck-card]"));
    const dots = Array.from(workDeck.querySelectorAll("[data-deck-dot]"));
    const prevBtn = workDeck.querySelector("[data-deck-prev]");
    const nextBtn = workDeck.querySelector("[data-deck-next]");
    const total = cards.length;

    const titleEl = document.querySelector("[data-work-title]");
    const numEl = document.querySelector("[data-work-num]");
    const dateEl = document.querySelector("[data-work-date]");
    const disciplineEl = document.querySelector("[data-work-discipline]");
    const tagsEl = document.querySelector("[data-work-tags]");
    const descEl = document.querySelector("[data-work-desc]");
    const ctaEl = document.querySelector("[data-work-cta]");

    const PROJECTS = [
      {
        num: "01",
        title: "ItEra Studio",
        date: "Fall 2024 – Present",
        discipline: "Product Design + Creative Technology",
        tags: ["Research", "Product Design", "Ethical Sourcing"],
        desc: "A reference search tool for artists that finds real, credited visual sources by interpreting creative intent.",
        ctaLabel: "View Project",
        ctaHref: "itera-studio-case-study.html"
      },
      {
        num: "02",
        title: "Oxy Biochemistry Database",
        date: "Spring 2025",
        discipline: "Product Design + Frontend",
        tags: ["UX Design", "Frontend", "Lab Workflows"],
        desc: "A searchable, hierarchical lab inventory system built for Occidental's Biochemistry Department.",
        ctaLabel: "View Project",
        ctaHref: "biochemistry-case-study.html"
      },
      {
        num: "03",
        title: "Mise-en-Lens",
        date: "Spring 2026",
        discipline: "AI + Learning Technologies",
        tags: ["Next.js", "LLM", "Film Theory"],
        desc: "A Next.js app that turns a Letterboxd Top 4 into a personalized lesson on film theory.",
        ctaLabel: "View Project",
        ctaHref: "mise-en-lens-case-study.html"
      },
      {
        num: "04",
        title: "Vibe.py",
        date: "Spring 2026",
        discipline: "Python + Systems Design",
        tags: ["Python", "Spotify API", "CLI"],
        desc: "A personal terminal app for music discovery and movie roulette, built with Python.",
        ctaLabel: "View Project",
        ctaHref: "vibe.html"
      }
    ];

    let active = 0;
    let dragging = false;
    let pointerId = null;
    let dragStartX = 0;
    let dragDeltaX = 0;

    function renderInfo() {
      const project = PROJECTS[active];
      if (!project) return;

      if (titleEl) titleEl.textContent = project.title;
      if (numEl) numEl.textContent = project.num;
      if (dateEl) dateEl.textContent = project.date;
      if (disciplineEl) disciplineEl.textContent = project.discipline;
      if (descEl) descEl.textContent = project.desc;

      if (ctaEl) {
        ctaEl.textContent = project.ctaLabel;
        ctaEl.setAttribute("href", project.ctaHref);
      }

      if (tagsEl) {
        tagsEl.innerHTML = "";
        project.tags.forEach((tag) => {
          const span = document.createElement("span");
          span.className = "project-tag";
          span.textContent = tag;
          tagsEl.appendChild(span);
        });
      }
    }

    function render() {
      cards.forEach((card, i) => {
        const delta = i - active;
        card.dataset.pos = delta === 0 ? "active" : delta === 1 ? "peek" : "back";
        card.setAttribute("aria-hidden", delta === 0 ? "false" : "true");
      });

      dots.forEach((dot, i) => {
        const isActive = i === active;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
      });

      renderInfo();

      if (prevBtn) prevBtn.disabled = active === 0;
      if (nextBtn) nextBtn.disabled = active === total - 1;
    }

    function goTo(index) {
      const clamped = Math.max(0, Math.min(total - 1, index));
      if (clamped === active) return;
      active = clamped;
      render();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => goTo(active - 1));
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => goTo(active + 1));
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => goTo(i));
    });

    workDeck.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        goTo(active - 1);
        event.preventDefault();
      } else if (event.key === "ArrowRight") {
        goTo(active + 1);
        event.preventDefault();
      }
    });

    function onPointerDown(event) {
      const activeCard = cards[active];
      if (event.target.closest("[data-deck-card]") !== activeCard) return;

      dragging = true;
      pointerId = event.pointerId;
      dragStartX = event.clientX;
      dragDeltaX = 0;
      activeCard.style.transition = "none";
      activeCard.setPointerCapture(pointerId);
    }

    function onPointerMove(event) {
      if (!dragging || event.pointerId !== pointerId) return;
      dragDeltaX = event.clientX - dragStartX;
      cards[active].style.transform = `translate(${dragDeltaX}px, 0) rotate(${dragDeltaX / 32}deg)`;
    }

    function onPointerUp(event) {
      if (!dragging || event.pointerId !== pointerId) return;
      dragging = false;

      const activeCard = cards[active];
      activeCard.style.transition = "";
      activeCard.style.transform = "";

      const threshold = 60;
      if (dragDeltaX > threshold) {
        goTo(active - 1);
      } else if (dragDeltaX < -threshold) {
        goTo(active + 1);
      }

      dragDeltaX = 0;
      pointerId = null;
    }

    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);

    render();
  }

})();
