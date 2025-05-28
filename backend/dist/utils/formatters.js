"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = void 0;
const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};
exports.formatCurrency = formatCurrency;
