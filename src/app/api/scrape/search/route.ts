import { NextRequest, NextResponse } from "next/server";

/**
 * Search Fragrantica for perfumes matching a query.
 * Returns a list of {name, brand, url} results.
 *
 * Usage: GET /api/scrape/search?q=Sauvage+Dior
 */

export const maxDuration = 30;

async function searchWithPlaywright(query: string) {
  const { firefox } = await import("playwright");
  const browser = await firefox.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const searchUrl = `https://www.fragrantica.com/search/?query=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(3000);

    return await page.evaluate(() => {
      const results: { name: string; brand: string; url: string }[] = [];
      // Fragrantica search results are links to perfume pages
      const links = document.querySelectorAll('a[href*="/perfume/"]');
      const seen = new Set<string>();
      for (const link of links) {
        const href = (link as HTMLAnchorElement).href;
        if (!href.includes("/perfume/") || seen.has(href)) continue;
        // Skip non-perfume links (like brand pages)
        if (!href.match(/\/perfume\/[^/]+\/[^/]+-\d+\.html/)) continue;
        seen.add(href);
        const text = link.textContent?.trim() ?? "";
        if (!text || text.length > 100) continue;
        // Extract brand from URL
        const brandMatch = href.match(/\/perfume\/([^/]+)\//);
        const brand = brandMatch?.[1]?.replace(/-/g, " ") ?? "";
        results.push({ name: text, brand, url: href });
        if (results.length >= 8) break;
      }
      return results;
    });
  } finally {
    await browser.close();
  }
}

async function searchWithPuppeteer(query: string) {
  const puppeteer = (await import("puppeteer-core")).default;
  const sparticuzChromium = (await import("@sparticuz/chromium")).default;
  const browser = await puppeteer.launch({
    args: sparticuzChromium.args,
    defaultViewport: { width: 1280, height: 720 },
    executablePath: await sparticuzChromium.executablePath(),
    headless: true,
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    const searchUrl = `https://www.fragrantica.com/search/?query=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 3000));

    return await page.evaluate(() => {
      const results: { name: string; brand: string; url: string }[] = [];
      const links = document.querySelectorAll('a[href*="/perfume/"]');
      const seen = new Set<string>();
      for (const link of links) {
        const href = (link as HTMLAnchorElement).href;
        if (!href.includes("/perfume/") || seen.has(href)) continue;
        if (!href.match(/\/perfume\/[^/]+\/[^/]+-\d+\.html/)) continue;
        seen.add(href);
        const text = link.textContent?.trim() ?? "";
        if (!text || text.length > 100) continue;
        const brandMatch = href.match(/\/perfume\/([^/]+)\//);
        const brand = brandMatch?.[1]?.replace(/-/g, " ") ?? "";
        results.push({ name: text, brand, url: href });
        if (results.length >= 8) break;
      }
      return results;
    });
  } finally {
    await browser.close();
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { error: "Query too short." },
      { status: 400 }
    );
  }

  try {
    const isVercel = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const results = isVercel
      ? await searchWithPuppeteer(query)
      : await searchWithPlaywright(query);

    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Search scrape error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
