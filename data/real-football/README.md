# Football Dynasty real-world data pack

## Scope

Initial 2026/27 release scope: the five major European first divisions already represented by the game:
- Premier League (England) — 20 clubs
- LaLiga (Spain) — 20 clubs
- Serie A (Italy) — 20 clubs
- Bundesliga (Germany) — 18 clubs
- Ligue 1 (France) — 18 clubs

Target coverage: 96 clubs and their current first-team squads. Existing club IDs and save-game references must remain stable when names and metadata are corrected.

## Data rules

- Keep real-world facts separate from simulated game ratings. Do not present generated OVR, potential, wages, market values, form or attributes as official real-world statistics.
- Store a source URL and checked date for each imported club roster.
- Keep player names, date of birth/age, nationality, position and shirt number where a reliable source provides them. Unknown fields stay null; do not guess.
- Include first-team and eligible U21 players only when the source explicitly identifies them. Record loans and loan parent clubs.
- Reconcile transfers against official club/league announcements before publishing an update.
- Keep the season label and data snapshot date visible in game information.
- Do not overwrite an existing player identity silently. Use stable source IDs where available and a reviewed name/club matching map for legacy saves.

## Offline photography policy

Only ship an image when its exact file page and licence permit redistribution inside a downloadable game APK. Preferred licences: CC0, Public Domain, CC BY or CC BY-SA. Do not use CC BY-NC, CC BY-ND, unclear licences, social-media profile images, club press photos, or search thumbnails as proof of permission.

For every portrait, record:
- player ID and local asset path
- original file/page URL
- creator/photographer
- exact licence name and version
- licence URL
- whether the image was cropped or modified
- date checked

Include attribution notices in the app's credits screen and a bundled text file. If no compliant photo is available, use the existing locally generated portrait. Never hotlink a portrait; the app must render it offline.

## Import and release checklist

1. Import and validate club identities and season membership.
2. Import rosters with provenance and check duplicate player identities.
3. Validate positions, shirt numbers, ages and club assignments.
4. Attach only individually verified, redistributable portrait assets.
5. Generate the offline asset manifest and attribution file.
6. Run TypeScript, web build, save-compatibility checks and Android APK verification.
7. Publish a snapshot date and data changelog.
