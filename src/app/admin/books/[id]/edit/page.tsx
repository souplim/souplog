import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { updateBookAction } from '~/lib/actions/books';
import { getBookById } from '~/lib/books';
import { BookForm } from '~/components/books/BookForm';

export const metadata: Metadata = { title: '책 수정' };

interface EditBookPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;
  const book = await getBookById(id);
  if (!book) notFound();

  return (
    <div className="mx-auto max-w-[var(--content-width)] px-4 py-[var(--space-lg)] sm:px-6">
      <h1 className="mb-8 font-heading text-3xl">책 수정</h1>
      <BookForm book={book} action={updateBookAction.bind(null, book.id)} />
    </div>
  );
}
