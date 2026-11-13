export interface HeadingSegment {
  text: string;
  className?: string;
}

export interface SplitWordToken {
  word: string;
  chars: string[];
  className?: string;
  hasTrailingSpace: boolean;
}

/**
 * Splits structured heading segments into word-grouped character arrays so
 * SplitText-style character animations wrap naturally at spaces without
 * breaking mid-word.
 */
export function splitHeadingSegments(segments: HeadingSegment[]): SplitWordToken[] {
  const tokens: SplitWordToken[] = [];

  segments.forEach((segment, segIndex) => {
    const parts = segment.text.split(/(\s+)/);
    parts.forEach((part, partIndex) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        if (tokens.length > 0) {
          tokens[tokens.length - 1].hasTrailingSpace = true;
        }
        return;
      }

      const nextPart = parts[partIndex + 1];
      const trailingInSegment = Boolean(nextPart && /^\s+$/.test(nextPart));
      const trailingAcrossSegments =
        partIndex === parts.length - 1 &&
        segIndex < segments.length - 1 &&
        /^\s/.test(segments[segIndex + 1].text);

      tokens.push({
        word: part,
        chars: Array.from(part),
        className: segment.className,
        hasTrailingSpace: trailingInSegment || trailingAcrossSegments,
      });
    });
  });

  return tokens;
}
