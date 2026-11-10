# José Antonio Sánchez — Connected CV

A static, bilingual CV with an Obsidian-inspired explorer, linked notes, backlinks,
search and an interactive SVG knowledge map. No build, framework, CDN or backend.

Open `index.html` directly, or serve the repository:

```sh
python3 -m http.server 8765
```

Then visit `http://localhost:8765`. The root is also ready for GitHub Pages.
Hash routes work without server rewrites, including direct links such as `#bondy`
and `#mapa`. PDF downloads are supplied in Spanish and English. Without JavaScript,
the original PDFs remain accessible.

## Editing

- `assets/cv-data.js`: professional content, bilingual text pairs `[Spanish, English]`
  and relationships between notes. Note IDs are stable public URLs.
- `assets/app.js`: rendering, hash navigation, search, graph, language and theme.
- `assets/styles.css`: responsive layout, both themes and print rules.
- `downloads/`: original updated CVs, renamed for public downloads.
- `app-ads.txt`: existing advertising declaration.

To add a note, provide a unique `id`, `type` (`experience`, `project`, `skill`),
`title`, `subtitle`, `summary` and `links`. Optional fields are `body`, `bullets`,
`status` and `external`. Relationships generate backlinks automatically.

## Editorial scope

Updated 10 November 2026 using the supplied Spanish and English CVs, local project
code and documentation, and GitHub repository metadata. Employment dates,
leadership figures, education and language levels follow the supplied CVs.
Repository existence is not evidence of a production deployment or individual
ownership of every contribution. Project notes distinguish products,
implementations, MVPs and proofs of concept. Only verified public repositories
receive source-code links.

Personal prototypes are presented as independent projects, not employment.
The end-to-end agent workflow remains explicitly in preparation. Private
repository paths, source code and infrastructure configuration are not included.

## Checks

```sh
node --check assets/app.js
node --check assets/cv-data.js
git diff --check
```

The site uses system fonts and local assets. Search and graph run entirely in the
browser; there are no analytics or external API calls. Language and theme
preferences are stored locally when the browser permits it.
