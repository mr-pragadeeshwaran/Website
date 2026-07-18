# StatIQ Lab — Website

Single-page marketing site for **StatIQ Lab** (the Causal Insight Agency) —
incrementality & causal analytics for FMCG brands on Indian quick-commerce and Amazon.

It explains, for brand founders and e-commerce leads, why dashboards and raw data
alone can't answer the questions that decide where their money goes — and how the
agency turns their own data into a single, rupee-denominated decision.

## Stack

Plain **HTML + CSS + vanilla JavaScript** — no build step, no dependencies.

| Path | Purpose |
|------|---------|
| `index.html` | Page structure & content |
| `css/styles.css` | Design system (light theme, green accent, dark feature panels) |
| `js/script.js` | Scroll reveals, animated counters, interactive hero canvas |
| `assets/og.png` | Social share (Open Graph) image |
| `assets/partners/` | Blinkit, Zepto, Instamart logos shown on the page |

Fonts: General Sans (headings), Inter (body), JetBrains Mono (data labels) — loaded via CDN.

## Run locally

```bash
python -m http.server 4173   # then visit http://localhost:4173
```

## Deployment

Served by GitHub Pages from this folder via `.github/workflows/pages.yml`.
Set repo **Settings -> Pages -> Source -> "GitHub Actions"** once; then pushes to
`main` auto-deploy to `https://mr-pragadeeshwaran.github.io/Website/`.

## Notes

- The design is **light-first** with two near-black "panel" sections for contrast.
- Engagement pricing is intentionally not shown on the site — discussed on a call.
- **No fabricated social proof.** StatIQ Lab is a brand-new practice (no clients, no
  testimonials). Every `₹`/`%` figure belongs to ONE clearly-labeled **illustrative
  worked example**, not a real client result — the site makes its own craftsmanship and
  honesty the proof. See `website/README.md` before touching any number or adding proof.
