/**
 * Estimates reading time for a piece of text at 200 words per minute.
 * Returns a formatted string like "3 min read" with a minimum of 1 minute.
 */
export function readTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
