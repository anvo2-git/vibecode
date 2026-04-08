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
| `/` | Landing page — hero, "how it works", three paths (explore / build / quiz) |
| `/explore` | Search + accord filter builder + picks management |
| `/build` | Scent builder — pick leading accords + trailing accords, find matching perfumes |
| `/info` | Accord encyclopedia — descriptions, common notes, co-occurrence stats |
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
2. **Refined mode** (with votes): Keeps per-seed grouping but re-ranks using a Dirichlet posterior blended with each seed's accords. Vote influence is position-aware — trailing accords (3rd+) get full weight, leading accords (top 2) only adjust when multiple votes converge on them.
3. **Quiz mode**: Takes the user's top accords, generates (n choose 2) pairs, finds perfumes with high weights in both accords of each pair.
4. **Build mode**: User selects leading accords (required, disqualify if missing) and trailing accords (tiered bonus). Perfumes with all trailing accords rank in the highest tier; those with some trail next; leading-only rank last.

## Design

- **Fonts**: Plus Jakarta Sans (all text — bold for headings, regular for body)
- **Colors**: Pastel violet/lavender background (#f5f2ff), white cards, violet borders (Tailwind `violet` palette)
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
- Bold sans-serif (Plus Jakarta Sans) for headings, regular weight for body
- Pastel violet/purple theme throughout
- Subtle interactions (hover states, transitions)
- No emojis in UI unless specifically requested
- Mobile-responsive with sensible breakpoints
