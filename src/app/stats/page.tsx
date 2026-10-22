import type { Metadata } from 'next';
import { getPageHeading } from '~/lib/menus';
import { PageEyebrow, PageTitle } from '~/components/page/PageHeading';
import { StatCard } from '~/components/stats/StatCard';
import { getWomenStats } from '~/lib/women-stats';

export async function generateMetadata(): Promise<Metadata> {
  const heading = await getPageHeading('stats');
  return { title: heading.title, description: heading.description };
}

export default async function StatsPage() {
  const [cards, heading] = await Promise.all([getWomenStats(), getPageHeading('stats')]);

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <header className="max-w-[var(--content-width)]">
        <PageEyebrow>통계</PageEyebrow>
        <PageTitle>{heading.title}</PageTitle>
        <p className="mt-[var(--space-sm)] whitespace-pre-line text-muted-foreground text-pretty">
          {heading.description}
        </p>
      </header>

      <div className="mt-[var(--space-xl)] grid gap-[var(--space-md)] sm:grid-cols-2">
        {cards.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
