export const formatCNPJ = (cnpj: string): string => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Aplica a máscara
  return cleanCNPJ
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}; 