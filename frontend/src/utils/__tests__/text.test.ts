import { formatText } from '../text';

describe('Text Formatting', () => {
  it('should capitalize first letter of each word', () => {
    const testCases = [
      { input: 'joão silva', expected: 'João Silva' },
      { input: 'MARIA SANTOS', expected: 'Maria Santos' },
      { input: 'pedro da silva', expected: 'Pedro da Silva' },
      { input: 'ana maria de souza', expected: 'Ana Maria de Souza' },
      { input: 'josé dos santos', expected: 'José dos Santos' },
      { input: 'carlos das neves', expected: 'Carlos das Neves' },
      { input: 'marcelo e maria', expected: 'Marcelo e Maria' },
      { input: 'joão & maria', expected: 'João & Maria' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatText(input)).toBe(expected);
    });
  });

  it('should handle empty strings and special cases', () => {
    const testCases = [
      { input: '', expected: '' },
      { input: ' ', expected: ' ' },
      { input: '  ', expected: '  ' },
      { input: 'a', expected: 'A' },
      { input: 'A', expected: 'A' },
      { input: '123', expected: '123' },
      { input: '!@#', expected: '!@#' },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(formatText(input)).toBe(expected);
    });
  });
}); 