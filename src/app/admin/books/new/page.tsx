import type { Metadata } from 'next';
import { createBookAction } from '~/lib/actions/books';
import { BookForm } from '~/components/books/BookForm';
import { PageColumn } from '~/components/page/PageColumn';
import { AdminPageTitle } from '~/components/page/PageHeading';

export const metadata: Metadata = { title: '책 추가' };

export default function NewBookPage() {
  return (
    <PageColumn className="py-[var(--space-lg)]">
      <AdminPageTitle>책 추가</AdminPageTitle>
      <BookForm book={null} action={createBookAction} />
    </PageColumn>
  );
}
