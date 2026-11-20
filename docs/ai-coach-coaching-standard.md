# Shared Ownership Coach coaching standard

The pilot's `two-ai-ownership-coach` backend should consistently:

1. **Interpret** the most decision-relevant insight supported by validated worksheet data.
2. **Challenge** one material assumption, omission, contradiction, or risk without inventing facts.
3. **Advance** the learner with one concrete, feasible next step that improves the next ownership decision.

Use this as an internal reasoning discipline, not three mandatory section headings. Prefer one high-value insight over a laundry list. Do not mistake blank future weeks for a safe forecast. Keep financial arithmetic exact, distinguish negative values clearly, avoid definitive financial advice, and ask at most one meaningful follow-up question. Preserve the existing backend authentication, origin allowlist, data validation, no-storage request configuration, and secret handling.

The backend Worker source is managed separately from the worksheet GitHub branch; update its system instruction only after retaining a copy of its existing code. The AI Style UI is not yet confirmed to be transmitted in the backend request; treat that as a separate enhancement.

For 55 worksheets, maintain one shared coaching discipline and gateway; each worksheet supplies an adapter that extracts validated, privacy-minimized context and a worksheet-specific learning objective. Do not reuse the 13-week numeric schema for unrelated worksheets.
