import type { ComponentProps, ReactNode } from 'react';
import { cn } from 'cn';
import { Search } from 'lucide-react';

/** For the clear link or button a caller drops into `trailing`, so every search field's X looks the same. */
export const SEARCH_FIELD_ACTION_CLASS =
  'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors duration-[var(--duration-fast)] hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50';

interface SearchFieldProps extends Omit<ComponentProps<'input'>, 'type'> {
  /** Sits at the field's right edge — a clear link or button, or a pending spinner. */
  trailing?: ReactNode;
}

/**
 * The look every search box shares: magnifier inside on the left, room on
 * the right for a clear button. Only the field — how a search runs (a URL
 * form, a server action) stays with the caller.
 */
export function SearchField({ className, trailing, ...props }: SearchFieldProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        autoComplete="off"
        enterKeyHint="search"
        {...props}
        className="h-12 w-full min-w-0 rounded-lg border border-input bg-card pr-11 pl-10 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {trailing ? <div className="absolute top-1/2 right-2 flex -translate-y-1/2">{trailing}</div> : null}
    </div>
  );
}
