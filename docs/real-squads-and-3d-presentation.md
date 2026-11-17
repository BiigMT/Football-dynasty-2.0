# Verified real squads and 3D match presentation

Snapshot date: 17 November 2026.

## European roster coverage

The new-career player database now maps **96 club squads and 2,745 player entries** across the five current game leagues:
- Premier League: 20 clubs (564 players)
- LaLiga: 20 clubs
- Serie A: 20 clubs
- Bundesliga: 18 clubs
- Ligue 1: 18 clubs

The 76 non-Premier-League European mappings (LaLiga 20, Serie A 20, Bundesliga 18 and Ligue 1 18) are in the European roster dataset; the Premier League's 20 clubs and 564 entries are in its separate official squad dataset. The three leagues requested for expansion use their real competition formats: Serie A 20, Bundesliga 18 and Ligue 1 18. The game database already has these club slots; the roster importer now covers every one of those club IDs.

Roster names and shirt numbers are imported only when present in the cited roster or registration source. Official club first-team pages are preferred. UEFA squad registration pages are used for clubs where accessible. AJ Auxerre and RC Strasbourg currently rely on independent roster listings cross-checked with official club/league announcements; those two sources are explicitly flagged in the source register. Shirt numbers are omitted where source evidence is missing or conflicting.

The importer does not fabricate player ratings, positions, nationality, birth dates, wages, contracts, potential or technical attributes. Those remain game-generated until reliable data sources are licensed and integrated.

## Player-career integration and saves

- The squad importer is wired into the initial career database build. Newly created player careers receive the real names and verified shirt numbers mapped to the correct existing club IDs.
- Existing generated player IDs are preserved where a generated player record is matched.
- Existing career saves are not rewritten or migrated. The roster import affects new careers, not already-saved careers.
- Real-world roster identities are separate from game-generated player ratings and simulation attributes.

## 3D match presentation

- Players use acceleration, braking and stamina/speed-scaled steering.
- Soft separation reduces overlapping player rigs while respecting pitch bounds.
- The presentation ball uses inertia, ground friction, player-body deflection, impact bounce, spin and pitch-boundary rebounds.
- Scripted pass/shot flights remain presentation cues; the match engine remains authoritative for possession, shots, goals and results.

## Preserved interface constraints

- No match-screen layout, HUD, buttons, panels, overlays or navigation changes.
- Squad depth and roster management remain outside the match screen.
- Production is not changed by this pull request.

## Validation

CI checks TypeScript, all roster mappings and duplicate shirt numbers, 3D positioning/physics, production web build and Android debug APK assembly.