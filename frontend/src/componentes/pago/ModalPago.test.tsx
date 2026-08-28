import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import pagoReducer from '../../estado/slices/pago.slice';
import { ModalPago } from './ModalPago';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  isAxiosError: (err: unknown) => boolean;
};

const renderModal = (props: { abierto: boolean; alCerrar: () => void }, estadoInicial?: Record<string, unknown>) => {
  const store = configureStore({
    reducer: { pago: pagoReducer },
    preloadedState: {
      pago: {
        pasoActual: 2,
        datosTarjeta: {
          numero: '4242424242424242',
          nombreTitular: 'Cliente Prueba',
          mesVencimiento: '12',
          anioVencimiento: '28',
          cvc: '123',
          cuotas: 1,
        },
        datosEntrega: {
          nombreCompleto: 'Cliente Prueba',
          correoElectronico: 'cliente@test.com',
          numeroTelefono: '3001234567',
          tipoDocumento: 'CC',
          numeroDocumento: '1020304050',
          direccion: 'Carrera 14 # 16-42',
          ciudad: 'Bogotá',
          departamento: 'Cundinamarca',
        },
        montos: {
          subtotal: 15000000,
          tarifaBase: 500000,
          tarifaEnvio: 1200000,
          total: 16700000,
        },
        transaccionResultado: null,
        ...estadoInicial,
      },
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <ModalPago {...props} />
      </Provider>,
    ),
  };
};

describe('ModalPago Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.isAxiosError = (err: unknown) => (err as { isAxiosError?: boolean })?.isAxiosError === true;
  });

  it('no debe renderizar nada si abierto es false', () => {
    const { container } = renderModal({ abierto: false, alCerrar: vi.fn() });
    expect(container.firstChild).toBeNull();
  });

  it('debe abrir y permitir colapsar/desplegar el resumen Backdrop', () => {
    renderModal({ abierto: true, alCerrar: vi.fn() });

    const btnResumen = screen.getByText(/Ver Resumen/i);
    fireEvent.click(btnResumen);
    expect(screen.getByText('Tarifa Base de Procesamiento')).toBeDefined();

    const btnOcultar = screen.getByText(/Ocultar Resumen/i);
    fireEvent.click(btnOcultar);
  });

  it('debe llamar a alCerrar al hacer click en el boton x', () => {
    const mockCerrar = vi.fn();
    renderModal({ abierto: true, alCerrar: mockCerrar });

    const btnX = screen.getByLabelText('Cerrar modal');
    fireEvent.click(btnX);
    expect(mockCerrar).toHaveBeenCalled();
  });

  it('debe llamar a alCerrar al hacer click en el fondo backdrop', () => {
    const mockCerrar = vi.fn();
    const { container } = renderModal({ abierto: true, alCerrar: mockCerrar });

    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    expect(mockCerrar).toHaveBeenCalled();
  });

  it('debe responder a todos los eventos onChange de los campos del formulario', () => {
    const { store, container } = renderModal({ abierto: true, alCerrar: vi.fn() });

    // 1. Numero Tarjeta
    const inputNumero = screen.getByPlaceholderText('4242 4242 4242 4242');
    fireEvent.change(inputNumero, { target: { value: '5500000000000004' } });
    expect(store.getState().pago.datosTarjeta.numero).toBe('5500 0000 0000 0004');

    // 2. Nombre Titular
    const inputTitular = screen.getByPlaceholderText('Ej. Cliente Prueba');
    fireEvent.change(inputTitular, { target: { value: 'Maria Lopez' } });
    expect(store.getState().pago.datosTarjeta.nombreTitular).toBe('Maria Lopez');

    // 3. Mes Vencimiento
    const inputMes = screen.getByPlaceholderText('MM');
    fireEvent.change(inputMes, { target: { value: '05' } });
    expect(store.getState().pago.datosTarjeta.mesVencimiento).toBe('05');

    // 4. Anio Vencimiento
    const inputAnio = screen.getByPlaceholderText('AA');
    fireEvent.change(inputAnio, { target: { value: '29' } });
    expect(store.getState().pago.datosTarjeta.anioVencimiento).toBe('29');

    // 5. CVC
    const inputCvc = screen.getByPlaceholderText('123');
    fireEvent.change(inputCvc, { target: { value: '987' } });
    expect(store.getState().pago.datosTarjeta.cvc).toBe('987');

    // 6. Cuotas
    const selectCuotas = container.querySelector('select')!;
    fireEvent.change(selectCuotas, { target: { value: '6' } });
    expect(store.getState().pago.datosTarjeta.cuotas).toBe(6);

    // 7. Email
    const inputEmail = screen.getByPlaceholderText('gerson.mercado@outlook.com');
    fireEvent.change(inputEmail, { target: { value: 'maria@test.com' } });
    expect(store.getState().pago.datosEntrega.correoElectronico).toBe('maria@test.com');

    // 8. Direccion
    const inputDir = screen.getByPlaceholderText('Carrera 14A # 16-42');
    fireEvent.change(inputDir, { target: { value: 'Av Siempre Viva 742' } });
    expect(store.getState().pago.datosEntrega.direccion).toBe('Av Siempre Viva 742');

    // 9. Ciudad y Departamento
    const inputsTexto = container.querySelectorAll('input[type="text"]');
    const inputCiudad = inputsTexto[inputsTexto.length - 2];
    const inputDepto = inputsTexto[inputsTexto.length - 1];

    fireEvent.change(inputCiudad, { target: { value: 'Cali' } });
    expect(store.getState().pago.datosEntrega.ciudad).toBe('Cali');

    fireEvent.change(inputDepto, { target: { value: 'Valle' } });
    expect(store.getState().pago.datosEntrega.departamento).toBe('Valle');

    // 10. Checkbox Terminos
    const checkbox = container.querySelector('input[type="checkbox"]')!;
    fireEvent.click(checkbox);
  });

  it('debe procesar el pago exitosamente hasta invocar la pasarela', async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({
      data: { data: { presigned_acceptance: { acceptance_token: 'acc-token-xyz' } } },
    });

    mockedAxios.post = vi
      .fn()
      .mockResolvedValueOnce({
        data: { data: { id: 'tok_stagtest_card_123' } },
      })
      .mockResolvedValueOnce({
        data: { idTransaccion: 'trx-uuid-1', estado: 'APROBADA' },
      });

    const { store, container } = renderModal({ abierto: true, alCerrar: vi.fn() });
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(store.getState().pago.pasoActual).toBe(4);
    });
  });

  it('debe validar tarjeta invalida', () => {
    const { container } = renderModal(
      { abierto: true, alCerrar: vi.fn() },
      {
        datosTarjeta: {
          numero: '4242424242424243',
          nombreTitular: 'Cliente',
          mesVencimiento: '12',
          anioVencimiento: '28',
          cvc: '123',
          cuotas: 1,
        },
      },
    );

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Por favor ingresa un número de tarjeta de crédito válido.')).toBeDefined();
  });

  it('debe validar titular vacio', () => {
    const { container } = renderModal(
      { abierto: true, alCerrar: vi.fn() },
      {
        datosTarjeta: {
          numero: '4242424242424242',
          nombreTitular: '',
          mesVencimiento: '12',
          anioVencimiento: '28',
          cvc: '123',
          cuotas: 1,
        },
      },
    );

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Por favor ingresa el nombre del titular tal como figura en la tarjeta.')).toBeDefined();
  });

  it('debe validar fecha de vencimiento vacia', () => {
    const { container } = renderModal(
      { abierto: true, alCerrar: vi.fn() },
      {
        datosTarjeta: {
          numero: '4242424242424242',
          nombreTitular: 'Cliente Prueba',
          mesVencimiento: '',
          anioVencimiento: '',
          cvc: '123',
          cuotas: 1,
        },
      },
    );

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Por favor ingresa la fecha de vencimiento completa (Mes y Año).')).toBeDefined();
  });

  it('debe validar CVC corto o vacio', () => {
    const { container } = renderModal(
      { abierto: true, alCerrar: vi.fn() },
      {
        datosTarjeta: {
          numero: '4242424242424242',
          nombreTitular: 'Cliente Prueba',
          mesVencimiento: '12',
          anioVencimiento: '28',
          cvc: '1',
          cuotas: 1,
        },
      },
    );

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Por favor ingresa el código CVC de seguridad (3 o 4 dígitos).')).toBeDefined();
  });

  it('debe validar correo invalido o vacio', () => {
    const { container } = renderModal(
      { abierto: true, alCerrar: vi.fn() },
      {
        datosEntrega: {
          correoElectronico: 'correo-sin-arroba',
          direccion: 'Calle 10',
        },
      },
    );

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Por favor ingresa un correo electrónico válido para la confirmación.')).toBeDefined();
  });

  it('debe validar direccion vacia', () => {
    const { container } = renderModal(
      { abierto: true, alCerrar: vi.fn() },
      {
        datosEntrega: {
          correoElectronico: 'cliente@test.com',
          direccion: '',
        },
      },
    );

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Por favor ingresa la dirección de entrega del pedido.')).toBeDefined();
  });

  it('debe validar terminos no aceptados', () => {
    const { container } = renderModal({ abierto: true, alCerrar: vi.fn() });
    const checkbox = container.querySelector('input[type="checkbox"]')!;
    fireEvent.click(checkbox); // desmarcar

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.getByText('Debes aceptar los términos y condiciones de Wompi para continuar.')).toBeDefined();
  });

  it('debe capturar errores de axios de forma controlada', async () => {
    mockedAxios.get = vi.fn().mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { error: { reason: 'Token invalido' } } },
    });

    const { container } = renderModal({ abierto: true, alCerrar: vi.fn() });
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(await screen.findByText(/Token invalido/i)).toBeDefined();
  });

  it('debe capturar errores con mensaje alternativo', async () => {
    mockedAxios.get = vi.fn().mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { mensaje: 'Error alternativo en pasarela' } },
    });

    const { container } = renderModal({ abierto: true, alCerrar: vi.fn() });
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(await screen.findByText(/Error alternativo en pasarela/i)).toBeDefined();
  });

  it('debe capturar errores genericos de instancia Error', async () => {
    mockedAxios.get = vi.fn().mockRejectedValueOnce(new Error('Fallo general'));

    const { container } = renderModal({ abierto: true, alCerrar: vi.fn() });
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(await screen.findByText(/Fallo general/i)).toBeDefined();
  });

  it('debe capturar errores inesperados no estándar (strings u objetos primitivos)', async () => {
    mockedAxios.get = vi.fn().mockRejectedValueOnce('Error primitivo');

    const { container } = renderModal({ abierto: true, alCerrar: vi.fn() });
    const form = container.querySelector('form')!;

    await act(async () => {
      fireEvent.submit(form);
    });

    expect(await screen.findByText(/Ocurrió un error inesperado al conectar con Wompi/i)).toBeDefined();
  });
});
