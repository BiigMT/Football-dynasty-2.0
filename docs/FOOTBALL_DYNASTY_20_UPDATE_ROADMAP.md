# Football Dynasty 2.0 — 20-update delivery plan

This roadmap is approved for implementation in staged, testable releases. Preserve existing saves, game identity, landscape-only mobile gameplay and the current published production branch. All work targets development or stacked feature branches; never merge to main or deploy production without explicit approval.

## Visual direction

Use the existing Football Dynasty navy, royal blue, gold and white identity with the information density and hierarchy of a serious football management/broadcast game. Reference the presentation quality and conventions of Football Manager 27, FIFA 19 and PES: compact scoreboards, real-feeling fixture cards, restrained motion, pitch/kit photography where rights permit, clear club crests, realistic player portraits, readable tables, authentic match commentary and consistent spacing. Do not copy proprietary screens, logos, player likenesses, assets, fonts or animations. Avoid generic AI-looking gradients, random decorative cards, synthetic-looking faces and oversized empty panels. Prefer verified/licensed assets, existing game assets, data-led layouts and purposeful football photography.

## Delivery stages

### Stage 1 — stability and presentation
1. Matchday briefing: keep the PLAY MATCH action permanently visible in the landscape viewport; no scroll required.
2. Landscape layout: audit every Player Career and Manager Career screen against short and wide mobile viewports, safe areas and Android navigation bars.
3. Player Career dashboard: organise latest news, calendar/upcoming fixtures and league table into a readable match-centre dashboard.
4. Player Career resilience: guard incomplete saves, empty fixtures, missing club/player references and recover without blank screens.
5. Visual authenticity pass: consistent typography, spacing, scoreboards, club identity, authentic football data presentation and restrained motion.

### Stage 2 — Player Career depth
6. Individual training plans with position-aware drills, weekly workload and fatigue trade-offs.
7. Player development with attribute progression, potential ceilings, coaching quality and training history.
8. Player personality with confidence, professionalism, ambition and morale consequences.
9. Teammate relationships with friendship, rivalry, chemistry and conversations that affect squad dynamics.
10. Personal-life decisions with believable, optional consequences for rest, reputation, finances and relationships.

### Stage 3 — transfers and football business
11. Transfer negotiations with bids, counteroffers, deadlines and club responses.
12. Agent representation with mandates, advice, fee expectations and relationship quality.
13. Contract lifecycle with wages, bonuses, clauses, renewals and expiry warnings.
14. Transfer intelligence with scouting, rumours, shortlist tracking and source confidence.
15. Club interest with realistic approaches based on ability, form, role, reputation and squad needs.

### Stage 4 — living football world and legacy
16. Dynamic news with match reports, transfer stories, injuries, controversies and credible editorial variation.
17. Manager relationships with trust, promises, selection discussions, disputes and playing-time expectations.
18. International football with call-ups, camps, qualifiers and tournament progression.
19. Rivalries and reputation with derby context, player rivalries, supporter sentiment and reputation changes.
20. Career legacy with records, awards, trophies, historical statistics, Hall of Fame and retirement decisions.

## Fixture cadence requirement — clarification needed

The requested phrase “add new fixtures every 30 minutes” needs a product decision before implementation. A real-time 30-minute timer would not be a sensible football calendar and must not silently overwrite a season schedule. Preferred safe design: generate a complete, deterministic fixture calendar when a career/season is created or rolled over, then simulate world fixtures during in-game weekly progression. If the request instead means refresh external live fixture data every 30 real-world minutes, that requires a trusted data provider, rights review, caching and an online/offline policy.

## Acceptance gates

- Existing saves load without destructive migration.
- Matchday can be started without scrolling in landscape.
- Both career modes, transfers, phone, calendar, tables and match results are tested together.
- New simulation logic is deterministic/idempotent where applicable and has focused validators.
- Web build and Android APK checks pass before preview handoff.
- Actual Android gameplay remains a separate device test; CI does not claim to have tested a physical phone.

## Implementation progress · 20 November 2026

The following systems have now been added or connected on the stacked Player Career feature branch (not production):
- Matchday landscape briefing viewport and fixed PLAY MATCH action area (PR #31).
- Player Career dashboard records, news, league table and upcoming schedule.
- Teammate relationship actions and manager conversations with save-backed effects.
- Agent/career transfer offer counter and rejection handling.
- Instagram-style fan responses connected to follower count and social posts.
- Individual opponent rivalry declarations, match-rating duel resolution and rivalry news/record.
- Dedicated career-systems validation added to the Android CI workflow.

Still required before considering the programme complete:
- Finish CI for the latest commit and resolve any failures.
- Verify phone, Player Career, transfers and matchday together in the actual Android landscape app.
- Complete remaining UI integration and gameplay balancing for the broader career roadmap.
- Keep all changes on development/feature branches until explicitly approved; never deploy these changes to main without approval.


## Full-season calendar implementation · 20 November 2026

A dedicated in-game calendar is now implemented on the stacked calendar feature branch:
- A deterministic season date system maps each in-game week to calendar dates, with fixtures placed on competition-specific matchdays.
- The calendar includes the user's league, domestic cup, continental and eligible international fixtures, plus weekly training, recovery, squad briefings and transfer-window milestones.
- Player Career has a full season-calendar screen; the Player Phone Calendar app opens the same schedule; Manager Career has a dedicated Season Calendar entry and matchday preview handoff.
- Dates follow the in-game season and week, not the device clock. Existing saves require no destructive migration because dates are derived from their existing season/week/fixture data.
- A focused calendar validator is included in Android CI. Web/Android CI and preview deployment remain the next acceptance gate; physical-device testing is still required.

The separately requested FM25-inspired home-screen news feed has not been changed and remains awaiting the user's approval.


## FM-inspired home news feed implementation · 20 November 2026

A separate stacked feature branch now adds an interactive career news desk:
- Manager Career home: a multi-story feed beneath the lead club story, with All, Matches, Transfers, Club and World filters.
- Player Career central dashboard: the existing latest-news panel now uses the same interactive feed and category filters.
- Selecting a headline opens its full saved story; users can return to the headline list without leaving the career dashboard.
- The feed is sourced from career-save news, with the next real fixture preview pinned to the Manager Career feed. No fabricated live external news is presented.
- Existing navy, royal-blue, cyan and gold visual identity is preserved, with compact landscape sizing and scrollable headlines.
- The change is isolated in a separate PR stacked on the calendar PR. Automated build/preview and Android validation are the next gate; device testing remains required.
