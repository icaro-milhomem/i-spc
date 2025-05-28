export const formatCPF = (cpf: string): string => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Aplica a máscara
  return cleanCPF
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}; 