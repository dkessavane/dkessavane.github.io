/* DK-1 — Interface de recrutement conversationnelle (version IA du portfolio) */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const chat = document.getElementById("chat");
  const boot = document.getElementById("boot");
  const chips = document.getElementById("chips");
  const form = document.getElementById("composerForm");
  const input = document.getElementById("composerInput");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sideOverlay");
  const burger = document.getElementById("burger");
  const sideNav = document.getElementById("sideNav");

  /* ===== Sujets de conversation ===== */
  const TOPICS = {
    profil: {
      user: "Qui est Dhanoush ?",
      reply: "Cible identifiée. Voici les données extraites de mes archives :",
      tpl: "tpl-profil",
      keys: ["qui", "profil", "presente", "present", "c est quoi", "dhanoush", "kessavane", "cible"],
    },
    dispo: {
      user: "Est-il disponible ?",
      reply: "Analyse du planning en cours… Mon système remonte une anomalie critique :",
      tpl: "tpl-alerte",
      keys: ["dispo", "alternance", "libre", "quand", "septembre", "2026", "anomalie", "dk-001", "recrut"],
    },
    experience: {
      user: "Quelle est son expérience ?",
      reply: "Deux opérations retrouvées dans les archives. Extraction en cours :",
      tpl: "tpl-experience",
      keys: ["experience", "parcours", "entreprise", "travail", "ntt", "fnac", "stage", "poste", "job"],
    },
    projets: {
      user: "Montre-moi ses projets.",
      reply: "Extraction des pièces à conviction… 6 éléments récupérés, dont un chatbot RAG déployé en production. Filtrez par domaine si besoin :",
      tpl: "tpl-projets",
      keys: ["projet", "realisation", "portfolio", "demo", "chatbot", "rag", "faceprediction", "github", "code"],
    },
    competences: {
      user: "Scanne ses compétences.",
      reply: "Lancement du scan des capacités sur 4 périmètres… résultats en temps réel :",
      tpl: "tpl-scan",
      keys: ["competence", "skill", "sait faire", "stack", "techno", "langage", "scan", "python", "docker", "devops", "cyber", "ia", "cloud"],
    },
    formation: {
      user: "Quelle est sa formation ?",
      reply: "Historique de formation reconstitué depuis 2023 :",
      tpl: "tpl-formation",
      keys: ["formation", "etude", "ecole", "diplome", "ece", "but", "iut", "bac", "cursus"],
    },
    contact: {
      user: "Comment le contacter ?",
      reply: "Ouverture du canal de communication… liaison directe établie :",
      tpl: "tpl-contact",
      keys: ["contact", "email", "mail", "joindre", "linkedin", "cv", "entretien", "rdv", "rendez-vous", "embauche", "telephone"],
    },
    salaire: {
      user: "Quelles sont ses prétentions salariales ?",
      reply: "Donnée classifiée : ██████ € — chiffrement fort, se déchiffre uniquement en entretien. Mes capteurs indiquent toutefois une forte compatibilité avec la grille « alternance + bonne ambiance d'équipe ».",
      tpl: null,
      keys: ["salaire", "pretention", "paye", "remuneration", "combien", "prix", "tarif"],
    },
  };

  const EXTRAS = [
    { keys: ["bonjour", "salut", "hello", "coucou", "bonsoir", "hey"], reply: "Bonjour 👋 Ravi de vous détecter sur ce canal. Posez-moi n'importe quelle question sur Dhanoush — ou utilisez les boutons ci-dessous." },
    { keys: ["merci", "top", "super", "parfait", "genial", "bravo"], reply: "Avec plaisir. Mes circuits rougissent. Prochaine étape logique : le contacter — latence constatée < 24 h." },
    { keys: ["defaut", "faiblesse", "point faible"], reply: "Un seul défaut détecté dans mes logs : aucun contrat d'alternance après septembre 2026. C'est précisément la raison de ma mise en service." },
  ];

  const FALLBACK =
    "Requête non reconnue par mes circuits (je ne suis qu'un agent spécialisé). Essayez « ses projets », « scanner ses compétences », « le contacter »… ou les boutons ci-dessous.";

  /* ===== Utilitaires ===== */
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function nearBottom() {
    return window.innerHeight + window.scrollY > document.body.scrollHeight - 260;
  }
  function follow(force) {
    if (force || nearBottom()) window.scrollTo(0, document.body.scrollHeight);
  }

  function addUserMsg(text) {
    const div = document.createElement("div");
    div.className = "msg msg-user";
    const b = document.createElement("div");
    b.className = "bubble";
    b.textContent = text;
    div.appendChild(b);
    chat.appendChild(div);
    follow(true);
  }

  function makeAiMsg(id) {
    const div = document.createElement("div");
    div.className = "msg msg-ai";
    if (id) div.id = id;
    div.innerHTML =
      '<div class="avatar" aria-hidden="true">◆</div>' +
      '<div class="bubble"><span class="role">DK-1 · agent de recrutement</span></div>';
    chat.appendChild(div);
    return div.querySelector(".bubble");
  }

  function streamText(p, text) {
    return new Promise((res) => {
      if (reduce) {
        p.textContent = text;
        res();
        return;
      }
      p.classList.add("streaming");
      let i = 0;
      (function tick() {
        i = Math.min(text.length, i + 1 + Math.floor(Math.random() * 3));
        p.textContent = text.slice(0, i);
        follow();
        if (i < text.length) setTimeout(tick, 14 + Math.random() * 30);
        else {
          p.classList.remove("streaming");
          res();
        }
      })();
    });
  }

  function showTyping(bubble) {
    const t = document.createElement("span");
    t.className = "typing";
    t.innerHTML = "<i></i><i></i><i></i>";
    bubble.appendChild(t);
    follow();
    return t;
  }

  function attachPanel(bubble, tplId) {
    const tpl = document.getElementById(tplId);
    if (!tpl) return;
    const wrap = document.createElement("div");
    wrap.className = "rich";
    wrap.appendChild(tpl.content.cloneNode(true));
    bubble.appendChild(wrap);
    wireFilters(wrap);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrap.classList.add("on");
        follow();
      });
    });
  }

  /* File d'attente : une réponse à la fois */
  let queue = Promise.resolve();
  function enqueue(fn) {
    queue = queue.then(fn).catch(() => {});
  }

  function respond({ reply, tpl, id, userText }) {
    enqueue(async () => {
      if (userText) {
        addUserMsg(userText);
        await new Promise((r) => setTimeout(r, reduce ? 0 : 240));
      }
      const bubble = makeAiMsg(id);
      const typing = showTyping(bubble);
      await new Promise((r) => setTimeout(r, reduce ? 0 : 450 + Math.random() * 450));
      typing.remove();
      const p = document.createElement("p");
      bubble.appendChild(p);
      await streamText(p, reply);
      if (tpl) attachPanel(bubble, tpl);
      await new Promise((r) => setTimeout(r, reduce ? 0 : 250));
      follow();
    });
  }

  const asked = new Set();

  function ask(topicId, { echoUser = true } = {}) {
    const t = TOPICS[topicId];
    if (!t) return;
    if (asked.has(topicId)) {
      const el = document.getElementById("msg-" + topicId);
      if (el) {
        el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        return;
      }
    }
    asked.add(topicId);
    markDone(topicId);
    respond({ reply: t.reply, tpl: t.tpl, id: "msg-" + topicId, userText: echoUser ? t.user : null });
  }

  function markDone(topicId) {
    chips.querySelectorAll("button[data-topic='" + topicId + "']").forEach((b) => b.classList.add("done"));
  }

  /* ===== Routage des questions tapées ===== */
  function route(raw) {
    const q = norm(raw);
    for (const [id, t] of Object.entries(TOPICS)) {
      if (t.keys.some((k) => q.includes(k))) {
        if (asked.has(id)) {
          asked.delete(id); // question retapée : on rejoue la réponse
          const old = document.getElementById("msg-" + id);
          if (old) old.removeAttribute("id");
        }
        asked.add(id);
        markDone(id);
        respond({ reply: t.reply, tpl: t.tpl, id: "msg-" + id, userText: raw });
        return;
      }
    }
    for (const ex of EXTRAS) {
      if (ex.keys.some((k) => q.includes(k))) {
        respond({ reply: ex.reply, userText: raw });
        return;
      }
    }
    respond({ reply: FALLBACK, userText: raw });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = input.value.trim();
    if (!v) return;
    input.value = "";
    route(v);
  });

  chips.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-topic]");
    if (btn) ask(btn.dataset.topic);
  });

  /* ===== Sidebar ===== */
  function closeSide() {
    sidebar.classList.remove("open");
    overlay.classList.remove("on");
    burger.classList.remove("open");
  }
  burger.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("on");
    burger.classList.toggle("open");
  });
  overlay.addEventListener("click", closeSide);

  sideNav.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    closeSide();
    if (btn.dataset.run === "all") {
      askAll();
    } else if (btn.dataset.topic) {
      ask(btn.dataset.topic);
    } else if (btn.dataset.goto) {
      const el = document.getElementById(btn.dataset.goto);
      if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }
    sideNav.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });

  /* ===== Filtres projets (délégué, les panneaux sont clonés) ===== */
  function wireFilters(scope) {
    const bar = scope.querySelector(".filter-bar");
    if (!bar) return;
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      bar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      scope.querySelectorAll(".proj").forEach((card) => {
        const cats = (card.dataset.cat || "").split(" ");
        card.classList.toggle("hidden-card", !(f === "all" || cats.includes(f)));
      });
    });
  }

  /* ===== Séquence d'ouverture ===== */
  const BOOT_LINES = [
    "> initialisation du noyau DK-1 ................ [ok]",
    "> chargement du profil candidat ............... [ok]",
    "> liaison recruteur chiffrée ................... [établie]",
  ];

  function bootSequence() {
    return new Promise((res) => {
      if (reduce) {
        boot.textContent = BOOT_LINES.join("\n");
        res();
        return;
      }
      let li = 0;
      (function nextLine() {
        if (li >= BOOT_LINES.length) {
          res();
          return;
        }
        const line = BOOT_LINES[li++];
        let ci = 0;
        (function tick() {
          ci = Math.min(line.length, ci + 2 + Math.floor(Math.random() * 3));
          boot.textContent = BOOT_LINES.slice(0, li - 1).join("\n") + (li > 1 ? "\n" : "") + line.slice(0, ci);
          if (ci < line.length) setTimeout(tick, 8);
          else setTimeout(nextLine, 140);
        })();
      })();
    });
  }

  enqueue(async () => {
    await new Promise((r) => setTimeout(r, reduce ? 0 : 300));
    await bootSequence();
  });

  respond({
    reply:
      "Bonjour 👋 Je suis DK-1, l'agent conversationnel chargé du recrutement de Dhanoush Kessavane. Un recruteur détecté sur ce canal — excellent timing. Voici sa fiche :",
    tpl: "tpl-profil",
    id: "msg-profil",
  });
  asked.add("profil");

  respond({
    reply: "⚠ Avant d'aller plus loin, mon système signale une anomalie critique dans son planning :",
    tpl: "tpl-alerte",
    id: "msg-dispo",
  });
  asked.add("dispo");

  respond({
    reply:
      "Cette anomalie est corrigeable en un e-mail. En attendant : que voulez-vous savoir ? Son expérience, ses projets, un scan de ses compétences… Posez votre question ci-dessous.",
  });

  /* ===== Tout dérouler (bouton sidebar ou #tout dans l'URL) ===== */
  function askAll() {
    Object.keys(TOPICS).forEach((id) => {
      if (!asked.has(id)) ask(id);
    });
  }
  if (location.hash === "#tout") askAll();

  /* ===== Année ===== */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
