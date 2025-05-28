export const formatCurrency = (value: number): string => {
  // Verifica se é um número válido
  if (isNaN(value)) {
    return '';
  }

  // Formata o número com 2 casas decimais
  const formattedNumber = value.toFixed(2);

  // Separa a parte inteira da decimal
  const [integerPart, decimalPart] = formattedNumber.split('.');

  // Formata a parte inteira
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Adiciona o símbolo da moeda e a parte decimal
  return `R$ ${formattedInteger},${decimalPart}`;
}; 