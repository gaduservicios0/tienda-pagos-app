import { AdaptadorPasarela } from './adaptador-pasarela';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AdaptadorPasarela', () => {
  let adaptador: AdaptadorPasarela;

  beforeEach(() => {
    jest.clearAllMocks();
    adaptador = new AdaptadorPasarela();
  });

  it('debe procesar exitosamente un pago aprobado inmediatamente', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'wompi-001',
          status: 'APPROVED',
          status_message: 'Aprobada exitosamente',
        },
      },
    });

    const resultado = await adaptador.procesarPago({
      tokenAceptacion: 'acc-tok',
      tokenTarjeta: 'card-tok',
      referencia: 'REF-001',
      montoEnCentavos: 16700000,
      moneda: 'COP',
      correoCliente: 'cliente@test.com',
      cuotas: 1,
      firmaIntegridad: 'sig123',
    });

    expect(resultado.isOk()).toBe(true);
    if (resultado.isOk()) {
      expect(resultado.value.estado).toBe('APROBADA');
      expect(resultado.value.idTransaccion).toBe('wompi-001');
      expect(resultado.value.mensaje).toBe('Aprobada exitosamente');
    }
  });

  it('debe sondear el estado si la respuesta inicial es PENDING', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'wompi-002',
          status: 'PENDING',
        },
      },
    });

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 'wompi-002',
          status: 'APPROVED',
          status_message: 'Aprobada tras sondeo',
        },
      },
    });

    const resultado = await adaptador.procesarPago({
      tokenAceptacion: 'acc-tok',
      tokenTarjeta: 'card-tok',
      referencia: 'REF-002',
      montoEnCentavos: 16700000,
      moneda: 'COP',
      correoCliente: 'cliente@test.com',
      cuotas: 1,
      firmaIntegridad: 'sig123',
    });

    expect(resultado.isOk()).toBe(true);
    if (resultado.isOk()) {
      expect(resultado.value.estado).toBe('APROBADA');
    }
  });

  it('debe manejar estado DECLINED', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'wompi-003',
          status: 'DECLINED',
        },
      },
    });

    const resultado = await adaptador.procesarPago({
      tokenAceptacion: 'acc-tok',
      tokenTarjeta: 'card-tok',
      referencia: 'REF-003',
      montoEnCentavos: 16700000,
      moneda: 'COP',
      correoCliente: 'cliente@test.com',
      cuotas: 1,
      firmaIntegridad: 'sig123',
    });

    expect(resultado.isOk()).toBe(true);
    if (resultado.isOk()) {
      expect(resultado.value.estado).toBe('RECHAZADA');
      expect(resultado.value.mensaje).toBe('Transacción rechazada por el banco emisor');
    }
  });

  it('debe manejar estado ERROR de pasarela', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          id: 'wompi-004',
          status: 'ERROR',
        },
      },
    });

    const resultado = await adaptador.procesarPago({
      tokenAceptacion: 'acc-tok',
      tokenTarjeta: 'card-tok',
      referencia: 'REF-004',
      montoEnCentavos: 16700000,
      moneda: 'COP',
      correoCliente: 'cliente@test.com',
      cuotas: 1,
      firmaIntegridad: 'sig123',
    });

    expect(resultado.isOk()).toBe(true);
    if (resultado.isOk()) {
      expect(resultado.value.estado).toBe('FALLIDA');
      expect(resultado.value.mensaje).toBe('Error al procesar con la pasarela');
    }
  });

  it('debe capturar errores con reason', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: {
            reason: 'Tarjeta bloqueada',
          },
        },
      },
    });

    const resultado = await adaptador.procesarPago({
      tokenAceptacion: 'acc-tok',
      tokenTarjeta: 'card-tok',
      referencia: 'REF-005',
      montoEnCentavos: 16700000,
      moneda: 'COP',
      correoCliente: 'cliente@test.com',
      cuotas: 1,
      firmaIntegridad: 'sig123',
    });

    expect(resultado.isErr()).toBe(true);
    if (resultado.isErr()) {
      expect(resultado.error.message).toBe('Tarjeta bloqueada');
    }
  });

  it('debe capturar errores de axios con mensajes de validacion', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          error: {
            messages: {
              signature: ['La firma es inválida'],
              token: 'invalido',
            },
          },
        },
      },
    });

    const resultado = await adaptador.procesarPago({
      tokenAceptacion: 'acc-tok',
      tokenTarjeta: 'card-tok',
      referencia: 'REF-006',
      montoEnCentavos: 16700000,
      moneda: 'COP',
      correoCliente: 'cliente@test.com',
      cuotas: 1,
      firmaIntegridad: 'sig123',
    });

    expect(resultado.isErr()).toBe(true);
    if (resultado.isErr()) {
      expect(resultado.error.message).toContain('signature');
    }
  });

  it('debe capturar error con message generico de respuesta', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Error de servidor Wompi',
        },
      },
    });

    const resultado = await adaptador.procesarPago({
      tokenAceptacion: 'acc-tok',
      tokenTarjeta: 'card-tok',
      referencia: 'REF-007',
      montoEnCentavos: 16700000,
      moneda: 'COP',
      correoCliente: 'cliente@test.com',
      cuotas: 1,
      firmaIntegridad: 'sig123',
    });

    expect(resultado.isErr()).toBe(true);
    if (resultado.isErr()) {
      expect(resultado.error.message).toBe('Error de servidor Wompi');
    }
  });

  it('debe capturar error de red sin respuesta', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Timeout'));

    const resultado = await adaptador.procesarPago({
      tokenAceptacion: 'acc-tok',
      tokenTarjeta: 'card-tok',
      referencia: 'REF-008',
      montoEnCentavos: 16700000,
      moneda: 'COP',
      correoCliente: 'cliente@test.com',
      cuotas: 1,
      firmaIntegridad: 'sig123',
    });

    expect(resultado.isErr()).toBe(true);
    if (resultado.isErr()) {
      expect(resultado.error.message).toBe('Network Timeout');
    }
  });
});

