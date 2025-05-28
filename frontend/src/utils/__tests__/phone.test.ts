import { formatPhone } from '../phone';

describe('Phone Formatting', () => {
  it('should format phone numbers correctly', () => {
    const testCases = [
      { input: '11', expected: '(11)' },
      { input: '11999999999', expected: '(11) 99999-9999' },
      { input: '1199999999', expected: '(11) 9999-9999' },
      { input: '119999999', expected: '(11) 9999-999' },
      { input: '11999999', expected: '(11) 9999-99' },
      { input: '1199999', expected: '(11) 9999-9' },
      { input: '119999', expected: '(11) 9999' },
      { input: '11999', expected: '(11) 999' },
      { input: '1199', expected: '(11) 99' },
      { input: '119', expected: '(11) 9' }
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatPhone(input)).toBe(expected);
    });
  });

  it('should handle phone numbers with invalid characters', () => {
    const testCases = [
      { input: 'abc.def-ghij', expected: '' },
      { input: 'abc.def-ghi', expected: '' },
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
      expect(formatPhone(input)).toBe(expected);
    });
  });
}); 