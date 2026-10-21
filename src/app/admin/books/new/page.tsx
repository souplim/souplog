import type { Metadata } from 'next';
import { createBookAction } from '~/lib/actions/books';
import { BookForm } from '~/components/books/BookForm';

export const metadata: Metadata = { title: '책 추가' };

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-[var(--content-width)] px-4 py-[var(--space-lg)] sm:px-6">
      <h1 className="mb-8 font-heading text-3xl">책 추가</h1>
      <BookForm book={null} action={createBookAction} />
    </div>
  );
}
