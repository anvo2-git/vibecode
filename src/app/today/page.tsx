"use client";

import { useState, useEffect, useMemo } from "react";
import { loadCatalog, loadLookup } from "@/lib/data";
import { PerfumeCard } from "@/components/PerfumeCard";
import { AccordPill } from "@/components/AccordPill";
import type { Perfume } from "@/lib/types";

type WeatherResponse = {
  temperature: number;
  weatherCode: number;
  description: string;
  locationName: string | null;
  lat: number;
  lon: number;
  suggestedAccords: string[];
};

type Status =
  | { kind: "idle" }
  | { kind: "locating" }
  | { kind: "fetching" }
  | { kind: "ready"; weather: WeatherResponse }
  | { kind: "needs-manual" }
  | { kind: "error"; message: string };

export default function TodayPage() {
  const [catalog, setCatalog] = useState<Perfume[]>([]);
  const [lookup, setLookup] = useState<Record<string, number[]>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [placeInput, setPlaceInput] = useState("");

  // Load the static catalog once
  useEffect(() => {
    Promise.all([loadCatalog(), loadLookup()]).then(([c, l]) => {
      setCatalog(c);
      setLookup(l);
    });
  }, []);

  // Try browser geolocation on mount; fall back to manual input on denial
  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus({ kind: "needs-manual" });
      return;
    }
    setStatus({ kind: "locating" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
      },
      () => {
        // User denied or location unavailable — show manual entry
        setStatus({ kind: "needs-manual" });
      },
      { timeout: 8000, maximumAge: 600000 }
    );
  }, []);

  async function fetchWeather(query: string) {
    setStatus({ kind: "fetching" });
    try {
      const res = await fetch(`/api/weather?${query}`);
      const data = await res.json();
      if (!res.ok) {
        setStatus({ kind: "error", message: data.error ?? "Failed to fetch weather" });
        return;
      }
      setStatus({ kind: "ready", weather: data });
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Network error",
      });
    }
  }

  function onManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!placeInput.trim()) return;
    fetchWeather(`place=${encodeURIComponent(placeInput.trim())}`);
  }

  // Rank perfumes: sum of weights across suggested accords; then filter for
  // rating >= 3.5 & at least 100 ratings; top 6.
  const suggestions = useMemo<Perfume[]>(() => {
    if (status.kind !== "ready" || !catalog.length) return [];
    const accords = status.weather.suggestedAccords;

    // Gather candidate IDs via the accord lookup, then unique-ify
    const candidateIds = new Set<number>();
    for (const a of accords) {
      for (const id of lookup[a] ?? []) candidateIds.add(id);
    }

    // Score candidates by summed accord weight, filter by rating quality
    const byId = new Map<number, Perfume>();
    for (const p of catalog) byId.set(p.id, p);

    const scored: { p: Perfume; score: number }[] = [];
    for (const id of candidateIds) {
      const p = byId.get(id);
      if (!p || p.r < 3.5 || p.rc < 100) continue;
      let score = 0;
      for (const a of accords) score += p.aw[a] ?? 0;
      scored.push({ p, score });
    }
    scored.sort((a, b) => b.score - a.score || b.p.r - a.p.r);
    return scored.slice(0, 6).map(({ p }) => p);
  }, [status, catalog, lookup]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-sans font-bold text-3xl md:text-4xl text-violet-900">
          Today&apos;s Scent
        </h1>
        <p className="text-violet-500 mt-2">
          Perfume suggestions tuned to the weather where you are. Powered by{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
          >
            Open-Meteo
          </a>
          .
        </p>
      </div>

      {/* Status / weather card */}
      <div className="mb-8 bg-white border border-violet-200 rounded-lg p-5">
        {status.kind === "idle" || status.kind === "locating" ? (
          <p className="text-violet-500">Getting your location…</p>
        ) : status.kind === "fetching" ? (
          <p className="text-violet-500">Checking the weather…</p>
        ) : status.kind === "needs-manual" ? (
          <div>
            <p className="text-sm text-violet-700 mb-3">
              We couldn&apos;t get your location. Enter a city or postal code instead.
            </p>
            <form onSubmit={onManualSubmit} className="flex gap-2">
              <input
                value={placeInput}
                onChange={(e) => setPlaceInput(e.target.value)}
                placeholder="e.g. Chicago or 10001"
                className="flex-1 px-3 py-2 bg-violet-50 border border-violet-200 rounded-md text-sm text-violet-900 placeholder:text-violet-400 focus:outline-none focus:border-violet-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-violet-900 text-white text-sm hover:bg-violet-700 transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        ) : status.kind === "error" ? (
          <div>
            <p className="text-sm text-rose-600 mb-3">{status.message}</p>
            <form onSubmit={onManualSubmit} className="flex gap-2">
              <input
                value={placeInput}
                onChange={(e) => setPlaceInput(e.target.value)}
                placeholder="Try a city name"
                className="flex-1 px-3 py-2 bg-violet-50 border border-violet-200 rounded-md text-sm text-violet-900 placeholder:text-violet-400 focus:outline-none focus:border-violet-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-violet-900 text-white text-sm hover:bg-violet-700 transition-colors"
              >
                Go
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-4xl font-bold text-violet-900">
                {Math.round(status.weather.temperature)}°C
              </span>
              <span className="text-violet-600">{status.weather.description}</span>
            </div>
            {status.weather.locationName && (
              <p className="text-xs text-violet-400">{status.weather.locationName}</p>
            )}
            <div className="mt-4">
              <p className="text-xs text-violet-500 mb-2 uppercase tracking-wide">
                Suggested accords
              </p>
              <div className="flex flex-wrap gap-2">
                {status.weather.suggestedAccords.map((a) => (
                  <AccordPill key={a} accord={a} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Perfume suggestions */}
      {status.kind === "ready" && suggestions.length > 0 && (
        <div>
          <h2 className="font-sans font-bold text-xl text-violet-900 mb-3">
            Try one of these
          </h2>
          <div className="grid gap-3">
            {suggestions.map((p) => (
              <PerfumeCard key={p.id} perfume={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
