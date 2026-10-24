# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Production build → docs/
npm run preview  # Preview the docs/ build
```

## Tech Stack

- **React 18** via **Vite 5**
- **Tailwind CSS** with `darkMode: 'class'`
- **Framer Motion** for scroll animations
- **Lucide React** for icons
- **Fonts**: Playfair Display (headings) · DM Sans (body) · DM Mono (dates/tags) — loaded via Google Fonts in `index.html`

## Architecture

All page content is centralized in `src/data/content.js` — edit this file to update news, publications, experience, education, or projects. Components are thin renderers over that data.

### Key files

| File | Purpose |
|------|---------|
| `src/data/content.js` | Single source of truth for all text content |
| `src/index.css` | CSS variables for the color system (both light + dark), plus reusable utility classes (`.section-title`, `.accent-pill`, `.timeline-item`, `.project-card`) |
| `src/hooks/useDarkMode.js` | Reads/writes `localStorage` key `theme`; applies `dark` class to `<html>`. Defaults to light mode. |
| `src/components/FadeInSection.jsx` | Reusable Framer Motion wrapper — fade + slide up on scroll enter, `once: true` |

### Color system

Colors are defined as CSS variables in `src/index.css` under `:root` (light) and `.dark`. Tailwind does not manage these colors — use `style={{ color: 'var(--accent)' }}` inline. The Tailwind config extends font families (`font-display`, `font-body`, `font-mono`) and sets `darkMode: 'class'`.

### Component layout

Single-column layout, max `768px` centered, `padding: 0 1.5rem`. Each section is a `<section>` with a `max-w-content mx-auto px-6 py-12` wrapper. Sections start with `<hr className="section-divider" />`.

Projects renders as a 2-column grid on `md:` breakpoint, 1-column on mobile.

### Deployment

Push to `main` — GitHub Pages serves from the root. The `CNAME` file maps `yichenzw.com`. For GitHub Pages with a custom domain at root, `vite.config.js` uses `base: '/'` and `outDir: 'docs'`, and GitHub Pages serves the committed `docs/` folder.

## Blog

Routes `/blog` (index) and `/blog/:slug` (note), lazy-loaded so Markdown/KaTeX/search/graph code stays out of the main bundle.

- Notes are `src/content/blog/<slug>.md`; the filename is the slug. Start from `src/content/blog/_template.md` — files starting with `_` are never loaded. Frontmatter: `title`, `date` (YYYY-MM-DD), `tags: [a, b]`, `summary`, optional `draft: true` (hidden in production builds).
- Body supports GFM, `$inline$` / `$$block$$` math, fenced code with highlighting, and images from `public/img/blog/`.
- `[[slug]]` or `[[slug|label]]` links to another note and adds a graph edge; links to notes that don't exist render as muted text.
- `src/data/blog.js` loads and parses the notes and builds the search index (MiniSearch) and the knowledge graph (notes + `#tag` hubs).
- Components live in `src/components/blog/`. The outline is read from the rendered `h2`/`h3` ids, and scrolls from JS because HashRouter owns the URL hash.

## Image assets

Images live in `public/img/` (served as static assets by Vite):
- `public/img/me.jpg` — profile photo
- `public/img/projects/*.png` — project thumbnails (Orbit, CodeRAG, AR_Laparoscopy, Decide, 2Dto3D, Foodprint)
- `public/img/icon/` — social icons (not currently used; components use Lucide SVG icons instead)
