import { describe, it, expect } from 'vitest';
import { detectarFranquicia, validarLuhn } from './validadores-tarjeta';

describe('Validadores de Tarjeta de Crédito', () => {
  it('debe identificar correctamente una tarjeta VISA', () => {
    expect(detectarFranquicia('4000123456789010')).toBe('VISA');
  });

  it('debe identificar correctamente una tarjeta MASTERCARD', () => {
    expect(detectarFranquicia('5105105105105100')).toBe('MASTERCARD');
  });

  it('debe retornar DESCONOCIDA para franquicias no soportadas', () => {
    expect(detectarFranquicia('340000000000000')).toBe('DESCONOCIDA');
  });

  it('debe validar un número de tarjeta válido según Luhn', () => {
    expect(validarLuhn('4242424242424242')).toBe(true);
  });

  it('debe invalidar un número de tarjeta corrupto', () => {
    expect(validarLuhn('4242424242424243')).toBe(false);
  });
});