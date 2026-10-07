# dave-randall.com

Source for [dave-randall.com](https://dave-randall.com): the deep dives behind Dave Randall's LinkedIn series on Microsoft Intune.

Built with [Astro](https://astro.build) and hosted on GitHub Pages. Every push to `main` deploys, and the site also rebuilds every weekday morning so scheduled posts go live on their date.

## How content is organized

```
src/content/
  topics/   rbac.yaml, graph.yaml          one file per top-level topic (nav + /<topic>/ page)
  series/   rbac-20-days.yaml, ...         one file per LinkedIn series
  posts/
    rbac/day-05.md                         -> dave-randall.com/rbac/day-05/
    graph/day-12.md                        -> dave-randall.com/graph/day-12/
public/images/<topic>/                     diagrams and screenshots
```

The folder a post lives in is its topic, and its file name is its URL. **Don't rename a published post's file**: LinkedIn posts link to that URL.

## Add or update a series post

Create or edit `src/content/posts/<topic>/day-NN.md`:

```markdown
---
title: Scope tags explained
series: rbac-20-days
day: 7
week: 2
date: 2026-10-20          # goes live this morning
summary: One sentence shown in lists and link previews.
linkedin: https://www.linkedin.com/posts/...   # add once the post is live
diagram: /images/rbac/day-07.png
diagramAlt: Describe the diagram for screen readers.
---

Body in Markdown.
```

- `status: planned` lists the day on the series page as "Coming <date>" without building a page. Remove it once the page is written.
- A post with a future `date` stays hidden until the morning rebuild on that date.
- `updated: 2027-03-01` shows an "Updated" date when you revise an older page.

## Add a guide or article (not part of a series)

Leave out `series`, `day` and `week`. It appears under "Guides and articles" on the topic page, for example `src/content/posts/rbac/scope-tags-guide.md` → `/rbac/scope-tags-guide/`.

## Add a new topic

1. Add `src/content/topics/<id>.yaml` (title, navLabel, description, accent colors, order).
2. Create `src/content/posts/<id>/` for its posts.
3. Optionally add a series in `src/content/series/`.

It appears in the navigation automatically.

## Run locally

```bash
npm install
npm run dev             # http://localhost:4321
npm run build:preview   # build including future-dated posts
```

## License

- **Code** (site source and code samples): [MIT](LICENSE)
- **Written content and diagrams**: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Share and adapt with attribution.
- The Thunder Creek Creative Solutions name and logo, and photos of Dave Randall, are not covered by either license.
