import { z } from 'zod';
import { getSupabaseUrl } from '~/lib/supabase/env';

export const POST_ATTACHMENT_BUCKET = 'post-attachments';

/** Keeps a post's file list short enough to scan at a glance. */
export const MAX_POST_ATTACHMENTS = 10;

/** Mirrors the bucket's `file_size_limit` in supabase/schema.sql. */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const MAX_ATTACHMENT_NAME_LENGTH = 200;

/**
 * The only file types a post can carry, keyed by extension. The content type
 * is taken from here rather than from the browser — browsers leave `type`
 * empty for files like .hwp or .md, and a client-supplied type can't be
 * trusted anyway. Nothing the browser would render as a page (html, svg) is
 * on the list. Keep in sync with the bucket's `allowed_mime_types`.
 */
export const ATTACHMENT_CONTENT_TYPES: Readonly<Record<string, string>> = {
  pdf: 'application/pdf',
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  zip: 'application/zip',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  hwp: 'application/x-hwp',
  hwpx: 'application/hwp+zip',
};

/** For the file picker's `accept` attribute. */
export const ATTACHMENT_ACCEPT = Object.keys(ATTACHMENT_CONTENT_TYPES)
  .map((extension) => `.${extension}`)
  .join(',');

const EXTENSION_GROUP = Object.keys(ATTACHMENT_CONTENT_TYPES).join('|');

/**
 * Storage keys are minted server-side as `<uuid>.<extension>`; the original
 * filename lives only in `name`, for display and the download filename.
 */
const POST_ATTACHMENT_PATH_PATTERN = new RegExp(
  `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(${EXTENSION_GROUP})$`,
);

const postAttachmentSchema = z.object({
  path: z.string().regex(POST_ATTACHMENT_PATH_PATTERN),
  name: z.string().min(1).max(MAX_ATTACHMENT_NAME_LENGTH),
  size: z.number().int().nonnegative(),
});

export type PostAttachment = z.infer<typeof postAttachmentSchema>;

/** The allowed extension of `filename`, lower-cased, or undefined if it isn't one. */
export function getAttachmentExtension(filename: string): string | undefined {
  const match = /^.+\.([^.]+)$/.exec(filename);
  const extension = match?.[1]?.toLowerCase();
  return extension !== undefined && extension in ATTACHMENT_CONTENT_TYPES ? extension : undefined;
}

/**
 * The name shown on the post and used as the download filename: just the base
 * name (some browsers send a full path), without control characters.
 */
export function normalizeAttachmentName(filename: string): string {
  const baseName = filename.split(/[\\/]/).pop() ?? '';
  return baseName
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim()
    .slice(0, MAX_ATTACHMENT_NAME_LENGTH);
}

/**
 * `download` makes Supabase answer with `Content-Disposition: attachment`, so
 * the file is saved under its original name instead of opening in the tab.
 */
export function getPostAttachmentUrl(attachment: Pick<PostAttachment, 'path' | 'name'>): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/${POST_ATTACHMENT_BUCKET}/${attachment.path}?download=${encodeURIComponent(attachment.name)}`;
}

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export function formatFileSize(bytes: number): string {
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < SIZE_UNITS.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const rounded = unitIndex === 0 ? value : Math.round(value * 10) / 10;
  return `${rounded} ${SIZE_UNITS[unitIndex]}`;
}

/**
 * Normalizes the `attachments` jsonb column (or a form's round-tripped copy
 * of it). Malformed entries are skipped, not thrown on.
 */
export function parsePostAttachments(value: unknown): PostAttachment[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => postAttachmentSchema.safeParse(entry))
    .filter((result) => result.success)
    .map((result) => result.data)
    .slice(0, MAX_POST_ATTACHMENTS);
}

/** Same normalization for the JSON string the post form posts back. */
export function parsePostAttachmentsJson(value: unknown): PostAttachment[] {
  if (typeof value !== 'string' || value.length === 0) return [];

  try {
    return parsePostAttachments(JSON.parse(value));
  } catch {
    return [];
  }
}
