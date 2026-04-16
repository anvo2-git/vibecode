"use client";

import { AppProvider } from "@/lib/context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { Nav } from "@/components/Nav";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <FavoritesProvider>
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-violet-200 py-6 text-center text-xs text-violet-400">
          The Common Nose — Built by Ian Vo
        </footer>
      </FavoritesProvider>
    </AppProvider>
  );
}
