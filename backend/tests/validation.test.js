import { describe, expect, it } from '@jest/globals';
import { isValidAmount, isValidCpf, isValidEmail, isValidDescription, normalizeCpf } from '../src/utils/validation.js';
describe('validation', () => {
    it('accepts a valid CPF', () => {
        expect(isValidCpf('529.982.247-25')).toBe(true);
        expect(normalizeCpf('529.982.247-25')).toBe('52998224725');
    });
    it('rejects invalid CPF', () => {
        expect(isValidCpf('111.111.111-11')).toBe(false);
        expect(isValidCpf('123.456.789-00')).toBe(false);
    });
    it('validates email and amount', () => {
        expect(isValidEmail('teste.usuario+1@gmail.com')).toBe(true);
        expect(isValidEmail('email-invalido')).toBe(false);
        expect(isValidAmount(0.01)).toBe(true);
        expect(isValidAmount(1000000)).toBe(true);
        expect(isValidAmount(0)).toBe(false);
        expect(isValidAmount(1000000.01)).toBe(false);
    });
    it('rejects invalid description characters', () => {
        expect(isValidDescription('Transferência de teste #1')).toBe(true);
        expect(isValidDescription('Valor <script>alert(1)</script>')).toBe(false);
    });
});
