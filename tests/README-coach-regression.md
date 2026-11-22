# AI Ownership Coach regression

## Automated coverage

- `node tests/coach-regression.js`: all registered adapters, worksheet files, gateway registrations, backend lesson rules, batch-kind contracts, script tags, Worksheet 43/44 reset isolation and Worksheet 44 privacy.
- `node tests/coach-browser-regression.js`: all registered worksheet Coach interfaces open/close and preserve style, Culture Artifact and Management Discipline worked-example style isolation, and Management Discipline initial/follow-up payload, consent, history and name exclusion against a **mocked** API.
- GitHub Actions: **AI Coach Regression** runs on pushes to `ai-coach-integration` and can be run manually via Actions > AI Coach Regression > Run workflow.

## Scope and release gate

This is an offline integration regression, **not** an end-to-end production verification. The browser tests use a mock response; they do not test Cloudflare deployment, Access/Turnstile authentication, API reachability, production persistence, or live model reasoning.

Before claiming a release is fully regression-tested:

1. Confirm both GitHub Actions steps passed and archive the run URL.
2. Deploy the matching gateway and backend commits to the test Workers.
3. Open Worksheet 44 on the deployed test URL; test worked example, change coaching style, send an initial challenge, then send 'Tell me more'. Confirm no `request_shape` error.
4. Repeat the Culture Artifact worked-example regression on the deployed test gateway.
5. For any shared model instruction changes, replay approved worksheet scenarios and manually score substantive initial and follow-up answers. No historic quality fixtures have yet been committed; **do not claim all 43 prior quality scenarios have been replayed**.

The adapter registry is not the same as the approved-worksheet inventory. The test suite discovers **all registered adapters** rather than assuming the number is 43 or 44.

## Run locally

```sh
node tests/coach-regression.js
npm install --no-save --no-package-lock playwright@1.58.2
npx playwright install chromium
node tests/coach-browser-regression.js
```

If browser tests fail, inspect the named worksheet and exact failure before changing shared code. Never mark a failed run green or suppress failures just to pass CI.
