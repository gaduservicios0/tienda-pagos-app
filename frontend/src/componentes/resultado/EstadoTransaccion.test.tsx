import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import pagoReducer from '../../estado/slices/pago.slice';
import { EstadoTransaccion } from './EstadoTransaccion';

const renderConRedux = (ui: React.ReactElement, estadoInicial?: Record<string, unknown>) => {
  const store = configureStore({
    reducer: { pago: pagoReducer },
    preloadedState: {
      pago: {
        pasoActual: 4,
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
          numeroDocumento: '123456',
          direccion: 'Carrera 14 # 10',
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

  return render(<Provider store={store}>{ui}</Provider>);
};

describe('EstadoTransaccion Component', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('debe renderizar estado APROBADO correctamente', () => {
    const mockFinalizar = vi.fn();
    renderConRedux(
      <EstadoTransaccion
        resultado={{
          idTransaccion: 'trx-aprobada-01',
          estado: 'APROBADA',
          mensaje: 'Transacción aprobada con éxito',
        }}
        alFinalizar={mockFinalizar}
      />,
    );

    expect(screen.getByText('Pago Aprobado')).toBeDefined();
    expect(screen.getByText('¡Gracias por tu compra!')).toBeDefined();
    expect(screen.getByText('trx-aprobada-01')).toBeDefined();
  });

  it('debe renderizar estado RECHAZADA correctamente', () => {
    const mockFinalizar = vi.fn();
    renderConRedux(
      <EstadoTransaccion
        resultado={{
          idTransaccion: 'trx-rechazada-02',
          estado: 'RECHAZADA',
          mensaje: 'Fondos insuficientes',
        }}
        alFinalizar={mockFinalizar}
      />,
    );

    expect(screen.getByText('Pago Declinado')).toBeDefined();
    expect(screen.getByText('Transacción No Procesada')).toBeDefined();
  });

  it('debe renderizar estado FALLIDO / PENDIENTE correctamente', () => {
    const mockFinalizar = vi.fn();
    renderConRedux(
      <EstadoTransaccion
        resultado={{
          idTransaccion: 'trx-fallida-03',
          estado: 'FALLIDA',
        }}
        alFinalizar={mockFinalizar}
      />,
    );

    expect(screen.getByText('Pago Fallido / Pendiente')).toBeDefined();
    expect(screen.getByText('Atención Requerida')).toBeDefined();
  });

  it('debe renderizar correctamente sin idTransaccion ni numero guardado', () => {
    const mockFinalizar = vi.fn();
    renderConRedux(
      <EstadoTransaccion
        resultado={{
          estado: 'APROBADA',
        }}
        alFinalizar={mockFinalizar}
      />,
      {
        datosTarjeta: {
          numero: '',
          nombreTitular: '',
          mesVencimiento: '',
          anioVencimiento: '',
          cvc: '',
          cuotas: 2,
        },
        datosEntrega: {
          correoElectronico: '',
          direccion: '',
        },
      },
    );

    expect(screen.getByText('Pago Aprobado')).toBeDefined();
  });

  it('debe copiar el ID de transaccion al portapapeles y llamar a alFinalizar', () => {
    vi.useFakeTimers();
    const mockFinalizar = vi.fn();
    renderConRedux(
      <EstadoTransaccion
        resultado={{
          idTransaccion: 'trx-copy-99',
          estado: 'APROBADA',
        }}
        alFinalizar={mockFinalizar}
      />,
    );

    const btnCopiar = screen.getByTitle('Copiar ID');
    fireEvent.click(btnCopiar);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('trx-copy-99');

    act(() => {
      vi.advanceTimersByTime(2100);
    });
    vi.useRealTimers();

    const btnVolver = screen.getByText('Volver a la Tienda');
    fireEvent.click(btnVolver);
    expect(mockFinalizar).toHaveBeenCalled();
  });
});
