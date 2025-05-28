export const formatPercentage = (value: number): string => {
  // Verifica se é um número válido
  if (isNaN(value)) {
    return '';
  }

  // Converte o número para porcentagem
  const percentage = value * 100;

  // Formata o número com no máximo 1 casa decimal
  const formattedNumber = percentage.toFixed(1);

  // Remove o zero após a vírgula se for um número inteiro
  const cleanNumber = formattedNumber.replace(/\.0$/, '');

  // Adiciona o símbolo de porcentagem
  return `${cleanNumber}%`;
}; 