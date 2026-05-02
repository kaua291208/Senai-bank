const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-zÀ-ÿ' -]{2,120}$/u;
const DESCRIPTION_REGEX = /^[A-Za-z0-9À-ÿ'".,;:!?()\-_/+&%#@\s]{1,140}$/u;
const CPF_REPEAT_REGEX = /^(\d)\1{10}$/;
export function normalizeCpf(value) {
    return value.replace(/\D/g, '');
}
export function isValidCpf(value) {
    const cpf = normalizeCpf(value);
    if (cpf.length !== 11 || CPF_REPEAT_REGEX.test(cpf)) {
        return false;
    }
    const digits = cpf.split('').map(Number);
    const calculateDigit = (length) => {
        const slice = digits.slice(0, length);
        let sum = 0;
        for (let i = 0; i < slice.length; i += 1) {
            sum += slice[i] * (length + 1 - i);
        }
        const remainder = (sum * 10) % 11;
        return remainder === 10 ? 0 : remainder;
    };
    const firstDigit = calculateDigit(9);
    const secondDigit = calculateDigit(10);
    return firstDigit === digits[9] && secondDigit === digits[10];
}
export function isValidEmail(value) {
    return EMAIL_REGEX.test(value.trim());
}
export function normalizeEmail(value) {
    return value.trim().toLowerCase();
}
export function isValidName(value) {
    return NAME_REGEX.test(value.trim());
}
export function isStrongPassword(value) {
    return value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
}
export function isValidDescription(value) {
    if (value == null || value === '') {
        return true;
    }
    return DESCRIPTION_REGEX.test(value.trim());
}
export function isValidAccountType(value) {
    return value === 'corrente' || value === 'poupança';
}
export function isValidAmount(value) {
    return Number.isFinite(value) && value >= 0.01 && value <= 1000000;
}
export function formatBRL(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function parseAmount(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = Number(value.replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : Number.NaN;
    }
    return Number.NaN;
}
