import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface EstadoPago {
  pasoActual: number;
  datosTarjeta: {
    numero: string;
    nombreTitular: string;
    mesVencimiento: string;
    anioVencimiento: string;
    cvc: string;
    cuotas: number;
    tokenTarjeta?: string;
  };
  datosEntrega: {
    nombreCompleto: string;
    correoElectronico: string;
    numeroTelefono: string;
    tipoDocumento: string;
    numeroDocumento: string;
    direccion: string;
    ciudad: string;
    departamento: string;
  };
  montos: {
    subtotal: number;
    tarifaBase: number;
    tarifaEnvio: number;
    total: number;
  };
  transaccionResultado: {
    idTransaccion?: string;
    estado?: string;
    mensaje?: string;
  } | null;
}

const ESTADO_INICIAL_DEFECTO: EstadoPago = {
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
};

const cargarEstadoLocal = (): EstadoPago => {
  const guardado = localStorage.getItem('estado_flujo_pago');
  if (guardado) {
    try {
      return JSON.parse(guardado);
    } catch {
      return ESTADO_INICIAL_DEFECTO;
    }
  }
  return ESTADO_INICIAL_DEFECTO;
};

export const pagoSlice = createSlice({
  name: 'pago',
  initialState: cargarEstadoLocal(),
  reducers: {
    establecerPaso: (estado, accion: PayloadAction<number>) => {
      estado.pasoActual = accion.payload;
      localStorage.setItem('estado_flujo_pago', JSON.stringify(estado));
    },
    actualizarDatosTarjeta: (estado, accion: PayloadAction<Partial<EstadoPago['datosTarjeta']>>) => {
      estado.datosTarjeta = { ...estado.datosTarjeta, ...accion.payload };
      localStorage.setItem('estado_flujo_pago', JSON.stringify(estado));
    },
    actualizarDatosEntrega: (estado, accion: PayloadAction<Partial<EstadoPago['datosEntrega']>>) => {
      estado.datosEntrega = { ...estado.datosEntrega, ...accion.payload };
      localStorage.setItem('estado_flujo_pago', JSON.stringify(estado));
    },
    guardarResultado: (estado, accion: PayloadAction<EstadoPago['transaccionResultado']>) => {
      estado.transaccionResultado = accion.payload;
      localStorage.setItem('estado_flujo_pago', JSON.stringify(estado));
    },
    reiniciarFlujo: () => {
      localStorage.removeItem('estado_flujo_pago');
      return ESTADO_INICIAL_DEFECTO;
    },
  },
});

export const { establecerPaso, actualizarDatosTarjeta, actualizarDatosEntrega, guardarResultado, reiniciarFlujo } = pagoSlice.actions;
export default pagoSlice.reducer;