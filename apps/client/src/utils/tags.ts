/** Convert an uppercased tag (e.g. "DEEP-WORK") to display label ("Deep-Work"). */
export function tagToLabel(tag: string): string {
  return tag
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join("-")
    )
    .join(" ");
}
