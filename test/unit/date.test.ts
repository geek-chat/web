import { formatTime, isSameDay, isSameMinute } from '../../src/utils/date';

describe('formatTime', () => {
  it('should format ISO string to HH:mm', () => {
    const result = formatTime('2024-01-15T14:30:00.000Z');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it('should handle midnight', () => {
    const result = formatTime('2024-01-15T00:00:00.000Z');
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});

describe('isSameDay', () => {
  it('should return true for same day', () => {
    expect(isSameDay('2024-01-15T01:00:00Z', '2024-01-15T02:00:00Z')).toBe(true);
  });

  it('should return false for different days', () => {
    expect(isSameDay('2024-01-15T00:00:00Z', '2024-01-17T00:00:00Z')).toBe(false);
  });
});

describe('isSameMinute', () => {
  it('should return true for same minute', () => {
    expect(isSameMinute('2024-01-15T14:30:00Z', '2024-01-15T14:30:59Z')).toBe(true);
  });

  it('should return false for different minutes', () => {
    expect(isSameMinute('2024-01-15T14:30:00Z', '2024-01-15T14:31:00Z')).toBe(false);
  });

  it('should return false for different hours', () => {
    expect(isSameMinute('2024-01-15T14:30:00Z', '2024-01-15T15:30:00Z')).toBe(false);
  });
});
