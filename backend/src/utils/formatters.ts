import { formatBRL } from './validation.js';

export function toMoney(value: number) {
  return Number(value.toFixed(2));
}

export function toMoneyString(value: number) {
  return formatBRL(toMoney(value));
}