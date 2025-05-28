export const formatNumber = (number: number): string => {
  // Converte o número para string
  const numberString = number.toString();

  // Verifica se é um número válido
  if (isNaN(number)) {
    return '';
  }

  // Verifica se é um número decimal
  const isDecimal = numberString.includes('.');

  // Se for decimal, separa a parte inteira da decimal
  const [integerPart, decimalPart] = isDecimal ? numberString.split('.') : [numberString, ''];

  // Formata a parte inteira
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Se for decimal, adiciona a parte decimal
  return isDecimal ? `${formattedInteger},${decimalPart}` : formattedInteger;
}; 