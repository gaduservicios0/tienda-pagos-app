import { describe, it, expect } from 'vitest';
import { detectarFranquicia, validarLuhn } from './validadores-tarjeta';

describe('Validadores de Tarjeta de Crédito', () => {
  it('debe identificar correctamente una tarjeta VISA', () => {
    expect(detectarFranquicia('4000123456789010')).toBe('VISA');
    expect(detectarFranquicia('4111 1111 1111 1111')).toBe('VISA');
  });

  it('debe identificar correctamente una tarjeta MASTERCARD', () => {
    expect(detectarFranquicia('5105105105105100')).toBe('MASTERCARD');
    expect(detectarFranquicia('5500000000000004')).toBe('MASTERCARD');
    expect(detectarFranquicia('2221000000000000')).toBe('MASTERCARD');
    expect(detectarFranquicia('2720999999999999')).toBe('MASTERCARD');
  });

  it('debe retornar DESCONOCIDA para franquicias no soportadas', () => {
    expect(detectarFranquicia('340000000000000')).toBe('DESCONOCIDA');
    expect(detectarFranquicia('')).toBe('DESCONOCIDA');
  });

  it('debe validar un número de tarjeta válido según Luhn', () => {
    expect(validarLuhn('4242424242424242')).toBe(true);
    expect(validarLuhn('5500000000000004')).toBe(true);
    expect(validarLuhn('4242 4242 4242 4242')).toBe(true);
  });

  it('debe invalidar números no numéricos, muy cortos o muy largos', () => {
    expect(validarLuhn('')).toBe(false);
    expect(validarLuhn('12345')).toBe(false);
    expect(validarLuhn('123456789012345678901')).toBe(false);
  });

  it('debe invalidar un número de tarjeta corrupto', () => {
    expect(validarLuhn('4242424242424243')).toBe(false);
  });
});