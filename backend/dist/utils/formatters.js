import { formatBRL } from './validation.js';
export function toMoney(value) {
    return Number(value.toFixed(2));
}
export function toMoneyString(value) {
    return formatBRL(toMoney(value));
}
