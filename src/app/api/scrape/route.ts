import { NextRequest, NextResponse } from "next/server";

/**
 * Scrape a Fragrantica perfume page to extract accords, name, brand, gender.
 * This runs server-side to avoid CORS issues.
 *
 * Usage: GET /api/scrape?url=https://www.fragrantica.com/perfume/Brand/Name-123.html
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !url.includes("fragrantica.com/perfume/")) {
    return NextResponse.json(
      { error: "Invalid URL. Must be a Fragrantica perfume page." },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${res.status}` },
        { status: 502 }
      );
    }

    const html = await res.text();

    // Extract perfume name from <h1>
    const nameMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const fullName = nameMatch?.[1]?.trim() ?? "";

    // Extract brand from URL
    const brandMatch = url.match(/\/perfume\/([^/]+)\//);
    const brand = brandMatch?.[1]?.replace(/-/g, " ") ?? "";

    // Extract gender
    let gender = "";
    if (html.includes("for women and men")) gender = "for women and men";
    else if (html.includes("for women")) gender = "for women";
    else if (html.includes("for men")) gender = "for men";

    const name = fullName.replace(brand, "").replace(gender, "").trim();

    // Extract accords from the accord bars
    // Fragrantica renders accords as divs with style widths
    const accordPattern =
      /<div[^>]*class="[^"]*accord-bar[^"]*"[^>]*style="[^"]*width:\s*([\d.]+)%[^"]*"[^>]*>[\s\S]*?<div[^>]*class="[^"]*accord-name[^"]*"[^>]*>([^<]+)<\/div>/gi;
    const accords: Record<string, number> = {};
    let match;
    while ((match = accordPattern.exec(html)) !== null) {
      const weight = parseFloat(match[1]);
      const accordName = match[2].trim().toLowerCase();
      if (accordName && weight > 0) {
        accords[accordName] = Math.round(weight);
      }
    }

    // Fallback: try to find accords from vote bars (different HTML structure)
    if (Object.keys(accords).length === 0) {
      const votePattern =
        /<div[^>]*style="[^"]*width:\s*([\d.]+)(?:px|%)[^"]*"[^>]*>\s*<div[^>]*>([^<]+)<\/div>/gi;
      while ((match = votePattern.exec(html)) !== null) {
        const weight = parseFloat(match[1]);
        const accordName = match[2].trim().toLowerCase();
        if (
          accordName &&
          weight > 0 &&
          !accordName.includes("<") &&
          accordName.length < 30
        ) {
          accords[accordName] = Math.min(100, Math.round(weight));
        }
      }
    }

    // Extract rating
    const ratingMatch = html.match(/itemprop="ratingValue"[^>]*content="([\d.]+)"/);
    const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;

    const ratingCountMatch = html.match(
      /itemprop="ratingCount"[^>]*content="(\d+)"/
    );
    const ratingCount = ratingCountMatch ? parseInt(ratingCountMatch[1]) : 0;

    return NextResponse.json({
      name: name || fullName,
      brand,
      gender,
      rating,
      ratingCount,
      accords,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Scrape failed: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
