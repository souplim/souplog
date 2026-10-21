import { progressPercent } from '~/lib/book-shelf';

interface ReadingProgressProps {
  currentPage: number;
  totalPages: number | null;
}

/** A bookmark bar with "62% · 186/300쪽" under it, or just the page when the length is unknown. */
export function ReadingProgress({ currentPage, totalPages }: ReadingProgressProps) {
  const percent = progressPercent(currentPage, totalPages);

  if (percent === null) {
    return <p className="text-xs tabular-nums text-muted-foreground">{currentPage}쪽까지 읽음</p>;
  }

  return (
    <div className="space-y-1.5">
      <div
        role="progressbar"
        aria-label="읽은 정도"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-1.5 overflow-hidden rounded-full bg-muted ring-1 ring-border ring-inset"
      >
        <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${percent}%` }} />
      </div>
      <p className="flex items-baseline gap-1.5 text-xs tabular-nums text-muted-foreground">
        <span className="font-semibold text-foreground">{percent}%</span>
        <span>
          {currentPage}/{totalPages}쪽
        </span>
      </p>
    </div>
  );
}
