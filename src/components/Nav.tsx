"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/build", label: "Build" },
  { href: "/quiz", label: "Quiz" },
  { href: "/info", label: "Info" },
  { href: "/recommendations", label: "Recs" },
];

export function Nav() {
  const pathname = usePathname();
  const { state } = useApp();
  const pickCount = state.picks.length;

  return (
    <nav className="sticky top-0 z-50 bg-[#f7f5f0]/95 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-medium text-stone-900 hover:text-stone-600 transition-colors">
          The Common Nose
        </Link>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {label}
                {label === "Recs" && pickCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-700 text-white text-[10px] font-medium">
                    {pickCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
