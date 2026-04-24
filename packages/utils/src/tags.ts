/**
 * Converts an uppercased tag slug (e.g. "DEEP-WORK") to a human-readable label ("Deep-Work").
 * Each word and hyphen-separated part is title-cased independently.
 */
export function tagToLabel(tag: string): string {
  return tag
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join("-")
    )
    .join(" ");
}

/** Internal lookup table mapping tag keys to their CSS badge class names. */
const TAG_CLASS_MAP: Record<string, string> = {
  RANTS: "tag-rants",
  TAKES: "tag-takes",
  "HALF-BAKED IDEAS": "tag-halfbaked",
  "LIFE STUFF": "tag-lifestuff",
  CULTURE: "tag-culture",
  EDITORIAL: "tag-editorial",
  TECHNICAL: "tag-technical",
};

/**
 * Maps an uppercase tag key to its CSS badge class name.
 * The matching CSS rules live in `packages/ui/styles/global.css` — a single
 * source of truth shared across all components that render tag badges.
 * Falls back to "tag-default" for unrecognised tags.
 */
export function tagClass(tag: string): string {
  return TAG_CLASS_MAP[tag.toUpperCase()] ?? "tag-default";
}
