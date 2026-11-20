# AI Ownership Coach — Worksheet Integration Inventory (Phase 1)

Branch: `ai-coach-integration`. Inventory derived from the repository tree. **Categories are provisional filename-based groupings, not verified learning objectives.** No production rollout is authorized by this document.

## Architecture decision

- Shared, mobile-friendly coach interface across worksheets.
- Each worksheet declares an adapter that extracts a **minimal, explicit, validated snapshot** from its real inputs, with sensitive text excluded or clearly disclosed.
- Each worksheet declares lesson objective, key decisions, assumptions to challenge, and appropriate question prompts.
- The server validates the worksheet identity and applies **server-owned coaching instructions**; do not trust lesson instructions supplied by browser content.
- Preserve Interpret → Challenge → Advance, selectable styles, and no unsupported conclusions.
- Never send entire DOM, unbounded free text, names, contact details, or confidential information by default.
- Preserve current worksheet persistence and avoid modifying production until acceptance tests pass.

## Inventory (55 worksheets)

| Worksheet directory | Provisional group | Integration |
|---|---|---|
| affordability-test | financial | Adapter pending |
| building-scalable-system | strategy | Adapter pending |
| business-model-canvas | strategy | Adapter pending |
| cash-timing-diagnostic | financial | Adapter pending |
| choosing-your-pricing-model | financial | Adapter pending |
| credit-line-strategy | financial | Adapter pending |
| customer-journey-map | market | Adapter pending |
| defining-financial-success | financial | Adapter pending |
| designing-business-self-fund | financial | Adapter pending |
| emotional-reality | people | Adapter pending |
| extending-runway | financial | Adapter pending |
| go-to-market | market | Adapter pending |
| great-product-manager | market | Adapter pending |
| growth-frameworks | strategy | Adapter pending |
| handling-pricing-conversations | financial | Adapter pending |
| interviewing-for-journey | market | Adapter pending |
| learning-while-running | strategy | Adapter pending |
| managing-distributed-team | people | Adapter pending |
| managing-small-team | people | Adapter pending |
| mapping-founder-salary | financial | Adapter pending |
| market-expansion | market | Adapter pending |
| market-fit-assessment | market | Adapter pending |
| marketing-strategy | market | Adapter pending |
| mvp-scoping | market | Adapter pending |
| owers-posture | strategy | Adapter pending |
| performance-measurement | people | Adapter pending |
| pipeline-forecasting | financial | Adapter pending |
| product-extension | market | Adapter pending |
| proposal-price-objections | financial | Adapter pending |
| prospecting-without-cold-calling | market | Adapter pending |
| prototyping | review | Adapter pending |
| recruiting-talent | people | Adapter pending |
| roadmapping | strategy | Adapter pending |
| sequencing-funding | financial | Adapter pending |
| setting-first-price | financial | Adapter pending |
| social-media-community | market | Adapter pending |
| strategic-partnerships-referrals | market | Adapter pending |
| strategic-partnerships | market | Adapter pending |
| two-13-week-projection | review | Pilot integrated |
| two-24-month-roadmap | strategy | Adapter pending |
| two-ai-tools-marketing | market | Adapter pending |
| two-building-culture | people | Adapter pending |
| two-building-sales-process | market | Adapter pending |
| two-capital-efficient-scaling | financial | Adapter pending |
| two-capital-plan | financial | Adapter pending |
| two-comp-benefits | people | Adapter pending |
| two-content-marketing | market | Adapter pending |
| two-customers-as-investors | financial | Adapter pending |
| two-discovery-conversation | market | Adapter pending |
| two-email-marketing | market | Adapter pending |
| two-estimating-revenue | financial | Adapter pending |
| two-sales-motions | market | Adapter pending |
| what-corp-taught | strategy | Adapter pending |
| when-to-raise-prices | financial | Adapter pending |
| when-whom-hire | people | Adapter pending |

## Observed representative patterns

- `two-13-week-projection`: 146 input elements; numerical weekly totals; current pilot.
- `business-model-canvas`: 13 inputs, 4 textareas; assumptions and narrative tests.
- `recruiting-talent`: 3 inputs, 9 textareas; primarily narrative.
- `affordability-test`: 7 inputs, 1 textarea, 2 tables; financial decision.
- `roadmapping`: 10 inputs, 4 textareas; prioritization.
- `two-estimating-revenue`: 14 inputs, 3 textareas, 1 table; estimation.

These counts are raw HTML element counts and may not reflect dynamically generated controls. Detailed adapters require inspection of worksheet behavior, not just markup.

## Next acceptance gate

1. Verify worksheet-specific learning objective and input semantics for every adapter.
2. Implement three deliberately different pilots: `affordability-test` (quantitative), `business-model-canvas` (strategic), `recruiting-talent` (narrative).
3. Confirm correct data extraction, empty-state behavior, coaching quality, mobile interaction, and persistence.
4. Only then batch remaining integrations.
