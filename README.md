# Emmanuel Guevara Vásquez — Developer Playground

Personal static portfolio for a Software Engineering student at ITESO, Guadalajara, México. Built with Astro, TypeScript, Tailwind CSS and original vector artwork.

## Run locally

Use Node.js **22.22 or newer** (Node 24 is used in CI), npm and the committed lockfile.

```sh
npm ci --ignore-scripts
npm run dev
```

The dev server binds to `127.0.0.1`. To validate and build:

```sh
npm test
npm run check
npm run build
npm run preview
```

Python 3.10+ is used for the standard-library calendar parser tests and optional data refresh. The production site does not need Python, a server, credentials or visitor-facing API calls.

## Features

- Cinematic identity and an animated, code-native vector profile scan.
- Responsive project cards and a toolbox that separates project practice from academic learning.
- Safe interactive terminal: `help`, `about`, `skills`, `projects`, `github`, `contact`, `clear`; history with the up/down arrows.
- Functional English/Spanish selector with an optional local preference.
- Public GitHub calendar with 30-day, 90-day and year filters, plus an accessible table of active dates.
- CSS motion, reduced-motion support and an explicit pause control.
- Static build-notes page, custom 404, canonical URLs, Open Graph PNG, sitemap and robots.txt.
- Self-hosted WOFF2 fonts and no analytics, trackers or paid services.

## Public data and private boundaries

`data/github.json` is a dated snapshot from unauthenticated GitHub endpoints. The date remains visible. Contributions are GitHub events and are never treated as a commit count or a proficiency score.

```sh
npm run sync:github
```

The parser checks dates, totals, tooltip structure and count/level consistency before replacing the snapshot atomically. If GitHub changes its markup, it fails instead of inventing values. The deployment workflow can retain the previous verified, dated snapshot if a refresh is unavailable. No token is used to collect activity or list repositories.

Only the user-authorized general description of Opero Docs is included. No private repository links, features, architecture, customer information or test counts are published. The only contact link is GitHub. Source: https://github.com/gvemmanuel3712-cyber/gvemmanuel3712-cyber.github.io.

## Static GitHub Pages deployment

Expected repository: **gvemmanuel3712-cyber/gvemmanuel3712-cyber.github.io**. Expected URL: **https://gvemmanuel3712-cyber.github.io/**.

The Astro config uses that origin and has no `base`, because this is a user site. `.github/workflows/pages.yml` builds the static artifact and deploys it through the official Pages action. Enable **Settings → Pages → Source: GitHub Actions** in the public repository. Do not upload `node_modules` or require a personal access token.

The build runs for pull requests; deployment is limited to `main` in the intended repository. A weekly schedule can refresh the site data. If GitHub pauses scheduled workflows or a refresh fails, the visible capture date still tells readers how old the data is; `workflow_dispatch` is available for a manual refresh.

On GitHub Free with a public repository, GitHub Pages and standard hosted Actions provide the intended hosting without a required recurring payment. No custom domain or paid backend is required. Once deployed, the Mac does not have to remain on.

References: [Astro on GitHub Pages](https://docs.astro.build/en/guides/deploy/github/), [GitHub Pages availability](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Structure

```text
src/components/   Hero, scan, projects, toolbox, terminal, calendar, footer
src/layouts/      Shared metadata, typography and page shell
src/lib/          Translation copy and fixed terminal/calendar logic
src/pages/        Home, build notes and 404
src/scripts/      Small browser enhancement module
src/styles/       Design tokens and responsive/motion rules
data/             Verified public GitHub snapshot
scripts/          Public-only refresh utility
tests/            Command, data and parser checks
public/           Original icons, Open Graph art, SEO files and font licenses
```

## Asset licenses

Space Grotesk and IBM Plex Mono are used under the SIL Open Font License; copies are included in `public/licenses/`. Diagrams, pixel satellite, SVGs and UI are original assets produced for this portfolio. The university diagram is symbolic; it is not a photograph or map of the ITESO campus. The TikTok and generated UI concepts are reference material only and are not embedded in the production site.
