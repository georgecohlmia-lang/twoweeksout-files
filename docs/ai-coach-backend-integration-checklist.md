# Multi-worksheet backend integration — release checklist

The server-owned lesson instructions are implemented in `backend/ai-coach-lessons-v1.js`. The gateway schema validation is in `src/index.js`, and browser snapshot adapters are in `worksheets/ai-coach-adapters-v1.js`.

**Important:** The live AI backend is a separate Cloudflare Worker named `two-ai-ownership-coach`; its deployed source has not been fetched or changed. Merely adding the lesson module to this repository does not make that backend use it.

## Required backend changes

1. Incorporate the lesson instructions into the backend's trusted `instructions` for recognized `worksheetId` values. Do not accept any browser-supplied lesson instruction.
2. Validate the incoming `snapshot.kind` against the selected worksheet and enforce strict field bounds server-side, even though the gateway also validates.
3. Preserve the legacy 13-week cash-flow handling and its tested coaching styles.
4. Map four prompt keys to the lesson-specific questions; prevent unknown prompt keys from becoming unintended directives.
5. Treat snapshot narrative content as untrusted data and avoid claiming to have seen excluded fields.
6. Confirm the backend's origin and bearer-token requirements still match the gateway.

## Required browser changes

- Load the adapter registry and shared mobile Coach UI on the three pilot worksheets **only after backend deployment and test confirmation**.
- Provide a plain-language description of the exact data transmitted. Obtain affirmative consent before sending narrative fields.
- Verify empty/partial values, privacy exclusions, dynamic fields, focus/keyboard, style switching and conversation continuity.

## Test gate

- First test the backend with synthetic data for each worksheet and reject invalid payloads.
- Then test through the authenticated gateway and on actual worksheet pages.
- Do not deploy the production worksheet Worker until the owner approves.

No new worksheet Coach buttons are activated by these commits.
