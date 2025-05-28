import { formatCNPJ } from '../cnpj';

describe('CNPJ Formatting', () => {
  it('should format CNPJ correctly', () => {
    const testCases = [
      { input: '12345678901234', expected: '12.345.678/9012-34' },
      { input: '1234567890123', expected: '12.345.678/9012-3' },
      { input: '123456789012', expected: '12.345.678/9012' },
      { input: '12345678901', expected: '12.345.678/901' },
      { input: '1234567890', expected: '12.345.678/90' },
      { input: '123456789', expected: '12.345.678/9' },
      { input: '12345678', expected: '12.345.678' },
      { input: '1234567', expected: '12.345.67' },
      { input: '123456', expected: '12.345.6' },
      { input: '12345', expected: '12.345' },
      { input: '1234', expected: '12.34' },
      { input: '123', expected: '12.3' },
      { input: '12', expected: '12' },
      { input: '1', expected: '1' },
      { input: '', expected: '' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatCNPJ(input)).toBe(expected);
    });
  });

  it('should handle CNPJ with invalid characters', () => {
    const testCases = [
      { input: 'abc.def.ghi/jkl-mn', expected: '' },
      { input: 'abc.def.ghi/jkl-m', expected: '' },
      { input: 'abc.def.ghi/jkl', expected: '' },
      { input: 'abc.def.ghi/jk', expected: '' },
      { input: 'abc.def.ghi/j', expected: '' },
      { input: 'abc.def.ghi/', expected: '' },
      { input: 'abc.def.ghi', expected: '' },
      { input: 'abc.def.gh', expected: '' },
      { input: 'abc.def.g', expected: '' },
      { input: 'abc.def', expected: '' },
      { input: 'abc.de', expected: '' },
      { input: 'abc.d', expected: '' },
      { input: 'abc', expected: '' },
      { input: 'ab', expected: '' },
      { input: 'a', expected: '' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatCNPJ(input)).toBe(expected);
    });
  });
}); 