"use client";

import Link from "next/link";
import Image from "next/image";
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
    <nav className="sticky top-0 z-50 bg-[#f5f2ff]/95 backdrop-blur-sm border-b border-violet-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.png" alt="The Common Nose" width={40} height={32} className="h-8 w-auto" />
          <span className="text-xl font-bold text-violet-900">The Common Nose</span>
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
                    ? "bg-violet-700 text-white"
                    : "text-violet-600 hover:text-violet-900 hover:bg-violet-100"
                }`}
              >
                {label}
                {label === "Recs" && pickCount > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] font-medium">
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
