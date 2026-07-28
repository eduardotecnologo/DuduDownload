import { describe, expect, it } from 'vitest';
import { buildYtDlpArgs, buildOutputTemplate } from '../ytdlpPreset.js';
describe('ytdlpPreset', () => {
    it('builds a download command for mp3', () => {
        const args = buildYtDlpArgs({
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            format: 'mp3',
            quality: 'best',
            mp3Bitrate: 320
        }, buildOutputTemplate('/tmp/downloads'));
        expect(args).toContain('-o');
        expect(args).toContain('--print');
        expect(args).toContain('after_move:filepath');
        expect(args).toContain('--audio-format');
        expect(args).toContain('mp3');
        expect(args).toContain('320');
    });
});
