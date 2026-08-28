import { describe, it, expect, beforeEach } from 'vitest';
import pagoReducer, {
  establecerPaso,
  actualizarDatosTarjeta,
  actualizarDatosEntrega,
  guardarResultado,
  reiniciarFlujo,
  cargarEstadoLocal,
  guardarEnStorage,
} from './pago.slice';

describe('pagoSlice Redux', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe establecer el paso actual y guardarlo en storage', () => {
    const estado = pagoReducer(undefined, establecerPaso(2));
    expect(estado.pasoActual).toBe(2);
    expect(localStorage.getItem('estado_flujo_pago')).not.toBeNull();
  });

  it('debe actualizar los datos de la tarjeta', () => {
    const estado = pagoReducer(undefined, actualizarDatosTarjeta({ numero: '4242', nombreTitular: 'Pedro' }));
    expect(estado.datosTarjeta.numero).toBe('4242');
    expect(estado.datosTarjeta.nombreTitular).toBe('Pedro');
    expect(localStorage.getItem('estado_flujo_pago')).toContain('Pedro');
  });

  it('debe actualizar los datos de entrega', () => {
    const estado = pagoReducer(undefined, actualizarDatosEntrega({ direccion: 'Calle 100', ciudad: 'Medellin' }));
    expect(estado.datosEntrega.direccion).toBe('Calle 100');
    expect(estado.datosEntrega.ciudad).toBe('Medellin');
    expect(localStorage.getItem('estado_flujo_pago')).toContain('Medellin');
  });

  it('debe guardar el resultado de la transaccion', () => {
    const res = { idTransaccion: '123', estado: 'APROBADA', mensaje: 'Ok' };
    const estado = pagoReducer(undefined, guardarResultado(res));
    expect(estado.transaccionResultado).toEqual(res);
    expect(localStorage.getItem('estado_flujo_pago')).toContain('APROBADA');
  });

  it('debe reiniciar el flujo y remover item de storage', () => {
    const estadoModificado = pagoReducer(undefined, establecerPaso(4));
    const estadoReiniciado = pagoReducer(estadoModificado, reiniciarFlujo());
    expect(estadoReiniciado.pasoActual).toBe(1);
    expect(estadoReiniciado.transaccionResultado).toBeNull();
    expect(localStorage.getItem('estado_flujo_pago')).toBeNull();
  });

  it('debe cargar estado de localStorage cuando hay datos validos', () => {
    const mockEstado = {
      pasoActual: 3,
      datosTarjeta: { numero: '1234', nombreTitular: 'Ana', mesVencimiento: '10', anioVencimiento: '27', cvc: '111', cuotas: 1 },
      datosEntrega: { nombreCompleto: 'Ana', correoElectronico: 'ana@test.com', numeroTelefono: '', tipoDocumento: 'CC', numeroDocumento: '', direccion: '', ciudad: '', departamento: '' },
      montos: { subtotal: 1000, tarifaBase: 100, tarifaEnvio: 200, total: 1300 },
      transaccionResultado: null,
    };
    localStorage.setItem('estado_flujo_pago', JSON.stringify(mockEstado));
    const cargado = cargarEstadoLocal();
    expect(cargado.pasoActual).toBe(3);
    expect(cargado.datosTarjeta.nombreTitular).toBe('Ana');
  });

  it('debe manejar fallback cuando localStorage tiene JSON invalido', () => {
    localStorage.setItem('estado_flujo_pago', 'JSON_INVALIDO');
    const cargado = cargarEstadoLocal();
    expect(cargado.pasoActual).toBe(1);
  });

  it('debe ejecutar guardarEnStorage correctamente', () => {
    const estado = cargarEstadoLocal();
    guardarEnStorage(estado);
    expect(localStorage.getItem('estado_flujo_pago')).not.toBeNull();
  });
});
