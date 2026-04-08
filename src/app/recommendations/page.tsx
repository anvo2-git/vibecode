"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { loadCatalog, loadLookup } from "@/lib/data";
import { generateRecommendations } from "@/lib/similarity";
import { useApp } from "@/lib/context";
import { PerfumeCard } from "@/components/PerfumeCard";
import { getPerfume } from "@/lib/perfume-lookup";
import type { Perfume } from "@/lib/types";

export default function RecommendationsPage() {
  const { state, dispatch } = useApp();
  const [catalog, setCatalog] = useState<Perfume[]>([]);
  const [lookup, setLookup] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState<Record<number, [number, number][]>>({});
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    Promise.all([loadCatalog(), loadLookup()]).then(([c, l]) => {
      setCatalog(c);
      setLookup(l);
      setLoading(false);
    });
  }, []);

  const generate = useCallback(() => {
    if (state.picks.length === 0 || catalog.length === 0) return;
    const seeds = state.picks
      .map((p) => getPerfume(p.perfumeId, catalog, state.scrapedPerfumes))
      .filter((p): p is Perfume => !!p);
    const result = generateRecommendations(seeds, catalog, lookup, state.votes);
    setRecs(result);
    setGenerated(true);
  }, [state.picks, state.votes, catalog, lookup]);

  // Auto-generate on first load if picks exist
  useEffect(() => {
    if (!loading && state.picks.length > 0 && !generated) {
      generate();
    }
  }, [loading, state.picks, generated, generate]);

  function handleVote(perfumeId: number, vote: "up" | "down") {
    const existing = state.votes.find((v) => v.perfumeId === perfumeId);
    if (existing?.vote === vote) {
      dispatch({ type: "REMOVE_VOTE", perfumeId });
    } else {
      dispatch({ type: "SET_VOTE", perfumeId, vote });
    }
  }

  function refine() {
    generate();
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500">
        Loading...
      </div>
    );
  }

  // Empty state: no picks
  if (state.picks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-3xl font-medium text-stone-900 mb-3">Recommendations</h1>
        <p className="text-stone-500 mb-6">
          You haven&apos;t picked any perfumes yet. Add up to 3 to get personalised recommendations.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/explore"
            className="px-5 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Explore Perfumes
          </Link>
          <Link
            href="/quiz"
            className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-600 text-sm hover:bg-stone-100 transition-colors"
          >
            Take the Quiz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-medium text-stone-900">Recommendations</h1>
        {state.votes.length > 0 && (
          <button
            onClick={refine}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Refine ({state.votes.length} vote{state.votes.length !== 1 ? "s" : ""})
          </button>
        )}
      </div>

      {/* Grouped recommendations */}
      {Object.entries(recs).map(([seedIdStr, recList]) => {
        const seedId = parseInt(seedIdStr, 10);
        const seedName =
          seedId === -1
            ? "Your Refined Taste"
            : getPerfume(seedId, catalog, state.scrapedPerfumes)?.n ?? "Unknown";

        return (
          <div key={seedId} className="mb-8">
            <h2 className="font-serif italic text-lg text-stone-500 mb-3">
              {seedId === -1 ? (
                "Based on your votes"
              ) : (
                <>Because you liked <span className="text-stone-700 not-italic font-medium">{seedName}</span></>
              )}
            </h2>
            <div className="grid gap-3">
              {recList.map(([recId, sim]) => {
                const p = getPerfume(recId, catalog, state.scrapedPerfumes);
                if (!p) return null;
                const existingVote = state.votes.find((v) => v.perfumeId === recId);
                return (
                  <PerfumeCard
                    key={recId}
                    perfume={p}
                    action={
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-stone-400 mr-1">
                          {(sim * 100).toFixed(0)}%
                        </span>
                        <button
                          onClick={() => handleVote(recId, "up")}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                            existingVote?.vote === "up"
                              ? "bg-green-100 text-green-700"
                              : "bg-stone-100 text-stone-400 hover:bg-green-50 hover:text-green-600"
                          }`}
                          title="More like this"
                        >
                          &#9650;
                        </button>
                        <button
                          onClick={() => handleVote(recId, "down")}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                            existingVote?.vote === "down"
                              ? "bg-red-100 text-red-700"
                              : "bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-600"
                          }`}
                          title="Not for me"
                        >
                          &#9660;
                        </button>
                      </div>
                    }
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
