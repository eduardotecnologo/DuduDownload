import { describe, expect, it } from 'vitest';
import { formatBytes, formatDuration, getParentDirectory } from '../utils';

describe('utils', () => {
  it('formats bytes and duration', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatDuration(125)).toBe('2m 05s');
  });

  it('resolves parent directory', () => {
    expect(getParentDirectory('/Users/demo/Downloads/video.mp4')).toBe('/Users/demo/Downloads');
  });
});
