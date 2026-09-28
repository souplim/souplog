import { z } from 'zod';

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
export type CommentFormInput = z.infer<typeof commentSchema>;
