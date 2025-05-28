"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCurrency = exports.validateDate = exports.validatePassword = exports.validatePhone = exports.validateEmail = exports.validateCNPJ = exports.validateCPF = void 0;
const validateCPF = (cpf) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
        return false;
    }
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
        return false;
    }
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let rest = 11 - (sum % 11);
    const digit1 = rest > 9 ? 0 : rest;
    if (digit1 !== parseInt(cleanCPF.charAt(9))) {
        return false;
    }
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
exports.validateCPF = validateCPF;
const validateCNPJ = (cnpj) => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) {
        return false;
    }
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
        return false;
    }
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
exports.validateCNPJ = validateCNPJ;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};
exports.validatePhone = validatePhone;
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
};
exports.validatePassword = validatePassword;
const validateDate = (date) => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
        return false;
    }
    const [day, month, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return (dateObj.getDate() === day &&
        dateObj.getMonth() === month - 1 &&
        dateObj.getFullYear() === year);
};
exports.validateDate = validateDate;
const validateCurrency = (value) => {
    const currencyRegex = /^\d{1,3}(\.\d{3})*,\d{2}$/;
    return currencyRegex.test(value);
};
exports.validateCurrency = validateCurrency;
