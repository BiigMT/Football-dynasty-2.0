import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });
const requestWindows = new Map<string, { start: number; count: number }>();

function allowRequest(ip: string): boolean {
  const now = Date.now();
  const current = requestWindows.get(ip);
  if (!current || now - current.start >= 10 * 60 * 1000) {
    requestWindows.set(ip, { start: now, count: 1 });
    return true;
  }
  if (current.count >= 20) return false;
  current.count += 1;
  return true;
}
const clean = (value: unknown, max = 300) =>
  typeof value === "string"
    ? value.trim().replace(/[<>\u0000-\u001f]/g, "").slice(0, max)
    : "";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
function matchesNamedEntity(name: string, title: string, description: string): boolean {
  const wanted = normalize(name);
  const haystack = `${normalize(title)} ${normalize(description)}`;
  if (!wanted) return false;
  if (haystack.includes(wanted)) return true;
  const tokens = wanted.split(" ").filter((token) => token.length > 1);
  return tokens.length > 0 && tokens.every((token) => haystack.includes(token));
}
function isCCBYSA40(licenseName: string, licenseUrl: string): boolean {
  const name = licenseName.trim().toLowerCase().replace(/\s+/g, " ");
  const url = licenseUrl.trim().replace(/\\/+$/, "").toLowerCase();
  const exactName = name === "cc by-sa 4.0" ||
    name === "creative commons attribution-sharealike 4.0 international" ||
    name === "creative commons attribution-share alike 4.0 international";
  return exactName && url === "https://creativecommons.org/licenses/by-sa/4.0";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (!allowRequest(ip)) return json({ error: "Media lookup limit reached. Try again later." }, 429);

  try {
    const payload = await req.json();
    const entityType = payload?.entity_type;
    const entityId = clean(payload?.entity_id, 120);
    const entityName = clean(payload?.entity_name, 120);
    if (!["player", "club"].includes(entityType) || !entityId || !entityName) {
      return json({ error: "A valid entity_type, entity_id and entity_name are required." }, 400);
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(entityId)) return json({ error: "Invalid entity ID." }, 400);

    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    if (!secretKeys.default) return json({ error: "Server storage key is not configured." }, 500);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, secretKeys.default);

    const { data: cached, error: cacheError } = await supabase.from("game_media")
      .select("entity_type,entity_id,storage_path,alt_text,source_url,license_name,license_url,author_name,attribution,source_page_url")
      .eq("entity_type", entityType).eq("entity_id", entityId).maybeSingle();
    if (cacheError) throw cacheError;
    if (cached && isCCBYSA40(cached.license_name ?? "", cached.license_url ?? "")) {
      const bucket = entityType === "player" ? "player-photos" : "club-photos";
      const { data } = supabase.storage.from(bucket).getPublicUrl(cached.storage_path);
      return json({ status: "cached", ...cached, image_url: data.publicUrl });
    }

    // Search by the exact entity name; do not accept a merely football-related image.
    const params = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `filetype:bitmap "${entityName}"`,
      gsrnamespace: "6",
      gsrlimit: "50",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "640",
      format: "json",
      origin: "*",
    });
    const commonsResponse = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, {
      headers: { "User-Agent": "FootballDynasty/2.0 (verified named game media)" },
    });
    if (!commonsResponse.ok) throw new Error("Wikimedia Commons search failed.");
    const commons = await commonsResponse.json();
    const pages = Object.values(commons?.query?.pages ?? {}) as any[];

    const candidates = pages.map((page) => {
      const info = page.imageinfo?.[0];
      const meta = info?.extmetadata ?? {};
      const license = clean(meta.LicenseShortName?.value, 150);
      const author = clean(meta.Artist?.value?.replace(/<[^>]*>/g, ""), 200);
      const licenseUrl = clean(meta.LicenseUrl?.value, 500);
      const description = clean(meta.ImageDescription?.value?.replace(/<[^>]*>/g, ""), 500);
      const title = clean(page.title, 300);
      const width = Number(info?.width ?? 0);
      const height = Number(info?.height ?? 0);
      const ratio = height > 0 ? width / height : 0;
      const portraitShape = entityType !== "player" || (ratio >= 0.55 && ratio <= 1.35 && height >= 240);
      const nameMatch = entityType === "player"
        ? normalize(title).includes(normalize(entityName))
        : matchesNamedEntity(entityName, title, description);
      const score = (normalize(title).includes(normalize(entityName)) ? 100 : 0) -
        (entityType === "player" ? Math.abs(ratio - 0.82) * 10 : 0);
      return { page, info, license, author, licenseUrl, description, title, portraitShape, nameMatch, score };
    }).filter((item) =>
      item.info?.thumburl && isCCBYSA40(item.license, item.licenseUrl) &&
      item.nameMatch && item.portraitShape
    ).sort((a, b) => b.score - a.score);

    if (!candidates.length) return json({
      status: "not_found",
      message: "No matching photograph under the exact CC BY-SA 4.0 licence was found. Other licence versions and generic football photos are not accepted.",
    });

    const chosen = candidates[0];
    const imageResponse = await fetch(chosen.info.thumburl, {
      headers: { "User-Agent": "FootballDynasty/2.0 (verified named game media)" },
    });
    if (!imageResponse.ok) throw new Error("Could not download the selected Commons image.");
    const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
    if (imageBytes.byteLength < 1000 || imageBytes.byteLength > 5 * 1024 * 1024) {
      return json({ status: "not_found", message: "The candidate image was outside the supported size range." });
    }
    const contentType = (imageResponse.headers.get("content-type") ?? "").split(";")[0].toLowerCase();
    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" :
      contentType === "image/jpeg" ? "jpg" : null;
    if (!ext) return json({ status: "not_found", message: "The candidate image format is not supported." });

    const bucket = entityType === "player" ? "player-photos" : "club-photos";
    const storagePath = `${entityId}.${ext}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, imageBytes, {
      contentType, cacheControl: "31536000", upsert: true,
    });
    if (uploadError) throw uploadError;

    const fileTitle = String(chosen.page.title ?? "").replace(/^File:/, "");
    const sourcePageUrl = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(fileTitle.replace(/ /g, "_"))}`;
    const attribution = [chosen.author, chosen.license, "Wikimedia Commons"].filter(Boolean).join(" · ");
    const row = {
      entity_type: entityType,
      entity_id: entityId,
      storage_path: storagePath,
      alt_text: chosen.description || `${entityName} ${entityType === "player" ? "portrait" : "club crest"}`,
      source_url: chosen.info.descriptionurl ?? sourcePageUrl,
      source_page_url: sourcePageUrl,
      license_name: chosen.license,
      license_url: chosen.licenseUrl,
      author_name: chosen.author || null,
      attribution,
      checked_at: new Date().toISOString(),
    };
    const { error: insertError } = await supabase.from("game_media").upsert(row, {
      onConflict: "entity_type,entity_id",
    });
    if (insertError) throw insertError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return json({ status: "uploaded", ...row, image_url: data.publicUrl });
  } catch (error) {
    console.error("sync-game-media:", error);
    return json({ error: error instanceof Error ? error.message : "Media sync failed." }, 500);
  }
});
