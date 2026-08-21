# CtxtArc.github.io

Personal site with three sections: cybersecurity, low-level systems programming,
and Android (Asgard, YggdrasilMusicPlayer). Plain HTML/CSS/JS, no build step.

## Structure

```
index.html            home — links to the three sections
cybersecurity.html
lowlevel.html
android.html
css/style.css
js/main.js             active-nav highlighting, hero typing effect,
                        live GitHub star counts (client-side fetch)
```

## Deploy to GitHub Pages

1. Create (or open) the repo named exactly `CtxtArc.github.io` under the
   CtxtArc account — the repo name is what makes GitHub Pages serve it at
   `https://CtxtArc.github.io`.
2. Copy everything in this folder into the root of that repo (keep the
   `css/` and `js/` folders as-is; don't nest it inside a subfolder).
3. Commit and push to the `main` branch.
4. In the repo: **Settings → Pages → Build and deployment → Source** →
   set to `Deploy from a branch`, branch `main`, folder `/ (root)`.
5. Wait a minute or two, then visit `https://CtxtArc.github.io`.

## Updating content

- Repo cards (title, description, topics, language dot, GitHub link) are
  plain HTML in each page — edit them directly.
- Star counts refresh automatically in the visitor's browser via the public
  GitHub API (`api.github.com/repos/CtxtArc/<repo>`), so you don't need to
  hand-update those numbers. If a repo is renamed, update its `data-repo="…"`
  attribute to match.
- To add a new project, copy an existing `<article class="card">…</article>`
  block on the relevant page and fill in the details.

## Local preview

No build step needed — just open `index.html` in a browser, or serve the
folder locally:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.
