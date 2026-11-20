# AI Coach preview deployment check

This documentation-only commit triggers a new Cloudflare build event on the `ai-coach-integration` branch after builds were re-enabled.

The branch contains a separate Coach interface and an Access-verified gateway that remains disabled without its required Cloudflare environment settings. Do not merge into `main` until an isolated preview has been deployed, Access is enforced, and end-to-end tests have passed.
