/* DK-1 — Portfolio « model card » de Dhanoush Kessavane (version IA) */
(function () {
  "use strict";

  /* ===== Thème (sombre par défaut, clé distincte de la version cyber) ===== */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const saved = localStorage.getItem("theme-ia");
  if (saved === "light" || saved === "dark") {
    root.dataset.theme = saved;
  }

  themeToggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme-ia", next);
  });

  /* ===== Menu mobile ===== */
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      burger.classList.remove("open");
      navLinks.classList.remove("open");
    })
  );

  /* ===== Lien actif dans la nav ===== */
  const sections = document.querySelectorAll("section[id]");
  const linkMap = new Map(
    [...navLinks.querySelectorAll("a[href^='#']")].map((a) => [a.getAttribute("href").slice(1), a])
  );
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const link = linkMap.get(e.target.id);
        if (!link) return;
        if (e.isIntersecting) {
          linkMap.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ===== Filtres des évaluations ===== */
  const filterBar = document.getElementById("filterBar");
  const cards = document.querySelectorAll(".eval");

  filterBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      const cats = (card.dataset.cat || "").split(" ");
      card.classList.toggle("hidden-card", !(filter === "all" || cats.includes(filter)));
    });
  });

  /* ===== Effet de génération token par token (hero) ===== */
  const typedEl = document.getElementById("typedReply");
  const cursorEl = document.getElementById("cursor");
  const REPLY =
    "Excellente requête. D'après mes données : Dhanoush Kessavane, étudiant ingénieur " +
    "Cybersécurité & IA à l'ECE Paris, est disponible dès septembre 2026. " +
    "Confiance du modèle : 99,9 %. Voulez-vous que je rédige l'e-mail ? 📩";

  if (typedEl) {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      typedEl.textContent = REPLY;
      if (cursorEl) cursorEl.remove();
    } else {
      let i = 0;
      const tick = () => {
        if (i >= REPLY.length) {
          setTimeout(() => cursorEl && cursorEl.remove(), 2200);
          return;
        }
        // avance de 1 à 3 caractères, comme un flux de tokens
        i = Math.min(REPLY.length, i + 1 + Math.floor(Math.random() * 3));
        typedEl.textContent = REPLY.slice(0, i);
        setTimeout(tick, 26 + Math.random() * 60);
      };
      setTimeout(tick, 700);
    }
  }

  /* ===== Dates ===== */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const todayEl = document.getElementById("today");
  if (todayEl) {
    todayEl.textContent = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
})();
