import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import pagoReducer from './estado/slices/pago.slice';
import App from './App';

const renderAppConRedux = (estadoInicial?: Record<string, unknown>) => {
  const store = configureStore({
    reducer: { pago: pagoReducer },
    preloadedState: {
      pago: {
        pasoActual: 1,
        datosTarjeta: {
          numero: '',
          nombreTitular: '',
          mesVencimiento: '',
          anioVencimiento: '',
          cvc: '',
          cuotas: 1,
        },
        datosEntrega: {
          nombreCompleto: '',
          correoElectronico: '',
          numeroTelefono: '',
          tipoDocumento: 'CC',
          numeroDocumento: '',
          direccion: '',
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
        <App />
      </Provider>,
    ),
  };
};

describe('App Component', () => {
  it('debe renderizar la tarjeta del producto e-commerce correctamente', () => {
    renderAppConRedux();
    expect(screen.getByText('Chaqueta Impermeable Urbana')).toBeDefined();
    expect(screen.getByText(/Pagar con Tarjeta de Crédito/i)).toBeDefined();
  });

  it('debe abrir y cerrar el modal de pago al interactuar', () => {
    const { store } = renderAppConRedux();
    const btnPagar = screen.getByText(/Pagar con Tarjeta de Crédito/i);
    fireEvent.click(btnPagar);

    expect(store.getState().pago.pasoActual).toBe(2);
    expect(screen.getByText('Sandbox')).toBeDefined();

    const btnCerrar = screen.getByLabelText('Cerrar modal');
    fireEvent.click(btnCerrar);
    expect(store.getState().pago.pasoActual).toBe(1);
  });

  it('debe mostrar la pantalla de resultado si el pasoActual es 4 y permitir reiniciar', () => {
    const { store } = renderAppConRedux({
      pasoActual: 4,
      transaccionResultado: {
        idTransaccion: 'trx-final-123',
        estado: 'APROBADA',
        mensaje: 'Compra aprobada',
      },
    });

    expect(screen.getByText('¡Gracias por tu compra!')).toBeDefined();

    const btnVolver = screen.getByText('Volver a la Tienda');
    fireEvent.click(btnVolver);
    expect(store.getState().pago.pasoActual).toBe(1);
  });
});
