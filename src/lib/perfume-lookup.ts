import type { Perfume } from "./types";

/**
 * Look up a perfume by ID from either the catalog (positive IDs)
 * or scraped perfumes (negative IDs).
 */
export function getPerfume(
  id: number,
  catalog: Perfume[],
  scrapedPerfumes: Perfume[]
): Perfume | undefined {
  if (id >= 0) {
    return catalog[id];
  }
  return scrapedPerfumes.find((p) => p.id === id);
}
