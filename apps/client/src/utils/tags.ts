import { capitalize, split, toLower } from "lodash-es";

/** Convert an uppercased tag (e.g. "DEEP-WORK") to display label ("Deep-Work"). */
export function tagToLabel(tag: string): string {
  return split(tag, " ")
    .map((word) =>
      split(word, "-")
        .map((part) => capitalize(toLower(part)))
        .join("-")
    )
    .join(" ");
}
