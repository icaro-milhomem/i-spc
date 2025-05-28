import { validateCPF } from '../cpf';
import { formatCPF } from '../cpf';

describe('CPF Validation', () => {
  it('should validate a valid CPF', () => {
    const validCPFs = [
      '529.982.247-25',
      '52998224725',
      '529.982.247-25',
      '52998224725',
    ];

    validCPFs.forEach(cpf => {
      expect(validateCPF(cpf)).toBe(true);
    });
  });

  it('should invalidate an invalid CPF', () => {
    const invalidCPFs = [
      '123.456.789-00',
      '111.111.111-11',
      '000.000.000-00',
      '12345678900',
      '11111111111',
      '00000000000',
      '123.456.789-0',
      '123.456.789-',
      '123.456.789',
      '123.456.78',
      '123.456.7',
      '123.456',
      '123.45',
      '123.4',
      '123',
      '12',
      '1',
      '',
    ];

    invalidCPFs.forEach(cpf => {
      expect(validateCPF(cpf)).toBe(false);
    });
  });

  it('should handle CPF with invalid characters', () => {
    const invalidCPFs = [
      'abc.def.ghi-jk',
      'abc.def.ghi-j',
      'abc.def.ghi',
      'abc.def.gh',
      'abc.def.g',
      'abc.def',
      'abc.de',
      'abc.d',
      'abc',
      'ab',
      'a',
    ];

    invalidCPFs.forEach(cpf => {
      expect(validateCPF(cpf)).toBe(false);
    });
  });
});

describe('CPF Formatting', () => {
  it('should format CPF correctly', () => {
    const testCases = [
      { input: '12345678900', expected: '123.456.789-00' },
      { input: '1234567890', expected: '123.456.789-0' },
      { input: '123456789', expected: '123.456.789' },
      { input: '12345678', expected: '123.456.78' },
      { input: '1234567', expected: '123.456.7' },
      { input: '123456', expected: '123.456' },
      { input: '12345', expected: '123.45' },
      { input: '1234', expected: '123.4' },
      { input: '123', expected: '123' },
      { input: '12', expected: '12' },
      { input: '1', expected: '1' },
      { input: '', expected: '' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatCPF(input)).toBe(expected);
    });
  });

  it('should handle CPF with invalid characters', () => {
    const testCases = [
      { input: 'abc.def.ghi-jk', expected: '' },
      { input: 'abc.def.ghi-j', expected: '' },
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
      expect(formatCPF(input)).toBe(expected);
    });
  });
}); 