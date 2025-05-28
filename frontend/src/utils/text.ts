export const formatText = (text: string): string => {
  // Verifica se o texto é válido
  if (!text) {
    return text;
  }

  // Lista de palavras que não devem ser capitalizadas
  const prepositions = ['da', 'de', 'do', 'das', 'dos', 'e', '&'];

  // Divide o texto em palavras
  return text
    .split(' ')
    .map((word, index) => {
      // Converte a palavra para minúsculas
      const lowerWord = word.toLowerCase();

      // Se for uma preposição e não for a primeira palavra, mantém em minúsculo
      if (prepositions.includes(lowerWord) && index > 0) {
        return lowerWord;
      }

      // Capitaliza a primeira letra de cada palavra
      return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    })
    .join(' ');
}; 