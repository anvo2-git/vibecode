# The Common Nose — Perfume Recommendation App

A multi-page Next.js + Tailwind app that recommends perfumes based on accord-based cosine similarity. Built on a catalog of 68,000 fragrances from Fragrantica.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **Fuse.js** for fuzzy search
- **React Context** for ephemeral client-side state (no database)

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — hero, "how it works", two paths (explore / quiz) |
| `/explore` | Search + accord filter builder + picks management |
| `/quiz` | 5-question guided quiz mapping preferences to accords |
| `/perfume/[id]` | Dynamic route — full perfume detail, personal notes form, similar perfumes |
| `/recommendations` | Grouped recommendations with thumbs up/down voting and Dirichlet refinement |
| `/api/scrape` | Server-side Fragrantica scrape endpoint (fallback for unknown perfumes) |

## Data Model

### Static Data (bundled in `public/data/`)
- `perfumes.json` — 68,511 perfumes with compact keys (`n`=name, `b`=brand, `g`=gender, `r`=rating, `rc`=ratingCount, `aw`=accordWeights as Record<string, 0-100>)
- `accord-lookup.json` — maps accord names to arrays of perfume IDs for fast candidate filtering
- `accord-labels.json` — ordered list of all 90 accord names

### Client State (React Context, ephemeral)
- **Picks** — up to 3 seed perfumes for recommendations
- **Votes** — thumbs up/down on recommendations
- **Quiz Accords** — inferred accords from quiz completion
- **Personal Notes** — per-perfume notes and user ratings
- **Scraped Perfumes** — perfumes added via Fragrantica scrape

## Recommendation Engine

1. **Per-seed mode** (no votes): For each picked perfume, use its top-2 accords to pull candidates from the accord lookup, then rank by cosine similarity on accord weight vectors.
2. **Refined mode** (with votes): Builds a Dirichlet posterior over the accord space — picks set the prior, thumbs-up/down update pseudo-counts. Posterior mean becomes the preference vector for candidate scoring.
3. **Quiz mode**: Takes the user's top accords, generates (n choose 2) pairs, finds perfumes with high weights in both accords of each pair.

## Design

- **Fonts**: EB Garamond (serif headings), Source Sans 3 (body)
- **Colors**: Warm cream background (#f7f5f0), white cards, stone borders
- **Accord pills**: Color-coded by accord family (teal=fresh, mauve=floral, brown=woody, etc.) — ported from the original Streamlit app
- **Layout**: Shared nav with picks badge, responsive, max-w-4xl centered content

## Development

```bash
npm install
npm run dev      # localhost:3000
npm run build    # production build
```

## Style Preferences

- Clean, minimal, professional — Linear/Notion-inspired
- Serif for headings, sans for body
- Subtle interactions (hover states, transitions)
- No emojis in UI unless specifically requested
- Mobile-responsive with sensible breakpoints
