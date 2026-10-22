import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface AboutStep {
  key: string;
  title: string;
  description: string;
  /** Live content from that part of the blog — the book being read, the latest post. */
  preview: ReactNode;
  href: string;
  linkLabel: string;
}

/**
 * Numbered steps, one per part of the blog. Each is a quiet column split off
 * by a rule on top, with the number in the accent colour as its only marker.
 */
export function AboutSteps({ steps }: { steps: readonly AboutStep[] }) {
  return (
    <ol className="grid gap-[var(--space-lg)] md:grid-cols-3 md:gap-[var(--space-md)]">
      {steps.map((step, index) => (
        <li key={step.key} className="flex flex-col border-t border-border-strong pt-[var(--space-sm)]">
          <span className="text-xs font-semibold text-accent-foreground tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="mt-[var(--space-2xs)] font-heading text-[length:var(--text-lg)] tracking-[var(--tracking-tight)]">
            {step.title}
          </h3>
          <p className="mt-[var(--space-3xs)] text-sm leading-[var(--leading-normal)] text-muted-foreground">
            {step.description}
          </p>
          <div className="mt-[var(--space-md)] flex-1">{step.preview}</div>
          <Link
            href={step.href}
            className="group/link mt-[var(--space-md)] inline-flex w-fit items-center gap-[var(--space-3xs)] rounded-xs text-sm font-semibold text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            {step.linkLabel}
            <ArrowRight className="size-4 transition-transform duration-[var(--duration-fast)] group-hover/link:translate-x-0.5" />
          </Link>
        </li>
      ))}
    </ol>
  );
}
