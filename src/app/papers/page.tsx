import type { Metadata } from 'next';
import { getPageHeading } from '~/lib/menus';
import { getFieldKeywords } from '~/lib/research-keywords';
import { PageEyebrow, PageTitle } from '~/components/page/PageHeading';
import { FieldKeywords } from '~/components/papers/FieldKeywords';

export async function generateMetadata(): Promise<Metadata> {
  const heading = await getPageHeading('papers');
  return { title: heading.title, description: heading.description };
}

export default async function PapersPage() {
  const [keywords, heading] = await Promise.all([getFieldKeywords(), getPageHeading('papers')]);

  return (
    <div className="mx-auto max-w-[var(--page-width)] px-4 py-[var(--space-xl)] sm:px-6">
      <header className="max-w-[var(--content-width)]">
        <PageEyebrow>연구동향</PageEyebrow>
        <PageTitle>{heading.title}</PageTitle>
        <p className="mt-[var(--space-sm)] whitespace-pre-line text-muted-foreground text-pretty">
          {heading.description}
        </p>
      </header>

      <FieldKeywords result={keywords} />
    </div>
  );
}
