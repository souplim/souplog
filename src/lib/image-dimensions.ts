/**
 * Intrinsic pixel size read straight from an image file's header bytes.
 *
 * The post pages need `width`/`height` to reserve the right box before the
 * image loads — without them a photo either shifts the layout or has to be
 * squeezed into a fixed aspect box and cropped. Reading the header here (at
 * upload time) keeps that out of the render path and avoids a native image
 * dependency: every format the bucket accepts stores its size in the first
 * few dozen bytes.
 *
 * Returns `null` for anything unrecognized or truncated — callers treat the
 * size as simply unknown rather than failing the upload.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

/** Enough for a JPEG whose SOF marker sits behind a large EXIF thumbnail. */
export const IMAGE_HEADER_BYTES = 256 * 1024;

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function readImageDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (startsWith(bytes, PNG_SIGNATURE)) return readPngDimensions(bytes);
  if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return readGifDimensions(bytes);
  if (startsWith(bytes, [0xff, 0xd8])) return readJpegDimensions(bytes);
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && matchesAt(bytes, 8, [0x57, 0x45, 0x42, 0x50])) {
    return readWebpDimensions(bytes);
  }
  return null;
}

function readPngDimensions(bytes: Uint8Array): ImageDimensions | null {
  // IHDR is always the first chunk: 8 signature + 4 length + 4 type bytes.
  if (bytes.length < 24) return null;
  return size(readUint32BE(bytes, 16), readUint32BE(bytes, 20));
}

function readGifDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 10) return null;
  return size(readUint16LE(bytes, 6), readUint16LE(bytes, 8));
}

/**
 * JPEG keeps its size in a start-of-frame marker somewhere after the
 * metadata segments, so the segment chain has to be walked to find it.
 */
function readJpegDimensions(bytes: Uint8Array): ImageDimensions | null {
  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;

    const marker = bytes[offset + 1];
    // Padding (0xFF) and standalone markers carry no length field.
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    if (isStartOfFrame(marker)) {
      return size(readUint16BE(bytes, offset + 7), readUint16BE(bytes, offset + 5));
    }

    const segmentLength = readUint16BE(bytes, offset + 2);
    if (segmentLength < 2) return null;
    offset += 2 + segmentLength;
  }

  return null;
}

/** SOF0–SOF15, minus the DHT/JPG/DAC markers that share the range. */
function isStartOfFrame(marker: number): boolean {
  return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

function readWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (matchesAt(bytes, 12, [0x56, 0x50, 0x38, 0x20])) return readLossyWebpDimensions(bytes);
  if (matchesAt(bytes, 12, [0x56, 0x50, 0x38, 0x4c])) return readLosslessWebpDimensions(bytes);
  if (matchesAt(bytes, 12, [0x56, 0x50, 0x38, 0x58])) return readExtendedWebpDimensions(bytes);
  return null;
}

function readLossyWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 30) return null;
  // VP8 key frame: 3-byte frame tag, then the 0x9D 0x01 0x2A sync code.
  if (!matchesAt(bytes, 23, [0x9d, 0x01, 0x2a])) return null;
  // The top two bits of each 16-bit field are a scaling hint, not size.
  return size(readUint16LE(bytes, 26) & 0x3fff, readUint16LE(bytes, 28) & 0x3fff);
}

function readLosslessWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 25) return null;
  if (bytes[20] !== 0x2f) return null;
  // 14 bits each, stored minus one, packed little-endian after the signature.
  const packed = readUint32LE(bytes, 21);
  return size((packed & 0x3fff) + 1, ((packed >>> 14) & 0x3fff) + 1);
}

function readExtendedWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 30) return null;
  return size(readUint24LE(bytes, 24) + 1, readUint24LE(bytes, 27) + 1);
}

function size(width: number, height: number): ImageDimensions | null {
  if (!Number.isInteger(width) || !Number.isInteger(height)) return null;
  if (width <= 0 || height <= 0) return null;
  return { width, height };
}

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  return matchesAt(bytes, 0, signature);
}

function matchesAt(bytes: Uint8Array, offset: number, signature: readonly number[]): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

function readUint16BE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function readUint16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function readUint24LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16);
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] * 0x1000000 + ((bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3])
  );
}

function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16) + bytes[offset + 3] * 0x1000000
  );
}
