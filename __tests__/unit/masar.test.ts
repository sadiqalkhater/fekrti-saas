import { addDays, dueStatus, POSITION_GAP, positionBetween, ymd } from '@/lib/masar/shared';

describe('Masar shared helpers', () => {
  describe('positionBetween', () => {
    it('places the first item at the gap', () => {
      expect(positionBetween([], -1)).toBe(POSITION_GAP);
    });

    it('appends after the last item', () => {
      expect(positionBetween([1024, 2048], -1)).toBe(2048 + POSITION_GAP);
    });

    it('inserts between two items', () => {
      expect(positionBetween([1024, 2048], 1)).toBe(1536);
    });

    it('inserts before the first item', () => {
      const pos = positionBetween([1024, 2048], 0);
      expect(pos).toBeLessThan(1024);
    });
  });

  describe('dueStatus', () => {
    const today = new Date(2026, 9, 22);

    it('is null without a due date', () => {
      expect(dueStatus(null, false, today)).toBeNull();
    });

    it('is done when the card is done, even if late', () => {
      expect(dueStatus('2026-10-01', true, today)).toBe('done');
    });

    it('classifies overdue, soon, and later', () => {
      expect(dueStatus('2026-10-21', false, today)).toBe('overdue');
      expect(dueStatus('2026-10-22', false, today)).toBe('soon');
      expect(dueStatus('2026-10-24', false, today)).toBe('soon');
      expect(dueStatus('2026-10-25', false, today)).toBe('later');
    });
  });

  it('formats and offsets local dates', () => {
    expect(ymd(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(addDays(1, new Date(2026, 11, 31))).toBe('2027-01-01');
  });
});
