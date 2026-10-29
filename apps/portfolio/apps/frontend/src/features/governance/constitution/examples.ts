/** Fictional teaching examples, never activated or saved without an explicit user action. */
export const REVIEW_EXAMPLES = [
  "If a succession event is confirmed, cash must be at least 20% of investable assets.",
  "Public equities shall not exceed 60% unless the family board approves an exception.",
] as const;

export const WORKING_POLICY_EXAMPLE = `# Illustrative family investment policy

Fictional local demo only. Review the clauses and fixture scope before saving or activating.

## Portfolio boundaries
- Public equities shall not exceed 55% of investable assets.
- Fixed-income exposure must be at least 10% of investable assets.
- Cash must be at least 4% of investable assets.
- Private markets shall not exceed 30% of investable assets.

## Optional review examples
These two examples require an event or approval source that is not connected. They are fenced illustrations, excluded from the active rules. Copy one outside this block to inspect its Needs review result.

\`\`\`text
${REVIEW_EXAMPLES.join("\n")}
\`\`\`
`;
