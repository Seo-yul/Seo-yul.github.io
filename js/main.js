/* ============================================
   Yoon Seoyul — Portfolio
   Scroll animations, navigation, hamburger menu
   ============================================ */

(function () {
  "use strict";

  // ---- Reveal on scroll (IntersectionObserver) ----
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    // If reduced motion, show everything immediately
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-visible");
    });
  }

  // ---- Active nav link tracking ----
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__link");

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop - 80;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove("is-active");
          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("is-active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink();

  // ---- Hamburger menu toggle ----
  const hamburger = document.getElementById("hamburger");
  const navLinksEl = document.getElementById("nav-links");

  if (hamburger && navLinksEl) {
    hamburger.addEventListener("click", () => {
      const isOpen = navLinksEl.classList.toggle("is-open");
      hamburger.classList.toggle("is-active");
      hamburger.setAttribute("aria-expanded", isOpen);
    });

    // Close menu when a link is clicked
    navLinksEl.querySelectorAll(".nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        navLinksEl.classList.remove("is-open");
        hamburger.classList.remove("is-active");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });

    // Close menu on outside click
    document.addEventListener("click", (e) => {
      if (
        navLinksEl.classList.contains("is-open") &&
        !navLinksEl.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        navLinksEl.classList.remove("is-open");
        hamburger.classList.remove("is-active");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  }
})();
