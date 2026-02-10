/**
 * Parse [[concept-id|display text]] markers in hint strings.
 *
 * Returns an array of segments:
 * - { type: 'text', value: string }   — plain text
 * - { type: 'link', conceptId: string, label: string } — concept link
 *
 * Existing hints without markers render unchanged (single text segment).
 */

export type HintSegment =
  | { type: 'text'; value: string }
  | { type: 'link'; conceptId: string; label: string };

const LINK_PATTERN = /\[\[([^|[\]]+)\|([^\]]+)\]\]/g;

export function parseConceptLinks(text: string): HintSegment[] {
  const segments: HintSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const matchIndex = match.index!;

    // Add text before this match
    if (matchIndex > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, matchIndex) });
    }

    // Add the concept link
    segments.push({
      type: 'link',
      conceptId: match[1]!,
      label: match[2]!,
    });

    lastIndex = matchIndex + match[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  // If no matches found, return single text segment
  if (segments.length === 0) {
    segments.push({ type: 'text', value: text });
  }

  return segments;
}
