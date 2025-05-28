import { formatNumber } from '../number';

describe('Number Formatting', () => {
  it('should format numbers correctly', () => {
    const testCases = [
      { input: 0, expected: '0' },
      { input: 1, expected: '1' },
      { input: 10, expected: '10' },
      { input: 100, expected: '100' },
      { input: 1000, expected: '1.000' },
      { input: 10000, expected: '10.000' },
      { input: 100000, expected: '100.000' },
      { input: 1000000, expected: '1.000.000' },
      { input: 10000000, expected: '10.000.000' },
      { input: 100000000, expected: '100.000.000' },
      { input: 1000000000, expected: '1.000.000.000' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatNumber(input)).toBe(expected);
    });
  });

  it('should handle negative numbers', () => {
    const testCases = [
      { input: -0, expected: '0' },
      { input: -1, expected: '-1' },
      { input: -10, expected: '-10' },
      { input: -100, expected: '-100' },
      { input: -1000, expected: '-1.000' },
      { input: -10000, expected: '-10.000' },
      { input: -100000, expected: '-100.000' },
      { input: -1000000, expected: '-1.000.000' },
      { input: -10000000, expected: '-10.000.000' },
      { input: -100000000, expected: '-100.000.000' },
      { input: -1000000000, expected: '-1.000.000.000' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatNumber(input)).toBe(expected);
    });
  });

  it('should handle decimal numbers', () => {
    const testCases = [
      { input: 0.1, expected: '0,1' },
      { input: 0.01, expected: '0,01' },
      { input: 0.001, expected: '0,001' },
      { input: 1.1, expected: '1,1' },
      { input: 1.01, expected: '1,01' },
      { input: 1.001, expected: '1,001' },
      { input: 10.1, expected: '10,1' },
      { input: 10.01, expected: '10,01' },
      { input: 10.001, expected: '10,001' },
      { input: 100.1, expected: '100,1' },
      { input: 100.01, expected: '100,01' },
      { input: 100.001, expected: '100,001' },
      { input: 1000.1, expected: '1.000,1' },
      { input: 1000.01, expected: '1.000,01' },
      { input: 1000.001, expected: '1.000,001' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatNumber(input)).toBe(expected);
    });
  });

  it('should handle negative decimal numbers', () => {
    const testCases = [
      { input: -0.1, expected: '-0,1' },
      { input: -0.01, expected: '-0,01' },
      { input: -0.001, expected: '-0,001' },
      { input: -1.1, expected: '-1,1' },
      { input: -1.01, expected: '-1,01' },
      { input: -1.001, expected: '-1,001' },
      { input: -10.1, expected: '-10,1' },
      { input: -10.01, expected: '-10,01' },
      { input: -10.001, expected: '-10,001' },
      { input: -100.1, expected: '-100,1' },
      { input: -100.01, expected: '-100,01' },
      { input: -100.001, expected: '-100,001' },
      { input: -1000.1, expected: '-1.000,1' },
      { input: -1000.01, expected: '-1.000,01' },
      { input: -1000.001, expected: '-1.000,001' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatNumber(input)).toBe(expected);
    });
  });
}); 