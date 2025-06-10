export const formatCEP = (cep: string): string => {
  // Remove caracteres não numéricos
  const cleanCEP = cep.replace(/\D/g, '');

  // Limita a 8 dígitos
  const limitedCEP = cleanCEP.slice(0, 8);

  // Aplica a máscara
  if (limitedCEP.length <= 5) {
    return limitedCEP;
  }

  return `${limitedCEP.slice(0, 5)}-${limitedCEP.slice(5)}`;
}; 