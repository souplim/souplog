import { describe, expect, it } from 'vitest';
import { getPostAttachmentUrl } from './attachments';
import { getPostImageUrl } from './images';
import { getAttachmentDisposition, resolveMediaFile } from './media';

const IMAGE_PATH = '0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9.webp';
const ATTACHMENT_PATH = '0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9.pdf';

describe('resolveMediaFile', () => {
  it('serves a post image with the type its extension stands for', () => {
    expect(resolveMediaFile('post-images', IMAGE_PATH)).toEqual({
      bucket: 'post-images',
      path: IMAGE_PATH,
      contentType: 'image/webp',
      isAttachment: false,
    });
  });

  it('serves an attachment as a download with its own content type', () => {
    expect(resolveMediaFile('post-attachments', ATTACHMENT_PATH)).toEqual({
      bucket: 'post-attachments',
      path: ATTACHMENT_PATH,
      contentType: 'application/pdf',
      isAttachment: true,
    });
  });

  it('rejects buckets the app does not serve', () => {
    expect(resolveMediaFile('avatars', IMAGE_PATH)).toBeNull();
  });

  it('rejects paths the app did not mint', () => {
    expect(resolveMediaFile('post-images', '../secret.webp')).toBeNull();
    expect(resolveMediaFile('post-images', 'photo.webp')).toBeNull();
    expect(resolveMediaFile('post-images', ATTACHMENT_PATH)).toBeNull();
    expect(resolveMediaFile('post-attachments', IMAGE_PATH)).toBeNull();
  });
});

describe('getAttachmentDisposition', () => {
  it('encodes a Korean filename for the download dialog', () => {
    expect(getAttachmentDisposition('발표 자료.pdf', ATTACHMENT_PATH)).toBe(
      `attachment; filename="${ATTACHMENT_PATH}"; filename*=UTF-8''%EB%B0%9C%ED%91%9C%20%EC%9E%90%EB%A3%8C.pdf`,
    );
  });

  it('cannot be broken out of with quotes or line breaks', () => {
    const header = getAttachmentDisposition('a"\r\nSet-Cookie: x=1.pdf', ATTACHMENT_PATH);
    expect(header).not.toMatch(/[\r\n]/);
    expect(header).toContain(`filename*=UTF-8''a%22Set-Cookie%3A%20x%3D1.pdf`);
  });

  it('falls back to the storage key when no name is given', () => {
    expect(getAttachmentDisposition(null, ATTACHMENT_PATH)).toBe(`attachment; filename="${ATTACHMENT_PATH}"`);
  });
});

describe('media URLs', () => {
  it('points images and attachments at the app, not at the storage bucket', () => {
    expect(getPostImageUrl(IMAGE_PATH)).toBe(`/media/post-images/${IMAGE_PATH}`);
    expect(getPostAttachmentUrl({ path: ATTACHMENT_PATH, name: '보고서.pdf' })).toBe(
      `/media/post-attachments/${ATTACHMENT_PATH}?download=%EB%B3%B4%EA%B3%A0%EC%84%9C.pdf`,
    );
  });
});
