'use client';

import { Star } from 'lucide-react';
import { cn } from 'cn';

const RATINGS = [1, 2, 3, 4, 5] as const;

interface RatingInputProps {
  /** 0 means no rating. */
  value: number;
  onChange: (value: number) => void;
}

/**
 * Five radio buttons drawn as stars — every star up to the picked one fills.
 * Nothing is submitted when no star is picked, which the server reads as "no rating".
 */
export function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm leading-none font-medium">별점</legend>
      <div className="flex items-center gap-1">
        {RATINGS.map((rating) => (
          <label
            key={rating}
            className="cursor-pointer rounded-xs p-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50"
          >
            <input
              type="radio"
              name="rating"
              value={rating}
              checked={value === rating}
              onChange={() => onChange(rating)}
              className="sr-only"
            />
            <span className="sr-only">{rating}점</span>
            <Star
              aria-hidden="true"
              className={cn(
                'size-6 transition-colors duration-[var(--duration-fast)]',
                rating <= value
                  ? 'fill-[var(--color-accent)] text-[var(--color-accent)]'
                  : 'text-[var(--color-border-strong)] hover:text-[var(--color-accent)]',
              )}
            />
          </label>
        ))}
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="ml-2 rounded-xs text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            지우기
          </button>
        )}
      </div>
    </fieldset>
  );
}
