# Assignment 2 Reflection — The Common Nose

## 1. What did you build, and what does it do?

The Common Nose is a perfume recommendation web app built with Next.js 16, Tailwind CSS v4, Supabase, and Clerk. It lets users discover new fragrances through three paths: searching a catalog of 68,000 perfumes and picking up to 3 seeds for similarity-based recommendations, building a scent profile by selecting leading and trailing accords, or taking a 5-question quiz that maps preferences to accord families.

The recommendation engine works by representing each perfume as a vector of accord weights and ranking candidates by cosine similarity to the user's seed perfumes. A Dirichlet refinement layer updates those rankings as users vote thumbs-up or thumbs-down on recommendations. Authenticated users (via Clerk + Supabase) can save favorites that persist across sessions. A "Today's Scent" page uses the browser's geolocation API with an Open-Meteo weather proxy to suggest accords appropriate for current conditions.

## 2. What was the hardest technical challenge, and how did you solve it?

The hardest challenge was a cascade of broken native binaries caused by a disk-full event on WSL2. The symptoms looked like a Node.js or Next.js bug — the build worker was crashing with SIGBUS (bus error / memory-mapped file fault) — but the real cause was that three Rust-compiled `.node` addons (`@tailwindcss/oxide`, `lightningcss`, `@unrs/resolver-binding`) had been silently corrupted when the filesystem ran out of space mid-write. The error message gave no indication of which binary was at fault.

The solution was to isolate each native addon individually with a minimal `require()` test, identify which ones crashed with SIGBUS, re-download fresh tarballs from the npm registry, and overwrite the corrupted binaries. Additionally, `@supabase/supabase-js` ships empty `.d.mts` TypeScript declaration files (a known packaging quirk), which caused a separate type-checking failure; those were fixed by writing re-export stubs pointing at the `.d.cts` equivalents, now automated in a `postinstall` script.

## 3. What would you do differently or add with more time?

With more time I would replace the static 68,000-perfume JSON bundle (14 MB served on first load) with a Supabase-backed search endpoint that queries a proper full-text index. The current approach works but forces the client to download the entire catalog before any search can run. I would also wire the frontend to the existing `perfume_notes` Supabase table so personal notes persist across sessions (the schema exists but is not yet connected to the UI), and add aggregated community favorites per perfume. On the infrastructure side, I would switch to Clerk production keys and gate Vercel deployments on passing CI type checks.

## 4. What did you learn about building with external APIs and authentication?

The main lesson is that the integration layer between two auth systems is where complexity hides. Clerk handles identity and issues JWTs; Supabase uses those JWTs to enforce row-level security via `auth.jwt() ->> 'sub'`. Getting that chain right required configuring Third-Party Auth in the Supabase dashboard, writing RLS policies, and passing the Clerk session token as Supabase's `accessToken` on every request. None of that is difficult once you understand the model, but the failure mode — silently blocked database writes with no visible error to the user — is hard to debug without logging.

The broader lesson is that multi-vendor stacks (Next.js + Clerk + Supabase + Open-Meteo + Wikipedia) introduce a lot of surface area where packaging bugs, empty distribution files, and mismatched key formats can combine to produce failures that look unrelated to their actual cause. Defensive tooling — the `patch-esm.js` postinstall script and individual binary smoke tests — paid off more than expected.
