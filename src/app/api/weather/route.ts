import { NextResponse } from "next/server";

/**
 * GET /api/weather?lat=...&lon=...   (or ?place=Chicago)
 *
 * Server-side proxy to Open-Meteo (free, no auth). Returns current weather
 * plus a list of suggested accord labels derived from the temperature and
 * weather condition. The client uses those labels to filter the local
 * perfume catalog.
 *
 * Called server-side so we can:
 *  - Centralize the accord-mapping logic in one place (easier to tweak)
 *  - Add caching headers later without touching the client
 *  - Swap or combine weather sources without a client release
 */

export const revalidate = 600; // 10 min edge cache per coordinate pair

// WMO weather codes from Open-Meteo: https://open-meteo.com/en/docs
const WEATHER_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Heavy rain showers",
  82: "Violent rain showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

function suggestAccords(tempC: number, code: number): string[] {
  // Base layer: pick by temperature
  let temperatureLayer: string[];
  if (tempC >= 28)        temperatureLayer = ["citrus", "aquatic", "fresh", "marine", "tropical"];
  else if (tempC >= 22)   temperatureLayer = ["white floral", "floral", "fresh", "fruity", "citrus"];
  else if (tempC >= 15)   temperatureLayer = ["floral", "green", "aromatic", "soft spicy", "rose"];
  else if (tempC >= 8)    temperatureLayer = ["woody", "aromatic", "powdery", "musky", "soft spicy"];
  else if (tempC >= 0)    temperatureLayer = ["amber", "oud", "leather", "tobacco", "warm spicy"];
  else                    temperatureLayer = ["amber", "oud", "vanilla", "sweet", "gourmand"];

  // Condition overrides — snow/rain/fog/storm skew the suggestion
  const rainy   = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code);
  const snowy   = [56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(code);
  const foggy   = [45, 48].includes(code);
  const stormy  = [95, 96, 99].includes(code);

  let conditionLayer: string[] = [];
  if (rainy)       conditionLayer = ["aromatic", "green", "earthy", "woody", "mossy"];
  else if (snowy)  conditionLayer = ["amber", "leather", "vanilla", "balsamic", "oud"];
  else if (foggy)  conditionLayer = ["oud", "smoky", "aromatic", "animalic"];
  else if (stormy) conditionLayer = ["leather", "smoky", "oud", "animalic"];

  // Merge, dedupe, preserve order (condition layer first when present)
  return Array.from(new Set([...conditionLayer, ...temperatureLayer]));
}

async function geocode(place: string): Promise<{ lat: number; lon: number; name: string } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    place
  )}&count=1&language=en&format=json`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const data = await res.json();
  const hit = data?.results?.[0];
  if (!hit) return null;
  const locationName = [hit.name, hit.admin1, hit.country_code]
    .filter(Boolean)
    .join(", ");
  return { lat: hit.latitude, lon: hit.longitude, name: locationName };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");
  const place = searchParams.get("place");

  let lat: number | null = null;
  let lon: number | null = null;
  let locationName: string | null = null;

  if (latStr && lonStr) {
    lat = parseFloat(latStr);
    lon = parseFloat(lonStr);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }
  } else if (place) {
    const hit = await geocode(place);
    if (!hit) {
      return NextResponse.json({ error: `Couldn't find "${place}"` }, { status: 404 });
    }
    lat = hit.lat;
    lon = hit.lon;
    locationName = hit.name;
  } else {
    return NextResponse.json(
      { error: "Provide either lat+lon or place" },
      { status: 400 }
    );
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius`;

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      return NextResponse.json({ error: `open-meteo ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const tempC = data?.current?.temperature_2m as number | undefined;
    const code = data?.current?.weather_code as number | undefined;

    if (tempC === undefined || code === undefined) {
      return NextResponse.json({ error: "open-meteo missing fields" }, { status: 502 });
    }

    return NextResponse.json({
      temperature: tempC,
      weatherCode: code,
      description: WEATHER_DESCRIPTIONS[code] ?? "Unknown",
      locationName,
      lat,
      lon,
      suggestedAccords: suggestAccords(tempC, code),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "fetch failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
