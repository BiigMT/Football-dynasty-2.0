 # Real squads and deeper 3D match presentation

## Real-world squad integration
- Bundles the Premier League's official 2026/27 squad-number snapshot for all 20 clubs (564 player entries).
- New manager/player careers reconcile the real player names and shirt numbers into the generated player pool.
- Existing generated player IDs are preserved; additional registered players use deterministic IDs derived from club and normalized player name.
- Existing saves are not rewritten or migrated by this import.
- The source confirms squad membership and shirt numbers only. Positions, nationality, date of birth, ratings, attributes, wages, contracts and market values remain game-generated until separately verified. They must not be presented as official real-world data.
- Source: https://www.premierleague.com/en/news/4725682/all-20-premier-league-clubs-squad-numbers-for-202627-season (published 22 September 2026).

## Squad management layout
- Team Management now separates the seven matchday substitutes from the complete registered squad.
- The full-squad view shows starters, bench and reserves with status, position, age, fitness and simulated OVR in a scrollable panel.
- A reserve can be promoted into the XI or matchday bench without changing the save schema.

## 3D match presentation
- Adds a presentation-only choreography layer driven by the existing match events and current formation/player state.
- Pass events create a ball flight and move a nearby teammate into the receiving lane.
- Shot events create a longer, higher ball flight toward the existing simulated shot endpoint.
- Tackle and save events move the relevant player rig toward the action area; existing rig action animations remain in use.
- Players now adjust their presentation positions as a connected block based on ball location, player role, pressing style and mentality. Away-side coordinates are mirrored correctly; goalkeepers and defenders retain tighter positional constraints.
- `npm run validate:positioning` checks side mirroring, tactical intensity, keeper restraint and pitch bounds; this check is included in Android CI.
- The choreography never changes the authoritative match simulation, score, player attributes, or save schema.
- This is deeper event-driven 3D presentation, not yet a deterministic physics simulation or per-frame tactical AI.

## Interface constraint
- No match-screen layout, HUD, button, panel, overlay or navigation component is changed by this branch.
- MatchCenter, ConsoleMatchday and PostMatchBroadcast are intentionally untouched.
- The existing match screen remains the same; only the 3D renderer's internal animation is extended.
