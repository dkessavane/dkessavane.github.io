# Portfolio — Dhanoush Kessavane

Portfolio personnel statique (HTML / CSS / JS pur, aucune dépendance, aucun build),
présenté comme un **faux rapport d'audit de sécurité** dont la cible est… moi.
Constat critique DK-001 : aucune alternance détectée à partir de septembre 2026 —
remédiation en §7. Thème « papier » par défaut, mode nuit disponible, imprimable
comme un vrai rapport (`Ctrl+P`).

## Structure

```
portfolio/
├── index.html          # Page unique multi-sections
├── css/style.css       # Styles + thèmes sombre/clair
├── js/main.js          # Thème, menu mobile, animations, filtres projets
├── assets/             # → déposer CV_Dhanoush_Kessavane.pdf ici
└── projet/             # Archives des projets BUT1/BUT2/BUT3 (non publiées)
```

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou :

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Déployer sur GitHub Pages

1. Créer un dépôt GitHub nommé **`dkessavane.github.io`**.
2. Y pousser le contenu de ce dossier (`index.html`, `css/`, `js/`, `assets/`) —
   **sans** le dossier `projet/` (archives de cours, trop volumineux) :

   ```bash
   git init
   echo "projet/" > .gitignore
   git add .
   git commit -m "Portfolio initial"
   git remote add origin https://github.com/dkessavane/dkessavane.github.io.git
   git push -u origin main
   ```

3. Dans **Settings → Pages**, vérifier que la source est la branche `main` (racine).
4. Le site est en ligne sur **https://dkessavane.github.io** après ~1 minute.

## À faire avant mise en ligne

- [ ] Déposer `CV_Dhanoush_Kessavane.pdf` dans `assets/`
- [ ] Vérifier les liens GitHub des projets (dépôts d'équipe sous `optmlako2004`)
