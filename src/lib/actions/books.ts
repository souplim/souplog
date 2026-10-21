'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '~/lib/auth';
import type { BookSearchResult } from '~/lib/book-search';
import { applyStatusChange, BOOK_STATUSES, todayInSeoul, type BookStatus } from '~/lib/book-shelf';
import { createBook, deleteBook, getBookById, updateBook, updateBookProgress, type BookInput } from '~/lib/books';
import { uploadPostImage } from '~/lib/image-upload';
import { parsePostImageJson, type PostImage } from '~/lib/images';
import { searchKakaoBooks } from '~/lib/kakao-books';
import { downloadCover } from '~/lib/remote-cover';
import { bookSchema } from '~/lib/validation';

export interface BookFormState {
  error?: string;
}

const SHELF_PATH = '/books';

function bookPath(id: string): string {
  return `${SHELF_PATH}/${id}`;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * A file picked from disk wins, then a cover picked from search results
 * (`coverUrl`), then whatever the form kept — empty `keptCover` means removed.
 */
async function resolveCover(formData: FormData): Promise<PostImage | null> {
  const file = formData.get('cover');
  if (file instanceof File && file.size > 0) return uploadPostImage(file);

  const coverUrl = formData.get('coverUrl');
  if (typeof coverUrl === 'string' && coverUrl.length > 0) return uploadPostImage(await downloadCover(coverUrl));

  return parsePostImageJson(formData.get('keptCover'));
}

/** Fields the form didn't render come back as `null`; the schema reads those as empty. */
function field(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  return typeof value === 'string' ? value : undefined;
}

async function parseBookForm(formData: FormData): Promise<{ input: BookInput } | { error: string }> {
  const parsed = bookSchema.safeParse({
    title: field(formData, 'title'),
    author: field(formData, 'author'),
    publisher: field(formData, 'publisher'),
    isbn: field(formData, 'isbn'),
    status: field(formData, 'status'),
    totalPages: field(formData, 'totalPages'),
    currentPage: field(formData, 'currentPage'),
    startedAt: field(formData, 'startedAt'),
    finishedAt: field(formData, 'finishedAt'),
    rating: field(formData, 'rating'),
    note: field(formData, 'note'),
    isPublic: formData.get('isPublic') === 'on',
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? '입력을 확인하세요.' };
  }

  try {
    return { input: { ...parsed.data, cover: await resolveCover(formData) } };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, '표지를 처리하지 못했습니다.') };
  }
}

export async function createBookAction(
  _prevState: BookFormState | undefined,
  formData: FormData,
): Promise<BookFormState> {
  await requireUser();

  const result = await parseBookForm(formData);
  if ('error' in result) return result;

  let id: string;
  try {
    id = (await createBook(result.input)).id;
  } catch (error: unknown) {
    return { error: getErrorMessage(error, '책을 추가하지 못했습니다.') };
  }

  revalidatePath(SHELF_PATH);
  redirect(bookPath(id));
}

export async function updateBookAction(
  bookId: string,
  _prevState: BookFormState | undefined,
  formData: FormData,
): Promise<BookFormState> {
  await requireUser();

  const result = await parseBookForm(formData);
  if ('error' in result) return result;

  try {
    await updateBook(bookId, result.input);
  } catch (error: unknown) {
    return { error: getErrorMessage(error, '책을 수정하지 못했습니다.') };
  }

  revalidatePath(SHELF_PATH);
  revalidatePath(bookPath(bookId));
  redirect(bookPath(bookId));
}

/** The one-tap "읽기 시작" / "다 읽음" buttons on the book page. */
export async function changeBookStatusAction(bookId: string, next: BookStatus): Promise<void> {
  await requireUser();
  if (!BOOK_STATUSES.includes(next)) throw new Error('알 수 없는 상태입니다.');

  const book = await getBookById(bookId);
  if (!book) throw new Error('책을 찾을 수 없습니다.');

  const { status, total_pages, current_page, started_at, finished_at } = applyStatusChange(book, next, todayInSeoul());
  await updateBookProgress(bookId, { status, total_pages, current_page, started_at, finished_at });

  revalidatePath(SHELF_PATH);
  revalidatePath(bookPath(bookId));
}

export async function updateBookPageAction(
  bookId: string,
  _prevState: BookFormState | undefined,
  formData: FormData,
): Promise<BookFormState> {
  await requireUser();

  const book = await getBookById(bookId);
  if (!book) return { error: '책을 찾을 수 없습니다.' };

  const page = Number(formData.get('currentPage'));
  const lastPage = book.total_pages ?? Number.MAX_SAFE_INTEGER;
  if (!Number.isInteger(page) || page < 0 || page > lastPage) {
    return { error: book.total_pages ? `0~${book.total_pages} 사이로 입력하세요.` : '쪽수를 확인하세요.' };
  }

  try {
    const { status, total_pages, started_at, finished_at } = book;
    await updateBookProgress(bookId, { status, total_pages, current_page: page, started_at, finished_at });
  } catch (error: unknown) {
    return { error: getErrorMessage(error, '읽은 쪽수를 저장하지 못했습니다.') };
  }

  revalidatePath(SHELF_PATH);
  revalidatePath(bookPath(bookId));
  return {};
}

const MAX_SEARCH_QUERY_LENGTH = 100;

export type BookSearchState = { results: BookSearchResult[] } | { error: string };

/** Owner-only: the search box in the book form. */
export async function searchBooksAction(query: string): Promise<BookSearchState> {
  await requireUser();

  const trimmed = query.trim();
  if (trimmed.length === 0) return { error: '검색어를 입력하세요.' };
  if (trimmed.length > MAX_SEARCH_QUERY_LENGTH) return { error: '검색어가 너무 깁니다.' };

  try {
    return { results: await searchKakaoBooks(trimmed) };
  } catch (error: unknown) {
    return { error: getErrorMessage(error, '책을 검색하지 못했습니다.') };
  }
}

export async function deleteBookAction(bookId: string): Promise<void> {
  await requireUser();
  await deleteBook(bookId);
  revalidatePath(SHELF_PATH);
  redirect(SHELF_PATH);
}
