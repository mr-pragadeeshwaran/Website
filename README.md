# Causal Insight Agency — Website

Single-page marketing site for the **Causal Insight Agency** — incrementality &
causal analytics for FMCG brands on Indian quick-commerce and Amazon.

It explains, for brand founders and e-commerce leads, why dashboards and raw data
alone can't answer the questions that decide where their money goes — and how the
agency turns their own data into a single, rupee-denominated decision.

## Stack

Plain **HTML + CSS + vanilla JavaScript** — no build step, no dependencies.

| File | Purpose |
|------|---------|
| `index.html` | Page structure & content |
| `styles.css` | Design system (light theme, green accent, dark feature panels) |
| `script.js`  | Scroll reveals, animated counters, interactive hero canvas |

Fonts: General Sans (headings), Inter (body), JetBrains Mono (data labels) — loaded via CDN.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python -m http.server 4173
# then visit http://localhost:4173
```

## Notes

- The design is **light-first** with two near-black "panel" sections used for contrast.
- Engagement pricing is intentionally not shown on the site — it's discussed on a call.
- All `₹` figures on the page are illustrative *findings* (examples of value), not prices.
