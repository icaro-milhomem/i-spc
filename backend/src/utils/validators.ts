export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  const digit1 = rest > 9 ? 0 : rest;
  if (digit1 !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rest = 11 - (sum % 11);
  const digit2 = rest > 9 ? 0 : rest;
  if (digit2 !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
};

export const validateCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return false;
  }

  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let rest = 11 - (sum % 11);
  const digit1 = rest > 9 ? 0 : rest;
  if (digit1 !== parseInt(cleanCNPJ.charAt(12))) {
    return false;
  }

  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ.charAt(i)) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  rest = 11 - (sum % 11);
  const digit2 = rest > 9 ? 0 : rest;
  if (digit2 !== parseInt(cleanCNPJ.charAt(13))) {
    return false;
  }

  return true;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem entre 10 e 11 dígitos (com DDD)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

export const validatePassword = (password: string): boolean => {
  // Mínimo 6 caracteres, pelo menos uma letra e um número
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return passwordRegex.test(password);
};

export const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!dateRegex.test(date)) {
    return false;
  }

  const [day, month, year] = date.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return (
    dateObj.getDate() === day &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getFullYear() === year
  );
};

export const validateCurrency = (value: string): boolean => {
  // Aceita valores como "1234,56" ou "1.234,56"
  const currencyRegex = /^\d{1,3}(\.\d{3})*,\d{2}$/;
  return currencyRegex.test(value);
}; 