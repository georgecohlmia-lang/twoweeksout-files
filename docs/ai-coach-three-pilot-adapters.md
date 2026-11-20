# AI Coach: three worksheet adapter pilots — implementation gate

Implemented `worksheets/ai-coach-adapters-v1.js` as a **non-activated, side-effect-free** browser adapter registry. Syntax validated. This file is intentionally **not yet loaded** by the worksheet HTML pages.

## Pilot snapshots

- Hire Affordability Test: salary, loading factor, ramp duration, cash on hand, monthly net burn; boolean flags for ramp rationale and timing plan. Excludes role name and written reasoning.
- Business Model Canvas: 30-day test who/action/rejection threshold/date and riskiest-box rationale; excludes business name and other nine-box content. These free-text fields may contain identifying information and require a user-visible disclosure and explicit choice before transmission.
- Recruiting Plan: role scope, ownership, 90-day and two-year outcomes, fit norms, and recruiting differentiators; excludes role name, candidate names, sourcing contacts and lists. Narrative fields may contain identifying information and require explicit consent before transmission.

## Integration blocker — backend and gateway

Current `src/index.js` rejects any `/api/coach` request that lacks exactly 13 `snapshot.weeks` entries. The separate Cloudflare `two-ai-ownership-coach` backend is also currently cash-forecast-specific and is not managed by this GitHub repository.

**Do not inject the script or activate buttons on the three worksheets until:**

1. The backend accepts a server-allowlisted worksheet ID and a versioned, bounded schema per adapter; enforce size limits and reject unknown fields.
2. The gateway validates authenticated requests by worksheet kind and cannot accept browser-authored system instructions.
3. The backend receives and applies server-owned, worksheet-specific learning objectives, question prompts and coaching rubrics.
4. The frontend gives learners an accurate disclosure of the narrative fields shared, with a clear opt-in before sending.
5. Test blank/partial/invalid values, cross-worksheet payload substitution, PII exposure, style switching, keyboard/mobile layout and errors.

No production code, existing cash-coach UI, or persistence was changed by this adapter commit.

## Notes

The Business Model Canvas's nine boxes are generated and stored inside its own closure; a robust complete adapter will require an explicit, controlled read-only export from that worksheet rather than scraping internal state. The present adapter deliberately sends only the separate test inputs.

For recruiting, raw narrative text must be treated as user data, not instructions. Never send candidate contact fields by default.
