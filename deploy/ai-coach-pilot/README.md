# AI Ownership Coach pilot — existing test Worker

Target Worker: `two-ai-coach-integration-test` (never production `two-weeks-out-worksheets`).

## Safety gate

**Do not deploy this configuration yet.** First export and preserve the existing integration-test Worker's source and settings, because deploying a new script to the same Worker replaces its current script. Confirm the existing `/api/coach` POST behavior is preserved or deliberately migrated. Never put the `AI_COACH_PILOT_TOKEN` secret into GitHub.

## Pilot architecture

- Serve the existing `worksheets/` static asset directory and `two-13-week-projection` from the test Worker.
- Use the shared `src/index.js` `/api/coach` gateway and existing `AI_COACH` service binding.
- Reuse Cloudflare Access on the test Worker, but set `ACCESS_AUD` to the **test Worker's** Access app audience, not the worksheets Worker audience. Keep `ACCESS_TEAM_DOMAIN` and encrypted `AI_COACH_PILOT_TOKEN` in Cloudflare settings.
- Verify `/api/coach` GET returns 405, then POST with synthetic 13-week data returns a useful reply; verify auth failure is denied and worksheets autosave/calculations are unchanged.
- Confirm the backend `ALLOWED_ORIGIN` policy accepts the gateway's forwarded Origin before live testing.
- Production is untouched until explicit approval.

## Scaling to 55 worksheets

One authenticated gateway and shared chat UI, with a per-worksheet adapter that extracts only appropriate, validated worksheet data. The 13-week forecast adapter is the first. Future adapters must define worksheet schema, aggregation/privacy rules, context, coaching prompts and validation; no individual Worker or credentials per worksheet. Pilot must not assume every worksheet has 13 weeks or cash-flow fields.
