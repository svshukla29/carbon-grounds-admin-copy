import { resolve, sep } from 'path';
import { BadRequestException } from '@nestjs/common';

/**
 * Resolves a client-supplied filename against an uploads directory and
 * guarantees the result cannot escape that directory (path traversal via
 * `../` or similar). Throws instead of returning an unsafe path.
 *
 * Also enforces a strict filename shape up front — every file in these
 * upload directories is server-generated as `<timestamp>-<random>.<ext>`,
 * so anything that doesn't match that pattern is rejected outright.
 */
export function safeUploadPath(uploadsDir: string, filename: string): string {
  if (!/^[0-9]+-[0-9]+\.[a-zA-Z0-9]{2,5}$/.test(filename)) {
    throw new BadRequestException('Invalid filename');
  }

  const base = resolve(uploadsDir);
  const target = resolve(base, filename);

  if (target !== base && !target.startsWith(base + sep)) {
    throw new BadRequestException('Invalid filename');
  }

  return target;
}
