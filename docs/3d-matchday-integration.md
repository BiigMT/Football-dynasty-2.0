# 3D Matchday integration

## Existing simulation remains authoritative

The renderer is a presentation layer. It does not call or replace `simulateNextMinute`, `startMatchKickoff`, `makeMatchSubstitution`, or any match rules. `MatchCenter` continues to own the existing `MatchSession` and passes its latest snapshot to `ConsoleMatchday` / `Stadium3D`.

## Existing props in this repository

The repository does not currently expose a `players[]` array to the match screen. It exposes:

```ts
session: MatchSession
homeClub: Club
awayClub: Club
players: Record<string, Player>
```

Use the record directly; it is keyed by stable player ID. Do not create a second roster or rewrite career-save player IDs.

```tsx
<Stadium3D
  session={session}
  homeClub={clubs[session.homeClubId]}
  awayClub={clubs[session.awayClubId]}
  players={players}
  cameraMode="TV"
/>
```

The live screen already performs this wiring through `MatchCenter`.

## Coordinate mapping

The engine's ball is `session.ballPos` in normalized 0–100 pitch coordinates. Stadium3D maps it to the 105m × 68m field exactly as follows:

```ts
worldX = ((session.ballPos.x / 100) - 0.5) * 105;
worldZ = ((session.ballPos.y / 100) - 0.5) * 68;
```

The ball's target position is interpolated in the render loop. The existing simulation remains responsible for its logical `x/y`; the 3D renderer derives a visual arc from movement between snapshots.

## Current player-position limitation

`PlayerMatchState` currently contains `slotIndex`, stamina, rating and match actions, but no per-player normalized `x/y` coordinates. The renderer therefore builds initial positions from `getFormationCoordinates(formation)` and animates presentation movement toward the ball. This is deliberately not written back to the simulation. Authentic player tracking, passing lanes, tackles and shot trajectories need a future engine contract that emits player positions and discrete action trajectories.

## Camera and fallback

- `TV`: elevated sideline broadcast camera.
- `DUGOUT`: lower touchline camera.
- `2D`: the existing `MatchPitchCanvas` is rendered instead of WebGL.
- If WebGL cannot initialise, the 2D tactical view remains available through the HUD camera selector.

## Performance and persistence

The renderer caps device pixel ratio at 1.5, disables antialiasing, uses instanced crowd geometry and keeps the simulation out of the render loop. Device profiling is still required on low-, mid- and high-tier Android hardware before claiming 60 FPS.

The project currently uses Firebase for saves; Supabase is not an active game persistence integration. Do not add a Supabase sync path until the data architecture is deliberately changed. Any future remote match-stat upload should be batched at half-time and full-time, never per animation frame.
