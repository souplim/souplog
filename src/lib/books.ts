import 'server-only';
import { cache } from 'react';
import type { BookProgress } from '~/lib/book-shelf';
import { parsePostImage, type PostImage } from '~/lib/images';
import { createClient } from '~/lib/supabase/server';
import type { Book, BookRow } from '~/lib/supabase/types';
import type { BookFormOutput } from '~/lib/validation';

export type BookInput = BookFormOutput & { cover: PostImage | null };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toBook(row: BookRow): Book {
  return { ...row, cover: parsePostImage(row.cover) };
}

/**
 * Every book the viewer may see — RLS leaves out hidden books for visitors.
 * The whole shelf is one page, so it's one query; a personal shelf stays
 * small enough that paging would only get in the way.
 */
export const getBooks = cache(async (): Promise<Book[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(`책장을 불러오지 못했습니다: ${error.message}`);
  return data.map(toBook);
});

/** Cached per request: the book page and its metadata both ask for it. */
export const getBookById = cache(async (id: string): Promise<Book | null> => {
  // A malformed id would make Postgres throw on the uuid cast — it's just a book that doesn't exist.
  if (!UUID_PATTERN.test(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from('books').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`책을 불러오지 못했습니다: ${error.message}`);
  return data ? toBook(data) : null;
});

function getSaveErrorMessage(error: { code?: string; message: string }): string {
  // 23505: unique_violation — the only unique column a save can trip is isbn.
  if (error.code === '23505') return '이미 책장에 있는 ISBN입니다.';
  return error.message;
}

export async function createBook(input: BookInput): Promise<Book> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('books').insert(input).select('*').single();
  if (error) throw new Error(`책을 추가하지 못했습니다: ${getSaveErrorMessage(error)}`);
  return toBook(data);
}

export async function updateBook(id: string, input: BookInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('books').update(input).eq('id', id);
  if (error) throw new Error(`책을 수정하지 못했습니다: ${getSaveErrorMessage(error)}`);
}

/** Writes just the reading record — the one-tap status buttons and the bookmark form. */
export async function updateBookProgress(id: string, progress: BookProgress): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('books').update(progress).eq('id', id);
  if (error) throw new Error(`읽기 기록을 저장하지 못했습니다: ${error.message}`);
}

export async function deleteBook(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw new Error(`책을 삭제하지 못했습니다: ${error.message}`);
}
