import { formatCurrency } from '../currency';

describe('Currency Formatting', () => {
  it('should format positive values correctly', () => {
    const testCases = [
      { input: 0, expected: 'R$ 0,00' },
      { input: 0.1, expected: 'R$ 0,10' },
      { input: 1, expected: 'R$ 1,00' },
      { input: 1.5, expected: 'R$ 1,50' },
      { input: 10, expected: 'R$ 10,00' },
      { input: 100, expected: 'R$ 100,00' },
      { input: 1000, expected: 'R$ 1.000,00' },
      { input: 1000000, expected: 'R$ 1.000.000,00' }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatCurrency(input)).toBe(expected);
    });
  });

  it('should format negative values correctly', () => {
    const testCases = [
      { input: -0.1, expected: 'R$ -0,10' },
      { input: -1, expected: 'R$ -1,00' },
      { input: -1.5, expected: 'R$ -1,50' },
      { input: -10, expected: 'R$ -10,00' },
      { input: -100, expected: 'R$ -100,00' },
      { input: -1000, expected: 'R$ -1.000,00' },
      { input: -1000000, expected: 'R$ -1.000.000,00' }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatCurrency(input)).toBe(expected);
    });
  });
}); 