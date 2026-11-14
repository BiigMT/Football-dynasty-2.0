#!/usr/bin/env python3
"""Fetch individually reviewed Pixabay assets on the GitHub Actions runner.

Pixabay media is downloaded into public/ so Vite copies it into the APK. We
never hotlink CDN media at runtime. Each item is fetched from its own page and
the returned MP4 URL is extracted from that page's metadata.
"""
from pathlib import Path
from urllib.request import Request, urlopen
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media" / "pixabay"
OUT.mkdir(parents=True, exist_ok=True)
UA = "Mozilla/5.0 (compatible; FootballDynastyAssetBuilder/1.0)"

def fetch(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urlopen(req, timeout=90) as response:
        return response.read()

def save_image():
    url = "https://cdn.pixabay.com/photo/2016/11/29/02/05/audience-1866738_1280.jpg"
    data = fetch(url)
    if not data.startswith(bytes.fromhex("ffd8ff")):
        raise RuntimeError("Pixabay stadium image response was not a JPEG")
    (OUT / "stadium-audience.jpg").write_bytes(data)
    print(f"Saved stadium-audience.jpg ({len(data)} bytes)")

def save_video(item_id: str, page: str, filename: str):
    html = fetch(page).decode("utf-8", "ignore")
    # Pixabay exposes the downloadable renditions in the individual item's
    # page metadata. Only accept the matching item ID and MP4 CDN host.
    urls = re.findall(r'https?:\\?/\\?/cdn\\.pixabay\\.com/video/[^"\\s<>]+?\\.mp4', html)
    urls += re.findall(r'https?://cdn\.pixabay\.com/video/[^"\\s<>]+?\.mp4', html)
    cleaned = []
    for raw in urls:
        u = raw.replace("\\/", "/").replace("&amp;", "&").rstrip("\\")
        if item_id + "-" in u and u not in cleaned:
            cleaned.append(u)
    if not cleaned:
        raise RuntimeError(f"No downloadable MP4 rendition found on Pixabay item page {page}")
    # Prefer medium to keep the APK lean; otherwise take the smallest named rendition.
    chosen = next((u for u in cleaned if "_medium.mp4" in u), None)
    if not chosen:
        chosen = next((u for u in cleaned if "_small.mp4" in u), cleaned[0])
    data = fetch(chosen)
    if len(data) < 100_000 or not (data[4:8] == b"ftyp" or b"ftyp" in data[:32]):
        raise RuntimeError(f"Pixabay response for {filename} is not a valid MP4")
    (OUT / filename).write_bytes(data)
    print(f"Saved {filename} ({len(data)} bytes) from {page}")

def main():
    errors = []
    try: save_image()
    except Exception as e: errors.append(f"stadium image: {e}")
    videos = [
        ("165713", "https://pixabay.com/videos/fans-stadium-game-football-165713/", "fans-stadium-game.mp4"),
        ("239964", "https://pixabay.com/videos/stadium-arena-football-sports-city-239964/", "stadium-aerial.mp4"),
    ]
    for item_id, page, name in videos:
        try: save_video(item_id, page, name)
        except Exception as e: errors.append(f"{name}: {e}")
    manifest = {
        "source": "Pixabay",
        "offline": True,
        "assets": [
            {"file": p.name, "bytes": p.stat().st_size}
            for p in sorted(OUT.iterdir()) if p.is_file() and p.name != "manifest.json" and p.stat().st_size > 0
        ],
        "downloadErrors": errors,
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\\n")
    print(json.dumps(manifest, indent=2))
    # Do not break APK builds if Pixabay changes its page markup; the app has
    # a local designed fallback. The manifest makes missing files explicit.

if __name__ == "__main__":
    main()
