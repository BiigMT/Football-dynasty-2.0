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


## 3D movement and presentation physics (17 Nov 2026)

- Player rigs now use acceleration and braking rather than direct positional interpolation.
- Movement speed is scaled by the player's simulated speed attribute and current match stamina.
- A soft separation force discourages overlapping player rigs while keeping all movement inside pitch bounds.
- The presentation ball now uses target steering with inertia, ground friction, player-body contact deflection, small impact bounces and pitch-boundary rebounds; spin follows movement speed. Scripted event flights remain presentation cues.
- These changes do not modify match outcomes, player attributes, save data or match-screen UI.
- Automated steering, braking and separation checks run through npm run validate:physics in Android CI.


## African club squad verification (17 Nov 2026)

Three African first-team squads are now manually cross-checked against current official club roster pages: Al Ahly (34 players), Espérance Sportive de Tunis (32) and Enyimba FC (22), for 88 player entries. The CI validator checks their source URLs, club mappings, roster integrity and expected source-list counts. Shirt numbers are only imported where the official page publishes them.

Sources:
- Al Ahly: https://www.alahlyegypt.com/en/football/first-team
- Espérance: https://est.org.tn/fr/equipe-premiere
- Enyimba: https://enyimbafc.net/first-team/

## European squad expansion (2026/27 snapshot checked 17 Nov 2026)

The importer now includes **43 in-game club mappings and 1,167 verified player entries**:
- LaLiga (19/20): Real Madrid, FC Barcelona, Athletic Club, Atlético de Madrid, Sevilla, Valencia, Real Sociedad, Real Betis, Celta, Espanyol, Getafe, Levante, Rayo Vallecano, Racing de Santander, RC Deportivo, Málaga, Villarreal, Osasuna and Deportivo Alavés.
- Serie A (8/8): Juventus, Inter, AC Milan, Napoli, Roma, Atalanta, Lazio and Fiorentina.
- Bundesliga (8/8): Bayern München, Borussia Dortmund, Leverkusen, RB Leipzig, Eintracht Frankfurt, Stuttgart, Freiburg and Borussia Mönchengladbach.
- Ligue 1 (8/8): Paris Saint-Germain, Marseille, Monaco, Nice, Lens, Rennes, Olympique Lyonnais and LOSC Lille.

The data stores source URLs and a 17 Nov 2026 snapshot date. Most entries come from current club first-team roster pages or official club squad-number releases. Alavés, Lyon and Lille use official UEFA squad registrations; those are verified competition-registration lists and should not be represented as exhaustive domestic first-team rosters. Only player names and published shirt numbers are imported; conflicting or unpublished numbers are omitted rather than guessed. Ratings, positions, nationality, DOB, contracts and attributes remain game-generated.

Elche CF is the one remaining in-game club without a complete accessible official roster list. No names have been guessed to fill that gap.
