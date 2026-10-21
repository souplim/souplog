import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { updateBookAction } from '~/lib/actions/books';
import { getBookById } from '~/lib/books';
import { BookForm } from '~/components/books/BookForm';
import { PageColumn } from '~/components/page/PageColumn';
import { AdminPageTitle } from '~/components/page/PageHeading';

export const metadata: Metadata = { title: '책 수정' };

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <PageColumn className="py-[var(--space-lg)]">
      <AdminPageTitle>책 수정</AdminPageTitle>
      <BookForm book={book} action={updateBookAction.bind(null, book.id)} />
    </PageColumn>
  );
}
