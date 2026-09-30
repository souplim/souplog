import { describe, expect, it } from 'vitest';
import { MAX_POST_IMAGES, parsePostImages, parsePostImagesJson } from './images';

const PATH = '0a1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9.webp';
const OTHER_PATH = '11111111-2222-3333-4444-555555555555.jpg';

describe('parsePostImages', () => {
  it('keeps well-formed entries in order', () => {
    const images = parsePostImages([
      { path: PATH, width: 1200, height: 800 },
      { path: OTHER_PATH, width: 640, height: 960 },
    ]);

    expect(images).toEqual([
      { path: PATH, width: 1200, height: 800 },
      { path: OTHER_PATH, width: 640, height: 960 },
    ]);
  });

  it('keeps a legacy entry that has no recorded size', () => {
    expect(parsePostImages([{ path: PATH }])).toEqual([{ path: PATH }]);
  });

  it('drops entries whose path was not minted by this app', () => {
    expect(parsePostImages([{ path: '../secret.png' }, { path: 'photo.jpg' }, { path: PATH }])).toEqual([
      { path: PATH },
    ]);
  });

  it('drops entries with a non-positive size', () => {
    expect(parsePostImages([{ path: PATH, width: 0, height: 100 }])).toEqual([]);
  });

  it('returns an empty list for a non-array value', () => {
    expect(parsePostImages(null)).toEqual([]);
    expect(parsePostImages({ path: PATH })).toEqual([]);
    expect(parsePostImages(undefined)).toEqual([]);
  });

  it('caps the list at the gallery maximum', () => {
    const images = parsePostImages(Array.from({ length: MAX_POST_IMAGES + 5 }, () => ({ path: PATH })));
    expect(images).toHaveLength(MAX_POST_IMAGES);
  });
});

describe('parsePostImagesJson', () => {
  it('parses a JSON array posted back by the form', () => {
    expect(parsePostImagesJson(JSON.stringify([{ path: PATH, width: 10, height: 20 }]))).toEqual([
      { path: PATH, width: 10, height: 20 },
    ]);
  });

  it('returns an empty list for malformed or missing JSON', () => {
    expect(parsePostImagesJson('not json')).toEqual([]);
    expect(parsePostImagesJson('')).toEqual([]);
    expect(parsePostImagesJson(null)).toEqual([]);
  });
});
