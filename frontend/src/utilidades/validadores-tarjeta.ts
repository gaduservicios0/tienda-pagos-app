export type FranquiciaTarjeta = 'VISA' | 'MASTERCARD' | 'DESCONOCIDA';

export const detectarFranquicia = (numero: string): FranquiciaTarjeta => {
  const limpio = numero.replace(/\D/g, '');
  if (/^4/.test(limpio)) return 'VISA';
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(limpio)) return 'MASTERCARD';
  return 'DESCONOCIDA';
};

export const validarLuhn = (numero: string): boolean => {
  const limpio = numero.replace(/\D/g, '');
  if (!limpio || limpio.length < 13 || limpio.length > 19) return false;

  let suma = 0;
  let alternar = false;

  for (let i = limpio.length - 1; i >= 0; i--) {
    let digito = parseInt(limpio.charAt(i), 10);

    if (alternar) {
      digito *= 2;
      if (digito > 9) digito -= 9;
    }

    suma += digito;
    alternar = !alternar;
  }

  return suma % 10 === 0;
};