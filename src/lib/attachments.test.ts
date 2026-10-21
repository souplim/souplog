import { describe, expect, it } from 'vitest';
import {
  formatFileSize,
  getAttachmentExtension,
  MAX_POST_ATTACHMENTS,
  normalizeAttachmentName,
  parsePostAttachments,
  parsePostAttachmentsJson,
} from './attachments';

const PATH = '0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9.pdf';
const OTHER_PATH = '11111111-2222-3333-4444-555555555555.zip';

describe('parsePostAttachments', () => {
  it('keeps well-formed entries in order', () => {
    const attachments = parsePostAttachments([
      { path: PATH, name: '발표자료.pdf', size: 2048 },
      { path: OTHER_PATH, name: 'source.zip', size: 10 },
    ]);

    expect(attachments).toEqual([
      { path: PATH, name: '발표자료.pdf', size: 2048 },
      { path: OTHER_PATH, name: 'source.zip', size: 10 },
    ]);
  });

  it('drops entries whose path was not minted by this app', () => {
    expect(
      parsePostAttachments([
        { path: '../secret.pdf', name: 'a.pdf', size: 1 },
        { path: 'report.pdf', name: 'a.pdf', size: 1 },
        { path: '0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9.html', name: 'a.html', size: 1 },
        { path: PATH, name: 'a.pdf', size: 1 },
      ]),
    ).toEqual([{ path: PATH, name: 'a.pdf', size: 1 }]);
  });

  it('drops entries missing a name or with a negative size', () => {
    expect(
      parsePostAttachments([
        { path: PATH, name: '', size: 1 },
        { path: PATH, size: 1 },
        { path: PATH, name: 'a.pdf', size: -1 },
      ]),
    ).toEqual([]);
  });

  it('returns an empty list for a non-array value', () => {
    expect(parsePostAttachments(null)).toEqual([]);
    expect(parsePostAttachments(undefined)).toEqual([]);
    expect(parsePostAttachments({ path: PATH, name: 'a.pdf', size: 1 })).toEqual([]);
  });

  it('caps the list at the attachment maximum', () => {
    const attachments = parsePostAttachments(
      Array.from({ length: MAX_POST_ATTACHMENTS + 3 }, () => ({ path: PATH, name: 'a.pdf', size: 1 })),
    );
    expect(attachments).toHaveLength(MAX_POST_ATTACHMENTS);
  });
});

describe('parsePostAttachmentsJson', () => {
  it('parses a JSON array posted back by the form', () => {
    expect(parsePostAttachmentsJson(JSON.stringify([{ path: PATH, name: 'a.pdf', size: 3 }]))).toEqual([
      { path: PATH, name: 'a.pdf', size: 3 },
    ]);
  });

  it('returns an empty list for malformed or missing JSON', () => {
    expect(parsePostAttachmentsJson('not json')).toEqual([]);
    expect(parsePostAttachmentsJson('')).toEqual([]);
    expect(parsePostAttachmentsJson(null)).toEqual([]);
  });
});

describe('getAttachmentExtension', () => {
  it('returns the lower-cased extension of an allowed file type', () => {
    expect(getAttachmentExtension('Report.PDF')).toBe('pdf');
    expect(getAttachmentExtension('기획서.hwpx')).toBe('hwpx');
    expect(getAttachmentExtension('archive.tar.zip')).toBe('zip');
  });

  it('returns undefined for disallowed or missing extensions', () => {
    expect(getAttachmentExtension('page.html')).toBeUndefined();
    expect(getAttachmentExtension('script.exe')).toBeUndefined();
    expect(getAttachmentExtension('README')).toBeUndefined();
    expect(getAttachmentExtension('.pdf')).toBeUndefined();
  });
});

describe('normalizeAttachmentName', () => {
  it('strips directory parts and control characters', () => {
    expect(normalizeAttachmentName('C:\\Users\\me\\보고서.pdf')).toBe('보고서.pdf');
    expect(normalizeAttachmentName('a/b/c.zip')).toBe('c.zip');
    expect(normalizeAttachmentName('na\u0000me\n.txt')).toBe('name.txt');
  });

  it('trims surrounding whitespace and caps the length', () => {
    expect(normalizeAttachmentName('  notes.md  ')).toBe('notes.md');
    expect(normalizeAttachmentName(`${'a'.repeat(300)}.pdf`)).toHaveLength(200);
  });
});

describe('formatFileSize', () => {
  it('formats bytes into a short human-readable size', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10 * 1024 * 1024)).toBe('10 MB');
  });
});
