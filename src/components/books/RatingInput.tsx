'use client';

import { cn } from 'cn';
import { MAX_RATING, StarGlyph, starFill } from './StarRating';

const HALVES = [0.5, 1] as const;
const MIN_RATING = HALVES[0];

interface RatingInputProps {
  /** 0 means no rating. */
  value: number;
  onChange: (value: number) => void;
}

/**
 * Ten radio buttons drawn as five stars — the left half of a star picks x.5, the right half x.0,
 * and arrow keys step by half a star. Picking the leftmost half again clears the rating.
 * Nothing is submitted when no star is picked,
 * which the server reads as "no rating".
 */
export function RatingInput({ value, onChange }: RatingInputProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm leading-none font-medium">별점</legend>
      <div className="flex items-center gap-1">
        {Array.from({ length: MAX_RATING }, (_, index) => (
          <span key={index} className="relative p-0.5">
            <StarGlyph fill={starFill(value, index)} className="size-6" />
            {HALVES.map((half) => {
              const rating = index + half;
              return (
                <label
                  key={half}
                  className={cn(
                    'absolute inset-y-0 w-1/2 cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50',
                    half < 1 ? 'left-0 rounded-l-xs' : 'right-0 rounded-r-xs',
                  )}
                >
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={value === rating}
                    onChange={() => onChange(rating)}
                    // A checked radio fires no change event, so clearing has to listen for the click.
                    onClick={() => {
                      if (rating === MIN_RATING && value === MIN_RATING) onChange(0);
                    }}
                    className="sr-only"
                  />
                  <span className="sr-only">{rating}점</span>
                </label>
              );
            })}
          </span>
        ))}
      </div>
    </fieldset>
  );
}
