# Reflection Questions

## 1. What's in your CLAUDE.md? How did your plan shape what Claude built — and how did it evolve as you worked?

My CLAUDE.md describes The Common Nose — a perfume recommendation app built on a dataset of 68,000 fragrances from Fragrantica. It documents the stack (Next.js 16, Tailwind v4, Fuse.js, React Context), all seven pages and their purposes, the data model (static JSON files for the catalog plus ephemeral client-side state for picks, votes, and notes), and the recommendation engine's four modes (per-seed cosine similarity, Dirichlet-refined voting, quiz-based accord pairing, and the scent builder's tiered matching).

The plan evolved significantly as I worked. I started with the idea of a simple "search and recommend" flow, but as Claude scaffolded the explore page, I realized the data model needed more structure — the compact key format (`n`, `b`, `aw`) for the 68K perfume JSON was a performance decision that shaped how every component accessed data. The recommendation engine started as plain cosine similarity, but after testing it I found the results too homogeneous, so I iterated toward the Dirichlet refinement system where users can vote and the algorithm adjusts. The Build page wasn't in the original plan at all — it came from realizing that some users know what accords they want but don't have a starting perfume. The CLAUDE.md grew from a short scaffold description into a full reference document that I updated after each major feature, which helped Claude stay consistent across sessions.

## 2. Pick one page in your app. Trace the path: what file renders it, what's the route, what components does it use, where does the data come from?

**The Explore page (`/explore`)**

- **File**: `src/app/explore/page.tsx` — this is a client component (`"use client"`) that renders at the `/explore` route via Next.js App Router's file-based routing.
- **Route**: `/explore`, defined implicitly by the directory structure `src/app/explore/page.tsx`.
- **Components used**:
  - `AccordPill` (`src/components/AccordPill.tsx`) — color-coded pills for each accord, using `getAccordColor()` from `src/lib/accords.ts` to map accord names to background/foreground colors.
  - `PerfumeCard` (`src/components/PerfumeCard.tsx`) — displays a perfume's name, brand, rating, and top 6 accords. Links to the dynamic `/perfume/[id]` route.
  - `Nav` (via `ClientLayout` in `src/app/client-layout.tsx`) — the shared navigation bar, which also shows the picks count badge.
- **Data sources**:
  - `public/data/perfumes.json` — loaded via `loadCatalog()` from `src/lib/data.ts` on mount. This is a 68,511-entry array of perfume objects with compact keys.
  - `public/data/accord-lookup.json` — loaded via `loadLookup()`, maps each accord name to an array of perfume IDs for fast filtering.
  - `Fuse.js` index — built from the catalog in a `useMemo`, used for fuzzy text search on perfume names and brands.
  - `React Context` (`src/lib/context.tsx`) — provides `state.picks` and `state.scrapedPerfumes` for managing the user's selected perfumes and any imported Fragrantica perfumes.
  - `/api/scrape/search` and `/api/scrape` — server-side API routes that search and scrape Fragrantica when a perfume isn't in the local catalog.

## 3. Describe one thing that happened when Claude tested your app with Playwright MCP. How did the build-verify loop change how you worked?

After building the Accord Encyclopedia page (`/info`), I had Claude use Playwright MCP to open the app and verify the page worked. Claude navigated to `/info`, took a snapshot of the page, and confirmed that the accordion-style cards rendered correctly — each accord showed its color-coded pill, the expand/collapse interaction worked, and the co-occurrence bar charts appeared when a card was expanded. The screenshot was saved as `playwright-verification-home.png`.

The build-verify loop changed how I worked in a meaningful way: instead of switching between my terminal, browser, and dev tools, I could stay in the Claude Code conversation and say "check if that looks right." It compressed the feedback cycle. For example, when the Fragrantica scrape feature was first built, Playwright caught that scraped perfumes weren't appearing in the picks panel — the issue was that the `getPerfume` helper wasn't checking the `scrapedPerfumes` array. Without the automated verification, I might have missed this until much later. It turned Claude into both the builder and the QA tester in the same loop.
