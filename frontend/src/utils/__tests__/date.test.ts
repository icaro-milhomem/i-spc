import { formatDate } from '../date';

describe('Date Formatting', () => {
  it('should format date correctly', () => {
    const testCases = [
      { input: new Date(2024, 0, 1), expected: '01/01/2024' },
      { input: new Date(2024, 1, 1), expected: '01/02/2024' },
      { input: new Date(2024, 2, 1), expected: '01/03/2024' },
      { input: new Date(2024, 3, 1), expected: '01/04/2024' },
      { input: new Date(2024, 4, 1), expected: '01/05/2024' },
      { input: new Date(2024, 5, 1), expected: '01/06/2024' },
      { input: new Date(2024, 6, 1), expected: '01/07/2024' },
      { input: new Date(2024, 7, 1), expected: '01/08/2024' },
      { input: new Date(2024, 8, 1), expected: '01/09/2024' },
      { input: new Date(2024, 9, 1), expected: '01/10/2024' },
      { input: new Date(2024, 10, 1), expected: '01/11/2024' },
      { input: new Date(2024, 11, 1), expected: '01/12/2024' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatDate(input)).toBe(expected);
    });
  });

  it('should handle invalid dates', () => {
    const testCases = [
      { input: new Date('invalid'), expected: 'Data inválida' },
      { input: new Date(NaN), expected: 'Data inválida' },
      { input: new Date(Infinity), expected: 'Data inválida' },
      { input: new Date(-Infinity), expected: 'Data inválida' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatDate(input)).toBe(expected);
    });
  });
}); 