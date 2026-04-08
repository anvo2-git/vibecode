"use client";

import { useState, useEffect, use } from "react";
import { loadCatalog, loadLookup } from "@/lib/data";
import { recommendForSeed } from "@/lib/similarity";
import { useApp } from "@/lib/context";
import { AccordPill } from "@/components/AccordPill";
import { PerfumeCard } from "@/components/PerfumeCard";
import { GENDER_SYMBOL } from "@/lib/accords";
import { getPerfume } from "@/lib/perfume-lookup";
import type { Perfume } from "@/lib/types";

export default function PerfumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { state, dispatch } = useApp();
  const [catalog, setCatalog] = useState<Perfume[]>([]);
  const [lookup, setLookup] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState<Perfume[]>([]);
  const [notes, setNotes] = useState("");
  const [userRating, setUserRating] = useState<number | null>(null);

  const perfumeId = parseInt(id, 10);
  const perfume = getPerfume(perfumeId, catalog, state.scrapedPerfumes) ?? null;
  const isPicked = state.picks.some((p) => p.perfumeId === perfumeId);

  useEffect(() => {
    Promise.all([loadCatalog(), loadLookup()]).then(([c, l]) => {
      setCatalog(c);
      setLookup(l);
      setLoading(false);
    });
  }, []);

  // Load personal notes from context
  useEffect(() => {
    const existing = state.personalNotes[perfumeId];
    if (existing) {
      setNotes(existing.notes);
      setUserRating(existing.rating);
    }
  }, [state.personalNotes, perfumeId]);

  // Compute similar perfumes
  useEffect(() => {
    if (!perfume || !catalog.length) return;
    const exclude = new Set([perfumeId]);
    const recs = recommendForSeed(perfume, catalog, lookup, exclude, 5);
    setSimilar(recs.map(([recId]) => getPerfume(recId, catalog, state.scrapedPerfumes)).filter(Boolean) as Perfume[]);
  }, [perfume, catalog, lookup, perfumeId]);

  function saveNote() {
    dispatch({
      type: "SET_PERSONAL_NOTE",
      perfumeId,
      note: { notes, rating: userRating },
    });
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-stone-500">
        Loading...
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-stone-500">
        Perfume not found.
      </div>
    );
  }

  const accords = Object.entries(perfume.aw)
    .sort((a, b) => b[1] - a[1])
    .map(([name, weight]) => ({ name, weight }));

  const genderSym = GENDER_SYMBOL[perfume.g] ?? "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-stone-900">
              {perfume.n}
              {genderSym && <span className="text-stone-400 ml-2 text-2xl">{genderSym}</span>}
            </h1>
            {perfume.b && (
              <p className="text-stone-500 mt-1">{perfume.b}</p>
            )}
          </div>
          <button
            onClick={() =>
              isPicked
                ? dispatch({ type: "REMOVE_PICK", perfumeId })
                : dispatch({ type: "ADD_PICK", perfumeId })
            }
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isPicked
                ? "border border-stone-300 text-stone-600 hover:bg-stone-100"
                : "bg-stone-900 text-white hover:bg-stone-700"
            }`}
          >
            {isPicked ? "Remove from Picks" : "+ Add to Picks"}
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3 text-sm text-stone-500">
          <span className="font-medium text-stone-700">{perfume.r.toFixed(1)} / 5</span>
          <span className="text-stone-300">|</span>
          <span>{perfume.rc.toLocaleString()} ratings</span>
          {perfume.g && (
            <>
              <span className="text-stone-300">|</span>
              <span className="capitalize">{perfume.g}</span>
            </>
          )}
        </div>
      </div>

      {/* Accords */}
      <div className="mb-8">
        <h2 className="font-serif text-xl font-medium text-stone-900 mb-3">Accords</h2>
        <div className="space-y-2">
          {accords.map(({ name, weight }, i) => (
            <div key={name} className="flex items-center gap-3">
              <AccordPill accord={name} large={i < 2} />
              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-stone-400 rounded-full transition-all"
                  style={{ width: `${weight}%` }}
                />
              </div>
              <span className="text-xs text-stone-400 w-8 text-right">{weight}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Notes Form */}
      <div className="mb-8 bg-white border border-stone-200 rounded-lg p-5">
        <h2 className="font-serif text-xl font-medium text-stone-900 mb-3">Your Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your personal notes about this perfume..."
          rows={3}
          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-md text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 resize-none"
        />
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500">Your rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star === userRating ? null : star)}
                  className={`w-7 h-7 rounded-full text-sm transition-colors ${
                    userRating && star <= userRating
                      ? "bg-stone-900 text-white"
                      : "bg-stone-100 text-stone-400 hover:bg-stone-200"
                  }`}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={saveNote}
            className="ml-auto px-4 py-1.5 rounded-md bg-stone-900 text-white text-sm hover:bg-stone-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Similar Perfumes */}
      {similar.length > 0 && (
        <div>
          <h2 className="font-serif text-xl font-medium text-stone-900 mb-3">Similar Perfumes</h2>
          <div className="grid gap-3">
            {similar.map((p) => (
              <PerfumeCard key={p.id} perfume={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
