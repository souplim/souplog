import type { Metadata } from 'next';
import { PageEyebrow, PageTitle } from '~/components/page/PageHeading';
import { StatCard } from '~/components/stats/StatCard';
import { getWomenStats } from '~/lib/women-stats';

export const metadata: Metadata = {
  title: '여성의 일과 삶',
  description: '경력단절, 고용, 임금, 빈곤, 육아휴직으로 본 여성의 일과 삶 — KOSIS 국가통계',
};

export default async function StatsPage() {
  const cards = await getWomenStats();

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <header className="max-w-[var(--content-width)]">
        <PageEyebrow>통계</PageEyebrow>
        <PageTitle>여성의 일과 삶</PageTitle>
        <p className="mt-[var(--space-sm)] text-muted-foreground text-pretty">
          경력단절부터 노후 빈곤까지, 국가승인통계로 여성의 일과 삶이 어떻게 달라져 왔는지 봅니다. <br />
          KOSIS 국가통계포털자료를 하루에 한 번 새로 받아옵니다.
        </p>
      </header>

      <div className="mt-[var(--space-xl)] grid gap-x-[var(--space-xl)] sm:grid-cols-2">
        {cards.map((card) => (
          <StatCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
