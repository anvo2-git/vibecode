"use client";

import type { Perfume } from "./types";

let catalogCache: Perfume[] | null = null;
let lookupCache: Record<string, number[]> | null = null;

export async function loadCatalog(): Promise<Perfume[]> {
  if (catalogCache) return catalogCache;
  const res = await fetch("/data/perfumes.json");
  catalogCache = await res.json();
  return catalogCache!;
}

export async function loadLookup(): Promise<Record<string, number[]>> {
  if (lookupCache) return lookupCache;
  const res = await fetch("/data/accord-lookup.json");
  lookupCache = await res.json();
  return lookupCache!;
}
