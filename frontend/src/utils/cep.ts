export const formatCEP = (cep: string): string => {
  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');

  // Aplica a máscara
  return cleanCEP
    .replace(/(\d{5})(\d)/, '$1-$2');
}; 