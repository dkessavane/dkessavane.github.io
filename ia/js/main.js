/* dhanoush_kessavane.ipynb — Portfolio « notebook Jupyter » de Dhanoush Kessavane */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* ===== Sommaire mobile ===== */
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

  /* ===== Lien actif dans le sommaire ===== */
  const sections = document.querySelectorAll(".cell[id]");
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
    { rootMargin: "-30% 0px -55% 0px" }
  );
  sections.forEach((s) => sectionObserver.observe(s));

  /* ===== Filtres des projets (widget ToggleButtons) ===== */
  const filterBar = document.getElementById("filterBar");
  const cards = document.querySelectorAll(".proj");

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

  /* ===== Indicateur de kernel ===== */
  const kernelDot = document.getElementById("kernelDot");
  const kernelState = document.getElementById("kernelState");
  let busyCount = 0;
  function kernelBusy() {
    busyCount++;
    kernelDot.classList.add("busy");
    kernelState.textContent = "busy";
  }
  function kernelIdle() {
    busyCount = Math.max(0, busyCount - 1);
    if (busyCount === 0) {
      kernelDot.classList.remove("busy");
      kernelState.textContent = "idle";
    }
  }

  /* ===== Exécution des cellules au scroll : In [*] → In [n] ===== */
  const codeCells = document.querySelectorAll(".cell-code");
  const tqdmFill = document.getElementById("tqdmFill");

  function animateLoadCell(cell, done) {
    const lines = cell.querySelectorAll(".load-line");
    cell.classList.add("loading");
    if (tqdmFill) tqdmFill.style.width = "0";
    let i = 0;
    const next = () => {
      if (i >= lines.length) {
        cell.classList.remove("loading");
        done();
        return;
      }
      const line = lines[i++];
      line.classList.add("show");
      // la ligne tqdm se remplit avant de passer à la suite
      if (line.querySelector(".tqdm-fill")) {
        requestAnimationFrame(() => { tqdmFill.style.width = "100%"; });
        setTimeout(next, 1500);
      } else {
        setTimeout(next, 170);
      }
    };
    next();
  }

  function runCell(cell) {
    const counts = cell.querySelectorAll(".exec-count");
    const n = cell.dataset.exec;
    kernelBusy();
    counts.forEach((c) => (c.textContent = "*"));
    setTimeout(() => {
      counts.forEach((c) => (c.textContent = n));
      cell.classList.remove("pending");
      cell.classList.add("ran");
      if (cell.id === "load") {
        animateLoadCell(cell, kernelIdle);
      } else {
        kernelIdle();
      }
    }, 320 + Math.random() * 380);
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    codeCells.forEach((c) => c.classList.add("pending"));
    if (tqdmFill) tqdmFill.style.width = "0";
    const runObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          runObserver.unobserve(e.target);
          runCell(e.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    codeCells.forEach((c) => runObserver.observe(c));
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
