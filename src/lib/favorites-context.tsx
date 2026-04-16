"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useSupabase } from "@/lib/supabase/client";

interface FavoritesContextValue {
  favoriteIds: Set<number>;
  addFavorite: (perfumeId: number) => void;
  removeFavorite: (perfumeId: number) => void;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { userId } = useAuth();
  const supabase = useSupabase();
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch favorites on sign-in
  useEffect(() => {
    if (!userId) {
      setFavoriteIds(new Set());
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    supabase
      .from("favorites")
      .select("perfume_id")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.warn("Failed to load favorites:", error.message);
        } else {
          setFavoriteIds(new Set((data ?? []).map((r) => Number(r.perfume_id))));
        }
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, supabase]);

  const addFavorite = useCallback(
    (perfumeId: number) => {
      if (!userId) return;

      // Optimistic update
      setFavoriteIds((prev) => new Set(prev).add(perfumeId));

      supabase
        .from("favorites")
        .insert({ perfume_id: String(perfumeId) })
        .then(({ error }) => {
          if (error) {
            console.warn("Failed to add favorite:", error.message);
            // Revert on failure
            setFavoriteIds((prev) => {
              const next = new Set(prev);
              next.delete(perfumeId);
              return next;
            });
          }
        });
    },
    [userId, supabase],
  );

  const removeFavorite = useCallback(
    (perfumeId: number) => {
      if (!userId) return;

      // Optimistic update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(perfumeId);
        return next;
      });

      supabase
        .from("favorites")
        .delete()
        .eq("perfume_id", String(perfumeId))
        .then(({ error }) => {
          if (error) {
            console.warn("Failed to remove favorite:", error.message);
            // Revert on failure
            setFavoriteIds((prev) => new Set(prev).add(perfumeId));
          }
        });
    },
    [userId, supabase],
  );

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, addFavorite, removeFavorite, isLoading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
