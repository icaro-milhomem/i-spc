export const formatDate = (date: Date): string => {
  // Verifica se é uma data válida
  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }

  // Obtém o dia, mês e ano
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  // Retorna a data formatada
  return `${day}/${month}/${year}`;
}; 