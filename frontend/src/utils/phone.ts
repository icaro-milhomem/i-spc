export const formatPhone = (phone: string): string => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Verifica se é um número válido
  if (cleanPhone.length === 0) {
    return '';
  }

  // Aplica a máscara
  return cleanPhone
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3')
    .replace(/(-\d{4})\d+?$/, '$1');
}; 