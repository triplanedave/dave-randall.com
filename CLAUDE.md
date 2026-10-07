# Notes for working on this repo

Astro static site for dave-randall.com, deployed to GitHub Pages by `.github/workflows/deploy.yml`. Read README.md for the content model.

- URLs are permanent. LinkedIn posts link to `/<topic>/<slug>/`; never rename or move a published post file.
- Facts about Intune must come from Microsoft Learn (link it under "Further reading"). Don't state permissions or role contents from memory.
- Diagrams are PNGs in `public/images/<topic>/`, rendered at 2x (2400px wide). Always set `diagramAlt`.
- Brand: Thunder Creek red (#E00000 mark, #D40000 text) and near-black; IBM Plex Sans/Mono. Each topic has its own accent in its topic yaml.
- Run `npm run build` before committing; the build fails on frontmatter that doesn't match `src/content.config.ts`.
