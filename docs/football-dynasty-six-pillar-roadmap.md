# Football Dynasty 2.0 — Six-Pillar Football Universe

## Product direction

Build Football Dynasty into a connected, evolving football universe while preserving the current published game's visual language and landscape-first mobile experience. All work is additive and save-compatible. Existing careers must continue loading; new systems must initialize safely for both new and older saves.

## Existing foundations (do not rebuild these)

The current codebase already contains meaningful pieces of several pillars:
- **Living world:** weekly fixture simulation, manager job offers, board confidence, transfers, news and club finances.
- **African football:** African clubs and squads, a nation database with CAF confederation metadata, national teams and continental competition scaffolding.
- **Player journey:** Player Career, agent offers, phone messages/notifications, rivalry, international call-ups, trust and squad progression.
- **Academy:** four-tier career pyramid, youth pathway, player development, scouting reports and club academy facilities.
- **Football business:** club operations, staff contracts/payroll, facilities, sponsorship, ticket income, supporter mood and board commitments.
- **Global football:** national teams, international tournaments and a shared football database.

The first job is to deepen and connect these systems, not add duplicate menus or parallel mechanics.

## Six delivery pillars

### 1. Living Football World
- Persistent manager identities, appointments, sackings, job changes and club tactical identity.
- Board confidence and job security driven by results, objectives and finances.
- Transfer market activity and player movement that changes the strength of rival clubs.
- World news generated from actual simulation events, not random disconnected headlines.
- End-of-season histories and records for clubs, managers and players.

Acceptance: simulated clubs can change manager; changes affect club tactics/identity; the user's career receives grounded news; no manager or club reference becomes orphaned.

### 2. African Football Revolution
- Make CAF club football a first-class competition path, not a generic placeholder.
- Separate qualification paths for CAF Champions League and CAF Confederation Cup.
- Strengthen playable African domestic leagues, derbies, promotion/relegation, scouting routes and national-team journeys.
- Give African clubs and competitions their own records, prestige and transfer pathways.
- Keep country, confederation and club data sourced and internally consistent.

Acceptance: an African club can qualify for and progress through the correct continental competition; fixtures resolve to valid clubs; qualification and results persist across seasons.

### 3. Ultimate Player Career
- Extend the existing agent, phone, rivalry and trust systems into a coherent player-life loop.
- Contract status, renewal talks, role promises, agent objectives and transfer requests.
- Teammate relationships and manager conversations that influence morale/trust.
- Reputation, sponsorship opportunities and media response tied to actual performances.
- Injury recovery and career milestones; retirement should preserve a complete career record.

Acceptance: player-life decisions have clear consequences, persist in saves and never silently change the user's club or contract.

### 4. Academy Revolution
- Regional youth scouting and academy recruitment with age-appropriate generated prospects.
- Youth intake, academy tournaments, development plans, loans and first-team pathways.
- Potential ranges and scouting confidence should matter over time.
- Academy quality and staff/facility investments should affect prospect quality and growth.

Acceptance: each intake creates unique valid players; player ownership and club squads remain consistent; progression can be followed from academy to senior football.

### 5. Football Business
- Expand the existing operations model into meaningful owner/board relationships.
- Multi-season budgets, debt, sponsorship negotiation, ticket pricing, stadium and facility projects.
- Board objectives and supporter sentiment should react to sporting and financial performance.
- Financial controls must prevent negative or impossible transactions unless explicitly represented as debt.

Acceptance: every investment has a cost, a persistent effect and a clear result; weekly accounts reconcile; old saves without operations data remain playable.

### 6. Global Football Universe
- Add women's football as a distinct, properly modelled competition ecosystem with its own clubs, squads and schedules.
- Expand international football with qualifying campaigns and tournament progression.
- Add online multiplayer only through a real authenticated, server-authoritative shared-career service; never simulate multiplayer locally or expose client-trusted results.
- Keep offline career fully playable when online services are unavailable.

Acceptance: men's and women's player/club records cannot be mixed accidentally; international qualification is deterministic and save-backed; online sessions validate ownership, turns and match results on the server.

## Delivery sequence

1. **Foundation and compatibility:** define shared world-state contracts, save migrations, invariants and test fixtures. Keep current careers loadable.
2. **Living world + African competitions:** deepen the weekly simulation and make CAF competitions real end-to-end.
3. **Player life + academy:** connect contracts, relationships, scouting and youth progression.
4. **Football business:** make ownership, board and finance decisions consequential.
5. **Women's and international football:** build the distinct competition data model and qualification logic.
6. **Multiplayer service:** design and implement authenticated shared saves, turn locking, server-side simulation and reconnect/recovery; this is a separate backend milestone, not a front-end toggle.

Each stage must pass TypeScript, production build, squad/world integrity, save compatibility and relevant engine tests before moving to the next. Add manual gameplay checks on Android landscape before release.

## Non-negotiable constraints

- Preserve the published game's established art direction, navigation language and landscape-first mobile layout.
- Do not replace existing screens wholesale or add placeholder feature buttons that do nothing.
- Do not claim a feature is complete until its gameplay loop, save persistence and tests exist.
- No copyrighted player imagery or club branding is introduced without appropriate licensing.
- Keep work on a feature branch and preview deployment; do not merge or deploy production without explicit approval.
