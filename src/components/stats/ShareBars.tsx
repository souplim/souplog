import type { ShareItem } from '~/lib/kosis-series';
import { formatPercent, formatThousandPersons } from '~/lib/stat-format';
import { cn } from '~/lib/utils';

interface ShareBarsProps {
  /** Largest first. */
  items: ShareItem[];
}

/**
 * Horizontal bars for a single year's split. Plain markup rather than a chart:
 * five labelled rows read better as a list, and screen readers get it for free.
 * The largest share takes the accent; the rest stay neutral.
 */
export function ShareBars({ items }: ShareBarsProps) {
  return (
    <ol className="space-y-[var(--space-xs)]">
      {items.map((item, index) => (
        <li key={item.label} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-[var(--space-xs)]">
          <span className="text-sm">{item.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-[var(--color-surface)]" aria-hidden="true">
            <span
              className={cn(
                'block h-full rounded-full',
                index === 0 ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border-strong)]',
              )}
              style={{ width: `${item.share}%` }}
            />
          </span>
          <span className="text-right text-xs text-muted-foreground tabular-nums">
            {formatPercent(item.share)}
            <span className="sr-only">, {formatThousandPersons(item.value)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
