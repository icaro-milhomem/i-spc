import { formatPercentage } from '../percentage';

describe('Percentage Formatting', () => {
  it('should format positive percentages correctly', () => {
    const testCases = [
      { input: 0, expected: '0%' },
      { input: 0.1, expected: '0,1%' },
      { input: 1, expected: '1%' },
      { input: 1.5, expected: '1,5%' },
      { input: 10, expected: '10%' },
      { input: 100, expected: '100%' },
      { input: 1000, expected: '1.000%' }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatPercentage(input)).toBe(expected);
    });
  });

  it('should format negative percentages correctly', () => {
    const testCases = [
      { input: -0.1, expected: '-0,1%' },
      { input: -1, expected: '-1%' },
      { input: -1.5, expected: '-1,5%' },
      { input: -10, expected: '-10%' },
      { input: -100, expected: '-100%' },
      { input: -1000, expected: '-1.000%' }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatPercentage(input)).toBe(expected);
    });
  });
}); 