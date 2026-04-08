"use client";

import { useState, useEffect, useMemo } from "react";
import { loadCatalog } from "@/lib/data";
import { ACCORD_FAMILIES } from "@/lib/accords";
import { AccordPill } from "@/components/AccordPill";
import { ACCORD_INFO } from "@/lib/accord-info";
import type { Perfume } from "@/lib/types";

/** Compute co-occurrence: for each accord, which other accords appear alongside it most often */
function computeCoOccurrence(catalog: Perfume[]): Record<string, { accord: string; pct: number }[]> {
  const counts: Record<string, number> = {};
  const cooccur: Record<string, Record<string, number>> = {};

  for (const p of catalog) {
    const accords = Object.keys(p.aw);
    for (const a of accords) {
      counts[a] = (counts[a] || 0) + 1;
      if (!cooccur[a]) cooccur[a] = {};
      for (const b of accords) {
        if (a !== b) cooccur[a][b] = (cooccur[a][b] || 0) + 1;
      }
    }
  }

  const result: Record<string, { accord: string; pct: number }[]> = {};
  for (const [accord, co] of Object.entries(cooccur)) {
    const total = counts[accord] || 1;
    result[accord] = Object.entries(co)
      .map(([name, count]) => ({ accord: name, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6);
  }
  return result;
}

export default function InfoPage() {
  const [catalog, setCatalog] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAccord, setExpandedAccord] = useState<string | null>(null);
  const [familyFilter, setFamilyFilter] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog().then((c) => {
      setCatalog(c);
      setLoading(false);
    });
  }, []);

  const coOccurrence = useMemo(() => {
    if (catalog.length === 0) return {};
    return computeCoOccurrence(catalog);
  }, [catalog]);

  const accordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of catalog) {
      for (const a of Object.keys(p.aw)) {
        counts[a] = (counts[a] || 0) + 1;
      }
    }
    return counts;
  }, [catalog]);

  const families = Object.keys(ACCORD_FAMILIES);

  const displayedAccords = familyFilter
    ? ACCORD_INFO.filter((a) => a.family === familyFilter)
    : ACCORD_INFO;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-stone-900 mb-2">
          Accord Encyclopedia
        </h1>
        <p className="text-stone-500">
          Learn what each accord smells like, the notes that define it, and which other accords it&apos;s commonly paired with.
        </p>
      </div>

      {/* Family filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFamilyFilter(null)}
          className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
            familyFilter === null
              ? "bg-stone-900 text-white"
              : "bg-stone-100 text-stone-500 hover:text-stone-700"
          }`}
        >
          All
        </button>
        {families.map((f) => (
          <button
            key={f}
            onClick={() => setFamilyFilter(familyFilter === f ? null : f)}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              familyFilter === f
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-500 hover:text-stone-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Accord cards */}
      <div className="space-y-3">
        {displayedAccords.map((info) => {
          const isExpanded = expandedAccord === info.name;
          const count = accordCounts[info.name] ?? 0;
          const coAccords = coOccurrence[info.name] ?? [];

          return (
            <div
              key={info.name}
              className="bg-white border border-stone-200 rounded-lg overflow-hidden transition-all"
            >
              {/* Header — always visible */}
              <button
                onClick={() => setExpandedAccord(isExpanded ? null : info.name)}
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-stone-50 transition-colors"
              >
                <AccordPill accord={info.name} large />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-600 truncate">{info.spikedWith}</p>
                </div>
                {!loading && (
                  <span className="text-xs text-stone-400 flex-shrink-0">
                    {count.toLocaleString()} perfumes
                  </span>
                )}
                <span className={`text-stone-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                  &#9660;
                </span>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-stone-100 pt-4 space-y-4">
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {info.description}
                  </p>

                  {/* Common notes */}
                  <div>
                    <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">
                      Common Notes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {info.commonNotes.map((note) => (
                        <span
                          key={note}
                          className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-xs"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Co-occurring accords */}
                  {coAccords.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-2">
                        Commonly Found With
                      </h3>
                      <div className="space-y-1.5">
                        {coAccords.map(({ accord, pct }) => (
                          <div key={accord} className="flex items-center gap-3">
                            <AccordPill accord={accord} />
                            <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-stone-300 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-stone-400 w-10 text-right">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
