import { Star } from 'lucide-react';
import { cn } from 'cn';

export const MAX_RATING = 5;

interface StarGlyphProps {
  /** How much of this star is lit: 0, 0.5 or 1. */
  fill: number;
  className?: string;
}

/** One star, lit fully or only on its left half — the filled star is clipped over an empty one. */
export function StarGlyph({ fill, className }: StarGlyphProps) {
  return (
    <span className={cn('relative inline-block', className)} aria-hidden="true">
      <Star className="size-full text-[var(--color-border-strong)]" />
      {fill > 0 && (
        <Star
          className="absolute inset-0 size-full fill-[var(--color-accent)] text-[var(--color-accent)]"
          style={fill < 1 ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
        />
      )}
    </span>
  );
}

/** How much of the star at `index` (0-based) a rating lights. */
export function starFill(rating: number, index: number): number {
  return Math.min(1, Math.max(0, rating - index));
}

interface StarRatingProps {
  rating: number;
  className?: string;
}

/** Read-only stars; the form has its own input. */
export function StarRating({ rating, className }: StarRatingProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`별점 ${rating}점`}>
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <StarGlyph key={index} fill={starFill(rating, index)} className="size-4" />
      ))}
    </span>
  );
}
