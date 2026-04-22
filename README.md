# LexieZhou.github.io

Personal portfolio site at [yichenzw.com](https://yichenzw.com), built with React + Vite.

## Local development

```bash
npm install       # first time only
npm run dev       # dev server at http://localhost:5173
```

All page content lives in `src/data/content.js` — edit that file to update news, publications, experience, or projects.

## Deploy

```bash
npm run build     # builds into docs/
git add docs/
git commit -m "build"
git push
```

GitHub Pages is configured to serve from the `docs/` folder on the `main` branch. Changes go live at [yichenzw.com](https://yichenzw.com) within a minute or two of pushing.
