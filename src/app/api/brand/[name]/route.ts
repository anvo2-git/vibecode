import { NextResponse } from "next/server";

// GET /api/brand/[name]
// Hits Wikipedia's REST summary endpoint for a perfume house / brand name.
// Called server-side so we can (a) set a polite User-Agent, (b) centralize
// caching later, and (c) swap sources without touching the client.
//
// Returns { title, extract, thumbnail, url } on 200, or { found: false } on
// 404/disambiguation. Never throws to the client for missing pages — niche
// perfume houses legitimately don't have Wikipedia entries.

export const revalidate = 86400; // 24h cache at the CDN edge

type WikiSummary = {
  type?: string;
  title?: string;
  extract?: string;
  thumbnail?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;
  const decoded = decodeURIComponent(name).trim();
  if (!decoded) {
    return NextResponse.json({ found: false }, { status: 400 });
  }

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
    decoded
  )}`;

  try {
    const res = await fetch(url, {
      headers: {
        // Wikipedia asks for an identifiable UA; this is our good-faith attempt.
        "User-Agent": "TheCommonNose/1.0 (perfume recommendation app)",
        Accept: "application/json",
      },
      next: { revalidate: 86400 },
    });

    if (res.status === 404) {
      return NextResponse.json({ found: false });
    }
    if (!res.ok) {
      return NextResponse.json(
        { found: false, error: `wiki_${res.status}` },
        { status: 200 }
      );
    }

    const data = (await res.json()) as WikiSummary;

    // Disambiguation pages aren't useful as brand info
    if (data.type === "disambiguation") {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      title: data.title ?? decoded,
      extract: data.extract ?? "",
      thumbnail: data.thumbnail?.source ?? null,
      url: data.content_urls?.desktop?.page ?? null,
    });
  } catch {
    // Network hiccup — degrade gracefully, the panel will just not render.
    return NextResponse.json({ found: false, error: "network" });
  }
}
