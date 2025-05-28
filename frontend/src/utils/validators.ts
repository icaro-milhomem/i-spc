export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string): boolean => {
  // Mínimo 8 caracteres, pelo menos uma letra maiúscula, uma minúscula e um número
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password);
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let rest = 11 - (sum % 11);
  const digit1 = rest > 9 ? 0 : rest;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  rest = 11 - (sum % 11);
  const digit2 = rest > 9 ? 0 : rest;
  
  return digit1 === parseInt(cleanCPF.charAt(9)) && digit2 === parseInt(cleanCPF.charAt(10));
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const validateCurrency = (value: string): boolean => {
  // Aceita valores como "1234,56" ou "1.234,56"
  const currencyRegex = /^\d{1,3}(\.\d{3})*,\d{2}$/;
  return currencyRegex.test(value);
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

export const validateNumber = (value: string): boolean => {
  return !isNaN(Number(value)) && value.trim().length > 0;
};

export const validatePositiveNumber = (value: string): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

export const validateFutureDate = (date: string): boolean => {
  const dateObj = new Date(date);
  const today = new Date();
  return dateObj instanceof Date && !isNaN(dateObj.getTime()) && dateObj > today;
};

export const validatePastDate = (date: string): boolean => {
  const dateObj = new Date(date);
  const today = new Date();
  return dateObj instanceof Date && !isNaN(dateObj.getTime()) && dateObj < today;
}; 