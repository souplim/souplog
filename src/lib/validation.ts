import { z } from 'zod';
import { MAX_PAGE_DESCRIPTION_LENGTH, MAX_PAGE_TITLE_LENGTH } from '~/lib/nav-items';
import { MAX_SITE_TITLE_LENGTH } from '~/lib/site-title';
import { BOOK_STATUSES, sanitizeForStatus } from '~/lib/book-shelf';
import { MAX_PROFILE_FACTS, MAX_PROFILE_LINKS, profileFactSchema, profileLinkSchema } from '~/lib/profile-fields';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, '비밀번호를 입력하세요.'),
});

export const postSchema = z.object({
  title: z.string().trim().min(1, '제목을 입력하세요.').max(200),
  slug: z.string().trim().max(200),
  content: z.string().max(100_000),
  excerpt: z.string().trim().max(300),
  menuId: z.union([z.uuid(), z.literal('')]).transform((value) => (value === '' ? null : value)),
  isPublic: z.boolean(),
});

export const menuSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력하세요.').max(50),
  slug: z.string().trim().max(50),
});

export const navItemSchema = z.object({
  label: z.string().trim().min(1, '이름을 입력하세요.').max(20),
});

/** Blank is allowed: the page then shows its default headline. */
export const pageHeadingSchema = z.object({
  title: z.string().trim().max(MAX_PAGE_TITLE_LENGTH, `제목은 ${MAX_PAGE_TITLE_LENGTH}자까지 쓸 수 있어요.`),
  description: z
    .string()
    .trim()
    .max(MAX_PAGE_DESCRIPTION_LENGTH, `설명은 ${MAX_PAGE_DESCRIPTION_LENGTH}자까지 쓸 수 있어요.`),
});

export const siteTitleSchema = z.object({
  title: z.string().trim().max(MAX_SITE_TITLE_LENGTH, `블로그 제목은 ${MAX_SITE_TITLE_LENGTH}자까지 쓸 수 있어요.`),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력하세요.').max(50),
  tagline: z.string().trim().max(160),
  content: z.string().max(20_000),
  facts: z.array(profileFactSchema).max(MAX_PROFILE_FACTS, `항목은 ${MAX_PROFILE_FACTS}개까지 쓸 수 있어요.`),
  links: z.array(profileLinkSchema).max(MAX_PROFILE_LINKS, `링크는 ${MAX_PROFILE_LINKS}개까지 쓸 수 있어요.`),
});

/** A form field that may be absent — the book form only renders the fields its status needs. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value ?? '');

const optionalInteger = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? Number(value) : null))
    .pipe(z.number(message).int(message).min(min, message).max(max, message).nullable());

const RATING_MESSAGE = '별점은 0.5~5 사이, 0.5점 단위여야 합니다.';

/** Half-star steps from 0.5 to 5; doubling turns each step into a whole number. */
const optionalRating = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? Number(value) : null))
  .pipe(
    z
      .number(RATING_MESSAGE)
      .min(0.5, RATING_MESSAGE)
      .max(5, RATING_MESSAGE)
      .refine((value) => Number.isInteger(value * 2), RATING_MESSAGE)
      .nullable(),
  );

const optionalDate = z
  .union([z.literal(''), z.iso.date('날짜 형식이 올바르지 않습니다.')])
  .optional()
  .transform((value) => value || null);

/** Generous enough for an encyclopedia, small enough to catch a typo'd extra digit. */
const MAX_BOOK_PAGES = 20_000;

export const bookSchema = z
  .object({
    title: z.string().trim().min(1, '제목을 입력하세요.').max(200),
    author: optionalText(200),
    publisher: optionalText(100),
    isbn: optionalText(20),
    status: z.enum(BOOK_STATUSES),
    totalPages: optionalInteger(1, MAX_BOOK_PAGES, '전체 쪽수를 확인하세요.'),
    startedAt: optionalDate,
    finishedAt: optionalDate,
    rating: optionalRating,
    note: optionalText(500),
    isPublic: z.boolean(),
  })
  .transform((input) =>
    sanitizeForStatus({
      title: input.title,
      author: input.author,
      publisher: input.publisher,
      isbn: input.isbn || null,
      status: input.status,
      total_pages: input.totalPages,
      started_at: input.startedAt,
      finished_at: input.finishedAt,
      rating: input.status === 'done' ? input.rating : null,
      note: input.note,
      is_public: input.isPublic,
    }),
  )
  .refine((book) => !book.started_at || !book.finished_at || book.finished_at >= book.started_at, {
    message: '다 읽은 날이 읽기 시작한 날보다 앞섭니다.',
  });

export const commentSchema = z.object({
  postId: z.uuid(),
  authorName: z.string().trim().min(1, '닉네임을 입력하세요.').max(40),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.').max(72),
  content: z.string().trim().min(1, '내용을 입력하세요.').max(2000),
});

export const deleteCommentSchema = z.object({
  commentId: z.uuid(),
  password: z.string().min(1, '비밀번호를 입력하세요.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type PostFormInput = z.infer<typeof postSchema>;
export type MenuFormInput = z.infer<typeof menuSchema>;
export type ProfileFormInput = z.infer<typeof profileSchema>;
export type CommentFormInput = z.infer<typeof commentSchema>;
export type BookFormOutput = z.output<typeof bookSchema>;
