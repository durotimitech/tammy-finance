import { formatCurrency, formatCompactNumber, groupBy, calculateSubtotals } from './utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('formats currency in EUR format', () => {
      expect(formatCurrency(1234.56)).toBe('€1,234.56');
      expect(formatCurrency(0)).toBe('€0.00');
      expect(formatCurrency(1000000)).toBe('€1,000,000.00');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats large numbers with M suffix', () => {
      expect(formatCompactNumber(1500000)).toBe('$1.5M');
      expect(formatCompactNumber(1000000)).toBe('$1.0M');
      expect(formatCompactNumber(2750000)).toBe('$2.8M');
    });

    it('formats thousands with K suffix', () => {
      expect(formatCompactNumber(1500)).toBe('$2K');
      expect(formatCompactNumber(15000)).toBe('$15K');
      expect(formatCompactNumber(999999)).toBe('$1000K');
    });

    it('formats small numbers without suffix', () => {
      expect(formatCompactNumber(999)).toBe('$999');
      expect(formatCompactNumber(0)).toBe('$0');
      expect(formatCompactNumber(100)).toBe('$100');
    });

    it('accepts custom prefix', () => {
      expect(formatCompactNumber(1500000, '€')).toBe('€1.5M');
      expect(formatCompactNumber(15000, '£')).toBe('£15K');
      expect(formatCompactNumber(100, '')).toBe('100');
    });
  });

  describe('groupBy', () => {
    it('groups array of objects by specified key', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
        { category: 'A', value: 30 },
        { category: 'C', value: 40 },
      ];

      const grouped = groupBy(data, 'category');

      expect(grouped).toEqual({
        A: [
          { category: 'A', value: 10 },
          { category: 'A', value: 30 },
        ],
        B: [{ category: 'B', value: 20 }],
        C: [{ category: 'C', value: 40 }],
      });
    });

    it('handles empty arrays', () => {
      expect(groupBy([], 'category')).toEqual({});
    });

    it('converts non-string keys to strings', () => {
      const data = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 1, name: 'C' },
      ];

      const grouped = groupBy(data, 'id');

      expect(grouped).toEqual({
        '1': [
          { id: 1, name: 'A' },
          { id: 1, name: 'C' },
        ],
        '2': [{ id: 2, name: 'B' }],
      });
    });
  });

  describe('calculateSubtotals', () => {
    it('calculates subtotals for grouped data', () => {
      const groupedData = {
        A: [
          { category: 'A', value: 10 },
          { category: 'A', value: 30 },
        ],
        B: [{ category: 'B', value: 20 }],
        C: [{ category: 'C', value: 40 }],
      };

      const subtotals = calculateSubtotals(groupedData, 'value');

      expect(subtotals).toEqual({
        A: 40,
        B: 20,
        C: 40,
      });
    });

    it('handles empty groups', () => {
      expect(calculateSubtotals({}, 'value')).toEqual({});
    });

    it('handles non-numeric values', () => {
      const groupedData = {
        A: [
          { category: 'A', value: 10 },
          { category: 'A', value: 'invalid' as any },
        ],
      };

      const subtotals = calculateSubtotals(groupedData, 'value');

      expect(subtotals.A).toBeNaN();
    });
  });
});