import { formatCEP } from '../cep';

describe('CEP Formatting', () => {
  it('should format CEP correctly', () => {
    const testCases = [
      { input: '12345678', expected: '12345-678' },
      { input: '1234567', expected: '12345-67' },
      { input: '123456', expected: '12345-6' },
      { input: '12345', expected: '12345' },
      { input: '1234', expected: '1234' },
      { input: '123', expected: '123' },
      { input: '12', expected: '12' },
      { input: '1', expected: '1' },
      { input: '', expected: '' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatCEP(input)).toBe(expected);
    });
  });

  it('should handle CEP with invalid characters', () => {
    const testCases = [
      { input: 'abc.def-gh', expected: '' },
      { input: 'abc.def-g', expected: '' },
      { input: 'abc.def', expected: '' },
      { input: 'abc.de', expected: '' },
      { input: 'abc.d', expected: '' },
      { input: 'abc', expected: '' },
      { input: 'ab', expected: '' },
      { input: 'a', expected: '' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatCEP(input)).toBe(expected);
    });
  });
}); 