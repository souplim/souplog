/**
 * Where the app serves stored files. The buckets are private, so every image
 * and attachment goes through `src/app/media/[bucket]/[file]/route.ts`, which
 * fetches it with the viewer's own session — storage RLS decides who sees what.
 */
export function getMediaUrl(bucket: string, path: string): string {
  return `/media/${bucket}/${path}`;
}
