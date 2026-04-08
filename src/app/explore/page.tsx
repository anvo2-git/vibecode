"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { loadCatalog, loadLookup } from "@/lib/data";
import { useApp } from "@/lib/context";
import { ACCORD_FAMILIES } from "@/lib/accords";
import { AccordPill } from "@/components/AccordPill";
import { PerfumeCard } from "@/components/PerfumeCard";
import type { Perfume } from "@/lib/types";

export default function ExplorePage() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [catalog, setCatalog] = useState<Perfume[]>([]);
  const [lookup, setLookup] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedAccords, setSelectedAccords] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Perfume[]>([]);
  const [filterResults, setFilterResults] = useState<Perfume[]>([]);
  const [mode, setMode] = useState<"search" | "filter">("search");

  useEffect(() => {
    Promise.all([loadCatalog(), loadLookup()]).then(([c, l]) => {
      setCatalog(c);
      setLookup(l);
      setLoading(false);
    });
  }, []);

  const fuse = useMemo(() => {
    if (catalog.length === 0) return null;
    return new Fuse(catalog, {
      keys: ["n", "b"],
      threshold: 0.35,
      distance: 100,
    });
  }, [catalog]);

  // Search
  useEffect(() => {
    if (!fuse || !query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = fuse.search(query, { limit: 20 });
    setSearchResults(results.map((r) => r.item));
  }, [query, fuse]);

  // Filter by accords
  useEffect(() => {
    if (selectedAccords.length === 0 || catalog.length === 0) {
      setFilterResults([]);
      return;
    }

    // Find perfumes that have ALL selected accords
    const candidateSets = selectedAccords.map(
      (accord) => new Set(lookup[accord] ?? [])
    );

    // Intersection of all sets
    let intersection = candidateSets[0];
    for (let i = 1; i < candidateSets.length; i++) {
      const next = new Set<number>();
      for (const id of intersection) {
        if (candidateSets[i].has(id)) next.add(id);
      }
      intersection = next;
    }

    // Score by sum of weights for selected accords, take top 30
    const scored = Array.from(intersection)
      .filter((id) => id < catalog.length)
      .map((id) => {
        const p = catalog[id];
        let score = 0;
        for (const accord of selectedAccords) {
          score += p.aw[accord] ?? 0;
        }
        return { perfume: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    setFilterResults(scored.map((s) => s.perfume));
  }, [selectedAccords, catalog, lookup]);

  function toggleAccord(accord: string) {
    setSelectedAccords((prev) =>
      prev.includes(accord) ? prev.filter((a) => a !== accord) : [...prev, accord]
    );
  }

  function addToPicks(perfumeId: number) {
    dispatch({ type: "ADD_PICK", perfumeId });
  }

  function removeFromPicks(perfumeId: number) {
    dispatch({ type: "REMOVE_PICK", perfumeId });
  }

  const isPicked = (id: number) => state.picks.some((p) => p.perfumeId === id);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        Loading 68,000 perfumes...
      </div>
    );
  }

  const displayResults = mode === "search" ? searchResults : filterResults;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl font-medium text-stone-900 mb-6">Explore</h1>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setMode("search")}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            mode === "search" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Search
        </button>
        <button
          onClick={() => setMode("filter")}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            mode === "filter" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700"
          }`}
        >
          Filter by Accords
        </button>
      </div>

      {/* Search mode */}
      {mode === "search" && (
        <div className="mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search perfumes... e.g. Black Orchid, Sauvage, Flowerbomb"
            className="w-full px-4 py-3 bg-white border border-stone-200 rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
          />
        </div>
      )}

      {/* Filter mode */}
      {mode === "filter" && (
        <div className="mb-6 space-y-4">
          <p className="text-sm text-stone-500">
            Select accords you want. We&apos;ll show perfumes that match all of them.
          </p>
          {Object.entries(ACCORD_FAMILIES).map(([family, accords]) => (
            <div key={family}>
              <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">
                {family}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {accords.map((accord) => (
                  <AccordPill
                    key={accord}
                    accord={accord}
                    onClick={() => toggleAccord(accord)}
                    selected={selectedAccords.includes(accord)}
                  />
                ))}
              </div>
            </div>
          ))}
          {selectedAccords.length > 0 && (
            <button
              onClick={() => setSelectedAccords([])}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Your Picks */}
      {state.picks.length > 0 && (
        <div className="mb-6 p-4 bg-white border border-stone-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-medium text-stone-900">
              Your Picks ({state.picks.length}/3)
            </h2>
            <button
              onClick={() => router.push("/recommendations")}
              className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Get Recommendations
            </button>
          </div>
          <div className="grid gap-2">
            {state.picks.map((pick) => {
              const p = catalog[pick.perfumeId];
              if (!p) return null;
              return (
                <PerfumeCard
                  key={p.id}
                  perfume={p}
                  action={
                    <button
                      onClick={() => removeFromPicks(p.id)}
                      className="text-xs px-3 py-1.5 rounded-md border border-stone-300 text-stone-500 hover:bg-stone-100 transition-colors"
                    >
                      Remove
                    </button>
                  }
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {displayResults.length > 0 && (
        <div>
          <h2 className="font-serif text-lg font-medium text-stone-900 mb-3">
            {mode === "search" ? "Search Results" : `Matching Perfumes (${filterResults.length})`}
          </h2>
          <div className="grid gap-3">
            {displayResults.map((p) => (
              <PerfumeCard
                key={p.id}
                perfume={p}
                action={
                  isPicked(p.id) ? (
                    <button
                      onClick={() => removeFromPicks(p.id)}
                      className="text-xs px-3 py-1.5 rounded-md border border-stone-300 text-stone-500 hover:bg-stone-100 transition-colors"
                    >
                      Remove
                    </button>
                  ) : state.picks.length < 3 ? (
                    <button
                      onClick={() => addToPicks(p.id)}
                      className="text-xs px-3 py-1.5 rounded-md bg-stone-900 text-white hover:bg-stone-700 transition-colors"
                    >
                      + Pick
                    </button>
                  ) : null
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty states */}
      {mode === "search" && query && searchResults.length === 0 && (
        <div className="text-center py-12 text-stone-500">
          <p className="mb-2">No perfumes found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm">Try a different name, or paste a Fragrantica URL to add it.</p>
        </div>
      )}
      {mode === "filter" && selectedAccords.length > 0 && filterResults.length === 0 && (
        <div className="text-center py-12 text-stone-500">
          No perfumes match all selected accords. Try removing some filters.
        </div>
      )}
    </div>
  );
}
