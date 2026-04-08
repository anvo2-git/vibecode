import { NextRequest, NextResponse } from "next/server";

/**
 * Scrape a Fragrantica perfume page using a headless browser.
 * Cloudflare blocks plain fetch, so we need a real browser to pass the JS challenge.
 *
 * - On Vercel: uses @sparticuz/chromium + puppeteer-core
 * - Locally: uses Playwright's managed Chromium (npx playwright install)
 *
 * Usage: GET /api/scrape?url=https://www.fragrantica.com/perfume/Brand/Name-123.html
 */

export const maxDuration = 30;

async function scrapeWithPlaywright(url: string) {
  const { firefox } = await import("playwright");
  const browser = await firefox.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    // Wait a bit for dynamic content (accord bars) to render
    await page.waitForTimeout(3000);
    return await extractData(page);
  } finally {
    await browser.close();
  }
}

async function scrapeWithPuppeteer(url: string) {
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
    await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 });
    return await extractData(page);
  } finally {
    await browser.close();
  }
}

// Works with both Playwright and Puppeteer page objects (both support .evaluate)
async function extractData(page: { evaluate: (fn: () => unknown) => Promise<unknown> }) {
  return (await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const fullName =
      h1?.textContent?.trim() ?? document.title.split(" - ")[0]?.trim() ?? "";

    const bodyText = document.body.textContent ?? "";
    let gender = "";
    if (bodyText.includes("for women and men")) gender = "for women and men";
    else if (bodyText.includes("for women")) gender = "for women";
    else if (bodyText.includes("for men")) gender = "for men";

    const accords: Record<string, number> = {};
    const styledDivs = document.querySelectorAll('[style*="width"]');
    for (const div of styledDivs) {
      const text = div.textContent?.trim();
      const style = div.getAttribute("style") ?? "";
      const widthMatch = style.match(/width:\s*([\d.]+)/);
      if (
        text &&
        widthMatch &&
        text.length < 30 &&
        !text.includes("\n") &&
        parseFloat(widthMatch[1]) > 5
      ) {
        accords[text.toLowerCase()] = Math.round(parseFloat(widthMatch[1]));
      }
    }

    const ratingEl = document.querySelector('[itemprop="ratingValue"]');
    const rating = ratingEl
      ? parseFloat(ratingEl.getAttribute("content") ?? ratingEl.textContent ?? "0")
      : 0;

    const ratingCountEl = document.querySelector('[itemprop="ratingCount"]');
    const ratingCount = ratingCountEl
      ? parseInt(ratingCountEl.getAttribute("content") ?? ratingCountEl.textContent ?? "0")
      : 0;

    return { fullName, gender, accords, rating, ratingCount };
  })) as { fullName: string; gender: string; accords: Record<string, number>; rating: number; ratingCount: number };
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url || !url.includes("fragrantica.com/perfume/")) {
    return NextResponse.json(
      { error: "Invalid URL. Must be a Fragrantica perfume page." },
      { status: 400 }
    );
  }

  try {
    const isVercel = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const data = isVercel
      ? await scrapeWithPuppeteer(url)
      : await scrapeWithPlaywright(url);

    const brandMatch = url.match(/\/perfume\/([^/]+)\//);
    const brand = brandMatch?.[1]?.replace(/-/g, " ") ?? "";

    let name = data.fullName;
    if (brand) name = name.replace(new RegExp(brand, "i"), "").trim();
    if (data.gender) name = name.replace(data.gender, "").trim();

    return NextResponse.json({
      name: name || data.fullName,
      brand,
      gender: data.gender,
      rating: data.rating,
      ratingCount: data.ratingCount,
      accords: data.accords,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Scrape error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
