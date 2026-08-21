import { describe, it, expect, beforeEach } from 'vitest';
import { trackDownload, getDownloadHistory, clearDownloadHistory } from '../utils/analytics.js';

describe('analytics utility', () => {
  beforeEach(() => {
    clearDownloadHistory();
  });

  it('records download event and stores it in localStorage', () => {
    const file = { id: 'file-123', name: 'DSA-Notes.pdf', category: 'Notes' };
    const event = trackDownload(file);

    expect(event.id).toBe('file-123');
    expect(event.fileName).toBe('DSA-Notes.pdf');
    expect(event.category).toBe('Notes');

    const history = getDownloadHistory();
    expect(history.length).toBe(1);
    expect(history[0].id).toBe('file-123');
  });

  it('caps history size at 50 events', () => {
    for (let i = 0; i < 55; i++) {
      trackDownload({ id: `file-${i}`, name: `File-${i}.pdf` });
    }
    const history = getDownloadHistory();
    expect(history.length).toBe(50);
    expect(history[history.length - 1].id).toBe('file-54');
  });

  it('clears download history correctly', () => {
    trackDownload({ id: 'file-1' });
    expect(getDownloadHistory().length).toBe(1);

    clearDownloadHistory();
    expect(getDownloadHistory().length).toBe(0);
  });
});
