/* AUDIT-DK-2026 — Portfolio de Dhanoush Kessavane */
(function () {
  "use strict";

  /* ===== Thème (papier par défaut, mode nuit persisté) ===== */
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");

  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") {
    root.dataset.theme = saved;
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.dataset.theme = "dark";
  }

  themeToggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
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

  /* ===== Filtres des pièces à conviction ===== */
  const filterBar = document.getElementById("filterBar");
  const cards = document.querySelectorAll(".evidence");

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
