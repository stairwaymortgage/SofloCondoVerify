/** The lead intents. Stored verbatim in leads.intent. */
export const INTENTS = [
  {
    value: "finance",
    label: "Finance a purchase",
    hint: "You’re buying and need a loan on this building.",
  },
  {
    value: "foreign-national",
    label: "Foreign-national loan",
    hint: "You’re buying without U.S. credit or income history.",
  },
  {
    value: "sell",
    label: "Sell my unit",
    hint: "You own here and want to list.",
  },
  {
    value: "check-building",
    label: "Check a building",
    hint: "You want a professional to look past the public record.",
  },
  {
    value: "board",
    label: "I'm on a condo board",
    hint: "Your building needs its FHA, VA or lender standing sorted out.",
  },
  {
    value: "preconstruction",
    label: "Preconstruction \u00b7 top 10",
    hint: "A shortlist chosen to your budget and criteria.",
  },
] as const;

export type IntentValue = (typeof INTENTS)[number]["value"];

const VALUES = INTENTS.map((intent) => intent.value) as readonly string[];

export function isIntent(value: unknown): value is IntentValue {
  return typeof value === "string" && VALUES.includes(value);
}

/** Falls back to "check-building" for a missing or unrecognised ?intent=. */
export function normalizeIntent(value: unknown): IntentValue {
  return isIntent(value) ? value : "check-building";
}

export function intentLabel(value: string): string {
  return INTENTS.find((intent) => intent.value === value)?.label ?? value;
}
