import { describe, expect, it } from 'vitest';
import { readImageDimensions } from './image-dimensions';

function bytes(...values: number[]): Uint8Array {
  return Uint8Array.from(values);
}

function uint16BE(value: number): number[] {
  return [(value >> 8) & 0xff, value & 0xff];
}

function uint16LE(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff];
}

function uint24LE(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff];
}

function uint32BE(value: number): number[] {
  return [(value >> 24) & 0xff, (value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function png(width: number, height: number): Uint8Array {
  return bytes(
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ...uint32BE(13),
    0x49, 0x48, 0x44, 0x52,
    ...uint32BE(width),
    ...uint32BE(height),
  );
}

function gif(width: number, height: number): Uint8Array {
  return bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61, ...uint16LE(width), ...uint16LE(height));
}

/** SOI, an APP0 segment to skip over, then the SOF0 that carries the size. */
function jpeg(width: number, height: number): Uint8Array {
  return bytes(
    0xff, 0xd8,
    0xff, 0xe0, ...uint16BE(6), 0x4a, 0x46, 0x49, 0x46,
    0xff, 0xc0, ...uint16BE(11), 0x08, ...uint16BE(height), ...uint16BE(width), 0x03,
    0xff, 0xd9,
  );
}

function riffHeader(chunk: string): number[] {
  const ascii = (text: string) => [...text].map((character) => character.charCodeAt(0));
  return [...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP'), ...ascii(chunk), 0, 0, 0, 0];
}

function lossyWebp(width: number, height: number): Uint8Array {
  return bytes(
    ...riffHeader('VP8 '),
    0x00, 0x00, 0x00,
    0x9d, 0x01, 0x2a,
    ...uint16LE(width),
    ...uint16LE(height),
  );
}

function losslessWebp(width: number, height: number): Uint8Array {
  const packed = (width - 1) | ((height - 1) << 14);
  return bytes(
    ...riffHeader('VP8L'),
    0x2f,
    packed & 0xff,
    (packed >>> 8) & 0xff,
    (packed >>> 16) & 0xff,
    (packed >>> 24) & 0xff,
  );
}

function extendedWebp(width: number, height: number): Uint8Array {
  return bytes(
    ...riffHeader('VP8X'),
    0x10, 0x00, 0x00, 0x00,
    ...uint24LE(width - 1),
    ...uint24LE(height - 1),
  );
}

describe('readImageDimensions', () => {
  it('reads a PNG size from the IHDR chunk', () => {
    expect(readImageDimensions(png(1920, 1080))).toEqual({ width: 1920, height: 1080 });
  });

  it('reads a GIF size from the logical screen descriptor', () => {
    expect(readImageDimensions(gif(320, 240))).toEqual({ width: 320, height: 240 });
  });

  it('walks past JPEG metadata segments to the start-of-frame marker', () => {
    expect(readImageDimensions(jpeg(4032, 3024))).toEqual({ width: 4032, height: 3024 });
  });

  it('reads a lossy WebP size after the VP8 sync code', () => {
    expect(readImageDimensions(lossyWebp(800, 1200))).toEqual({ width: 800, height: 1200 });
  });

  it('reads a lossless WebP size from the packed VP8L header', () => {
    expect(readImageDimensions(losslessWebp(1024, 768))).toEqual({ width: 1024, height: 768 });
  });

  it('reads an extended WebP size from the VP8X canvas fields', () => {
    expect(readImageDimensions(extendedWebp(2000, 1500))).toEqual({ width: 2000, height: 1500 });
  });

  it('returns null for an unrecognized format', () => {
    expect(readImageDimensions(bytes(0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07))).toBeNull();
  });

  it('returns null when the header is truncated', () => {
    expect(readImageDimensions(png(100, 100).slice(0, 18))).toBeNull();
  });

  it('returns null for a zero-sized image', () => {
    expect(readImageDimensions(png(0, 0))).toBeNull();
  });
});
