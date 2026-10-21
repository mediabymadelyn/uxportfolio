(() => {
  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme toggle. An inline script in each page's <head> applies a saved
  // choice before first paint; with no saved choice the system setting wins.
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const effectiveTheme = () =>
    document.documentElement.dataset.theme || (darkQuery.matches ? "dark" : "light");

  const syncThemeToggle = () => {
    if (!themeToggle) return;
    const isDark = effectiveTheme() === "dark";
    const icon = themeToggle.querySelector("span");
    if (icon) icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = effectiveTheme() === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        // Storage can be blocked; the choice still applies for this page.
      }
      syncThemeToggle();
    });

    darkQuery.addEventListener("change", syncThemeToggle);
    syncThemeToggle();
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

    // Interactive portrait: the characters are redrawn on a canvas behind the
    // hero text. Moving the cursor near them pushes them away (they spring
    // back), and clicking the portrait explodes it before it reassembles.
    // The <pre> stays in place, transparent, for layout and screen readers.
    const hero = document.querySelector(".hero");
    const canvas = document.createElement("canvas");

    if (hero && !reduceMotion && canvas.getContext) {
      const ctx = canvas.getContext("2d");
      canvas.className = "hero__canvas";
      canvas.setAttribute("aria-hidden", "true");
      hero.appendChild(canvas);
      asciiCard.classList.add("is-canvas");

      const REPEL_RADIUS = 90;
      const REPEL_FORCE = 5;
      const SPRING = 0.06;
      const DAMPING = 0.82;
      const LINE_DELAY = 40;
      const LINE_FADE = 260;
      const EXPLODE_HOLD = 1100;

      let chars = [];
      let dpr = 1;
      let font = "";
      let pointer = null;
      let explodedAt = 0;
      let running = false;
      const start = performance.now();

      const parseHex = (hex) => {
        const h = hex.trim().replace("#", "");
        const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
        const n = parseInt(full, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      };

      // Eight color steps from ink to accent, rebuilt when the theme changes.
      let palette = [];
      let paletteKey = "";
      const syncPalette = () => {
        const styles = getComputedStyle(document.documentElement);
        const ink = styles.getPropertyValue("--ink");
        const accent = styles.getPropertyValue("--accent");
        if (ink + accent === paletteKey) return;
        paletteKey = ink + accent;
        const from = parseHex(ink);
        const to = parseHex(accent);
        palette = Array.from({ length: 8 }, (_, i) => {
          const t = i / 7;
          const c = from.map((v, j) => Math.round(v + (to[j] - v) * t));
          return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        });
      };

      // Map each visible character to its resting spot over the <pre>.
      const layout = () => {
        const heroRect = hero.getBoundingClientRect();
        const preRect = asciiCard.getBoundingClientRect();
        const fontSize = parseFloat(getComputedStyle(asciiCard).fontSize);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(heroRect.width * dpr);
        canvas.height = Math.round(heroRect.height * dpr);
        canvas.style.width = `${heroRect.width}px`;
        canvas.style.height = `${heroRect.height}px`;
        font = `${fontSize}px monospace`;
        ctx.font = font;
        const charWidth = ctx.measureText("M").width;
        const originX = preRect.left - heroRect.left;
        const originY = preRect.top - heroRect.top;

        const previous = chars;
        chars = [];
        Array.from(asciiCard.children).forEach((line, row) => {
          const text = line.textContent;
          for (let col = 0; col < text.length; col += 1) {
            const glyph = text[col];
            if (glyph === " ") continue;
            const hx = originX + col * charWidth;
            const hy = originY + row * fontSize;
            // Same bottom fade the CSS mask gives the text portrait.
            let alpha = 1;
            const fy = (row * fontSize) / preRect.height;
            if (fy > 0.72) alpha *= Math.max(0, 1 - (fy - 0.72) / 0.28);
            if (alpha <= 0.02) continue;
            chars.push({ glyph, row, hx, hy, x: hx, y: hy, vx: 0, vy: 0, alpha });
          }
        });
        // Keep motion continuous if a resize happens mid-animation.
        if (previous.length === chars.length) {
          chars.forEach((c, i) => {
            c.x = previous[i].x + (c.hx - previous[i].hx);
            c.y = previous[i].y + (c.hy - previous[i].hy);
            c.vx = previous[i].vx;
            c.vy = previous[i].vy;
          });
        }
      };

      const draw = (now) => {
        syncPalette();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = font;
        ctx.textBaseline = "top";
        const elapsed = now - start;

        for (const c of chars) {
          // Line-by-line fade in on load.
          const appear = Math.min(1, Math.max(0, (elapsed - c.row * LINE_DELAY) / LINE_FADE));
          if (appear <= 0) continue;

          // Tint toward the accent near the cursor and while flying.
          let tint = Math.min(1, Math.hypot(c.vx, c.vy) / 6);
          if (pointer) {
            const d = Math.hypot(c.hx - pointer.x, c.hy - pointer.y);
            tint = Math.max(tint, 1 - d / (REPEL_RADIUS * 1.6));
          }
          ctx.globalAlpha = c.alpha * appear;
          ctx.fillStyle = palette[Math.max(0, Math.min(7, Math.round(tint * 7)))];
          ctx.fillText(c.glyph, c.x, c.y + (1 - appear) * 4);
        }
        ctx.globalAlpha = 1;
      };

      const step = (now) => {
        const sinceExplode = now - explodedAt;
        const exploding = explodedAt && sinceExplode < EXPLODE_HOLD;
        // After an explosion the spring eases back in so pieces glide home.
        const spring = exploding ? 0 : explodedAt && sinceExplode < EXPLODE_HOLD + 900
          ? SPRING * Math.min(1, (sinceExplode - EXPLODE_HOLD) / 900 + 0.15)
          : SPRING;
        let moving = false;

        for (const c of chars) {
          if (pointer && !exploding) {
            const dx = c.x - pointer.x;
            const dy = c.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < REPEL_RADIUS && d > 0.01) {
              const force = (1 - d / REPEL_RADIUS) * REPEL_FORCE;
              c.vx += (dx / d) * force;
              c.vy += (dy / d) * force;
            }
          }
          if (exploding) c.vy += 0.35;
          c.vx += (c.hx - c.x) * spring;
          c.vy += (c.hy - c.y) * spring;
          c.vx *= exploding ? 0.97 : DAMPING;
          c.vy *= exploding ? 0.97 : DAMPING;
          c.x += c.vx;
          c.y += c.vy;
          if (Math.abs(c.vx) + Math.abs(c.vy) > 0.05 || Math.abs(c.x - c.hx) + Math.abs(c.y - c.hy) > 0.3) {
            moving = true;
          }
        }

        const loading = now - start < asciiCard.children.length * LINE_DELAY + LINE_FADE;
        draw(now);

        if (moving || pointer || exploding || loading) {
          requestAnimationFrame(step);
        } else {
          chars.forEach((c) => {
            c.x = c.hx;
            c.y = c.hy;
            c.vx = 0;
            c.vy = 0;
          });
          explodedAt = 0;
          draw(now);
          running = false;
        }
      };

      const wake = () => {
        if (running) return;
        running = true;
        requestAnimationFrame(step);
      };

      const toLocal = (event) => {
        const rect = hero.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      };

      hero.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        pointer = toLocal(event);
        wake();
      });

      hero.addEventListener("pointerleave", () => {
        pointer = null;
        wake();
      });

      asciiCard.addEventListener("click", (event) => {
        const origin = toLocal(event);
        chars.forEach((c) => {
          const dx = c.x - origin.x;
          const dy = c.y - origin.y;
          const d = Math.hypot(dx, dy) || 1;
          const speed = 9 + Math.random() * 16;
          c.vx = (dx / d) * speed + (Math.random() - 0.5) * 6;
          c.vy = (dy / d) * speed - 4 - Math.random() * 6;
        });
        explodedAt = performance.now();
        pointer = null;
        wake();
      });

      let resizeTimer = 0;
      const relayout = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          layout();
          wake();
        }, 80);
      };

      if ("ResizeObserver" in window) {
        new ResizeObserver(relayout).observe(hero);
      } else {
        window.addEventListener("resize", relayout);
      }

      // Redraw when the theme changes so the ink color updates.
      new MutationObserver(wake).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", wake);

      layout();
      wake();
    }
  }

  // The home header is transparent over the hero and turns solid on scroll.
  const siteHeader = document.querySelector(".site-header");

  if (siteHeader && document.body.classList.contains("home")) {
    const syncHeader = () => siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", syncHeader, { passive: true });
    syncHeader();
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

  // Count-up numbers: <span data-count="75" data-suffix="%">75%</span>.
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const format = (value) => `${value.toFixed(decimals)}${suffix}`;

    if (reduceMotion || Number.isNaN(target)) {
      el.textContent = format(target);
      return;
    }

    const duration = 900;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(target * eased);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  // Scroll-triggered pieces: timelines draw in, stats count up.
  const animated = document.querySelectorAll("[data-animate], [data-count]");

  if (animated.length) {
    if (!("IntersectionObserver" in window)) {
      animated.forEach((el) => {
        el.classList.add("is-visible");
        if (el.dataset.count) runCount(el);
      });
    } else {
      const animateObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            if (entry.target.dataset.count) runCount(entry.target);
            animateObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.35 }
      );

      animated.forEach((el) => {
        // Start counters at zero so they don't flash the final value first.
        if (el.dataset.count && !reduceMotion) {
          const decimals = parseInt(el.dataset.decimals || "0", 10);
          el.textContent = `${(0).toFixed(decimals)}${el.dataset.suffix || ""}`;
        }
        animateObserver.observe(el);
      });
    }
  }

  // Case studies: a sticky process timeline. Each stop links to a section
  // (labelled by data-step / data-when, or its heading), and the line fills
  // as the reader moves from one section to the next.
  const caseStudy = document.querySelector("[data-case-study]");

  if (caseStudy) {
    const steps = Array.from(caseStudy.querySelectorAll(":scope > .content-shell")).filter((shell) =>
      shell.querySelector("h2")
    );

    if (steps.length > 1) {
      const process = document.createElement("nav");
      process.className = "process";
      process.setAttribute("aria-label", "Project process");

      const container = document.createElement("div");
      container.className = "container";
      const scroller = document.createElement("div");
      scroller.className = "process__scroller";
      const track = document.createElement("ol");
      track.className = "process__track";
      track.style.setProperty("--n", String(steps.length));

      const items = steps.map((shell) => {
        const heading = shell.querySelector("h2");
        if (!shell.id) {
          shell.id = heading.textContent
            .toLowerCase()
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        }

        const item = document.createElement("li");
        item.className = "process__step";
        const link = document.createElement("a");
        link.href = `#${shell.id}`;

        const dot = document.createElement("span");
        dot.className = "process__dot";
        dot.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.textContent = shell.dataset.step || heading.textContent;
        link.append(dot, label);

        if (shell.dataset.when) {
          const when = document.createElement("span");
          when.className = "process__when";
          when.textContent = shell.dataset.when;
          label.appendChild(when);
        }

        item.appendChild(link);
        track.appendChild(item);
        return item;
      });

      scroller.appendChild(track);
      container.appendChild(scroller);
      process.appendChild(container);
      caseStudy.parentElement.insertBefore(process, caseStudy);

      let current = -1;
      let frame = 0;

      const update = () => {
        // Measure from just below the sticky header and process bar.
        const line = window.innerHeight * 0.3;
        const tops = steps.map((shell) => shell.getBoundingClientRect().top - line);
        let index = 0;
        tops.forEach((top, i) => {
          if (top <= 0) index = i;
        });

        let fraction = 0;
        if (index < steps.length - 1 && tops[index] <= 0) {
          fraction = Math.min(1, -tops[index] / (tops[index + 1] - tops[index]));
        }

        const fill = Math.max(0, Math.min(1, (index + fraction) / (steps.length - 1)));
        track.style.setProperty("--fill", fill.toFixed(4));

        if (index !== current) {
          current = index;
          items.forEach((item, i) => {
            item.classList.toggle("is-done", i < index);
            item.classList.toggle("is-current", i === index);
            const link = item.querySelector("a");
            if (i === index) {
              link.setAttribute("aria-current", "step");
            } else {
              link.removeAttribute("aria-current");
            }
          });

          // On narrow screens, keep the current stop in view.
          if (scroller.scrollWidth > scroller.clientWidth) {
            const item = items[index];
            scroller.scrollTo({
              left: item.offsetLeft - scroller.clientWidth / 2 + item.offsetWidth / 2,
              behavior: reduceMotion ? "auto" : "smooth"
            });
          }
        }
      };

      window.addEventListener(
        "scroll",
        () => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(update);
        },
        { passive: true }
      );
      window.addEventListener("resize", update);
      update();
    }
  }

})();
