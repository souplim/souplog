import {
  ATTACHMENT_CONTENT_TYPES,
  normalizeAttachmentName,
  POST_ATTACHMENT_BUCKET,
  POST_ATTACHMENT_PATH_PATTERN,
} from '~/lib/attachments';
import { IMAGE_CONTENT_TYPES, POST_IMAGE_BUCKET, POST_IMAGE_PATH_PATTERN } from '~/lib/images';

export interface MediaFile {
  bucket: string;
  path: string;
  contentType: string;
  /** Attachments are always downloaded, never shown inline. */
  isAttachment: boolean;
}

interface MediaBucket {
  pathPattern: RegExp;
  contentTypes: Readonly<Record<string, string>>;
  isAttachment: boolean;
}

const MEDIA_BUCKETS: Readonly<Record<string, MediaBucket>> = {
  [POST_IMAGE_BUCKET]: { pathPattern: POST_IMAGE_PATH_PATTERN, contentTypes: IMAGE_CONTENT_TYPES, isAttachment: false },
  [POST_ATTACHMENT_BUCKET]: {
    pathPattern: POST_ATTACHMENT_PATH_PATTERN,
    contentTypes: ATTACHMENT_CONTENT_TYPES,
    isAttachment: true,
  },
};

/**
 * What the media route may serve for a `/media/<bucket>/<file>` request, or
 * `null`. Only storage keys this app minted (`<uuid>.<extension>`) pass, and
 * the response type comes from that extension — never from what storage says.
 */
export function resolveMediaFile(bucket: string, file: string): MediaFile | null {
  const config = Object.hasOwn(MEDIA_BUCKETS, bucket) ? MEDIA_BUCKETS[bucket] : undefined;
  if (!config || !config.pathPattern.test(file)) return null;

  const extension = file.slice(file.lastIndexOf('.') + 1);
  const contentType = config.contentTypes[extension];
  if (!contentType) return null;

  return { bucket, path: file, contentType, isAttachment: config.isAttachment };
}

/** RFC 5987 leaves `'`, `(`, `)` and `*` out of what may appear unescaped. */
function encodeRfc5987(value: string): string {
  return encodeURIComponent(value).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

/**
 * The download header for an attachment. The plain `filename` is the ASCII
 * storage key; the original (often Korean) name rides in `filename*`, fully
 * percent-encoded so no quote or line break can end the header early.
 */
export function getAttachmentDisposition(name: string | null, path: string): string {
  const fallback = `attachment; filename="${path}"`;
  const normalized = name === null ? '' : normalizeAttachmentName(name);
  return normalized ? `${fallback}; filename*=UTF-8''${encodeRfc5987(normalized)}` : fallback;
}
