import * as fs from 'fs';

/**
 * Verifies a file's actual content matches one of the given allowed types,
 * by checking its magic-byte signature — not the client-supplied MIME type
 * or filename extension, both of which are trivially spoofable.
 */
export type AllowedFileKind = 'png' | 'jpeg' | 'webp' | 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx';

function matchesSignature(header: Buffer, kind: AllowedFileKind): boolean {
  switch (kind) {
    case 'png':
      return header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
    case 'jpeg':
      return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    case 'webp':
      return (
        header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46 &&
        header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50
      );
    case 'pdf':
      return header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46;
    case 'doc':
    case 'xls':
      // Legacy MS Office binary format (OLE Compound File)
      return header[0] === 0xd0 && header[1] === 0xcf && header[2] === 0x11 && header[3] === 0xe0;
    case 'docx':
    case 'xlsx':
      // Modern MS Office formats are ZIP archives
      return header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04;
    default:
      return false;
  }
}

/** Reads the first bytes of a saved file and checks them against the allowed kinds. */
export function verifyFileSignature(filePath: string, allowed: AllowedFileKind[]): boolean {
  const fd = fs.openSync(filePath, 'r');
  try {
    const header = Buffer.alloc(12);
    fs.readSync(fd, header, 0, 12, 0);
    return allowed.some((kind) => matchesSignature(header, kind));
  } finally {
    fs.closeSync(fd);
  }
}
