import { describe, expect, it } from 'vitest';
import { ProgressParserService } from '../ProgressParserService.js';
describe('ProgressParserService', () => {
    it('parses standard yt-dlp progress lines', () => {
        const parser = new ProgressParserService();
        const progress = parser.parseLine('[download]  42.5% of 12.3MiB at 1.2MiB/s ETA 00:18');
        expect(progress?.percent).toBe(42.5);
        expect(progress?.size).toBe('12.3MiB');
        expect(progress?.speed).toContain('1.2MiB/s');
        expect(progress?.eta).toBe('00:18');
    });
    it('marks completion at 100 percent', () => {
        const parser = new ProgressParserService();
        const progress = parser.parseLine('[download] 100% of 12.3MiB in 00:18');
        expect(progress?.percent).toBe(100);
        expect(progress?.status).toBe('downloading');
    });
});
