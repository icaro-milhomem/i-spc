import { validateCNPJ } from '../cnpj-validation';

describe('CNPJ Validation', () => {
  it('should validate a valid CNPJ', () => {
    const validCNPJs = [
      '12.345.678/0001-95',
      '12345678000195',
      '12.345.678/0001-95',
      '12345678000195',
    ];

    validCNPJs.forEach(cnpj => {
      expect(validateCNPJ(cnpj)).toBe(true);
    });
  });

  it('should invalidate an invalid CNPJ', () => {
    const invalidCNPJs = [
      '12.345.678/0001-00',
      '111.111.111-11',
      '000.000.000-00',
      '12345678000100',
      '11111111111',
      '00000000000',
      '12.345.678/0001-0',
      '12.345.678/0001-',
      '12.345.678/0001',
      '12.345.678/000',
      '12.345.678/00',
      '12.345.678/0',
      '12.345.678',
      '12.345.67',
      '12.345.6',
      '12.345',
      '12.34',
      '12.3',
      '12',
      '1',
      '',
    ];

    invalidCNPJs.forEach(cnpj => {
      expect(validateCNPJ(cnpj)).toBe(false);
    });
  });

  it('should handle CNPJ with invalid characters', () => {
    const invalidCNPJs = [
      'abc.def.ghi/jkl-mn',
      'abc.def.ghi/jkl-m',
      'abc.def.ghi/jkl',
      'abc.def.ghi/jk',
      'abc.def.ghi/j',
      'abc.def.ghi/',
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

    invalidCNPJs.forEach(cnpj => {
      expect(validateCNPJ(cnpj)).toBe(false);
    });
  });
}); 