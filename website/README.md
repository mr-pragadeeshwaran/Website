# StatIQ Lab — Website

Single-page marketing site for **StatIQ Lab** — a causal-analytics lab for consumer/FMCG
brands on Indian quick-commerce (Blinkit, Zepto, Instamart) and Amazon.

It explains, for brand founders and e-commerce leads, why dashboards and raw data
alone can't answer the questions that decide where their money goes — and how the
lab turns their own data into a single, rupee-denominated decision, every Monday.

## Positioning (read before editing copy)

StatIQ Lab is a **brand-new practice: no clients, no testimonials, no case studies**.
The site never fabricates social proof. Instead it makes the *website itself* the proof —
through craftsmanship and intellectual honesty.

Concretely: **every `₹` / `%` figure on the page belongs to ONE clearly-labeled
illustrative worked example** (a representative brand, the method run end to end), **not
a real client engagement.** This is signalled explicitly by the "Worked example"
(`.wex-tag`) label, the disclaimer under the stats band (`.stats__foot`), and the proof
section's lead ("We're a new lab, so we won't borrow a logo or a quote you can't
verify"). If you add or change any number, keep it inside that illustrative frame — do
not present it as an achieved client result, and do not add testimonials or client logos.

## Stack

Plain **HTML + CSS + vanilla JavaScript** — no build step, no dependencies.

| Path | Purpose |
|------|---------|
| `index.html` | Page structure & content |
| `css/styles.css` | Design system (warm-paper light theme, firm deep-green accent, dark feature panels) |
| `js/script.js`  | Scroll reveals, animated counters, interactive hero canvas |
| `assets/og.png` | Social share (Open Graph) image |
| `assets/partners/` | Blinkit, Zepto, Instamart logos shown on the page |

Fonts: General Sans (headings + body), Instrument Serif (rationed accents — hero word,
pull quote, contact title only), JetBrains Mono (data labels) — loaded via CDN.

## Deployment

Served by GitHub Pages from this folder via `.github/workflows/pages.yml`.
Set repo **Settings → Pages → Source → "GitHub Actions"** once; then pushes to
`main` auto-deploy to `https://mr-pragadeeshwaran.github.io/Website/`.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 4173
# then visit http://localhost:4173
```

## Notes

- The design is **light-first** with two near-black "panel" sections used for contrast.
- Engagement pricing is intentionally not shown on the site — it's discussed on a call.
- Accessibility is a first-class concern: full `prefers-reduced-motion` handling, a
  keyboard skip link, visible focus states, and a JS-failure safety net that reveals all
  content if the script never loads.
- Founder avatar is an intentional monogram (no stock/placeholder photo). Swap for a real
  black-and-white portrait when available (`.founder__photo` in the About section).
