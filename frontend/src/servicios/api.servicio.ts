import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SANDBOX_URL = import.meta.env.VITE_SANDBOX_URL || 'https://api-sandbox.co.uat.wompi.dev/v1';
const PUB_KEY = import.meta.env.VITE_SANDBOX_PUB_KEY || 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';

export const pasarelaServicio = {
  obtenerTokenAceptacion: async () => {
    const respuesta = await axios.get(`${SANDBOX_URL}/merchants/${PUB_KEY}`);
    return respuesta.data.data.presigned_acceptance.acceptance_token;
  },

  tokenizarTarjeta: async (datosTarjeta: {
    numero: string;
    cvc: string;
    mesVencimiento: string;
    anioVencimiento: string;
    nombreTitular: string;
  }) => {
    const respuesta = await axios.post(
      `${SANDBOX_URL}/tokens/cards`,
      {
        number: datosTarjeta.numero.replace(/\s/g, ''),
        cvc: datosTarjeta.cvc,
        exp_month: datosTarjeta.mesVencimiento,
        exp_year: datosTarjeta.anioVencimiento.slice(-2),
        card_holder: datosTarjeta.nombreTitular,
      },
      {
        headers: { Authorization: `Bearer ${PUB_KEY}` },
      }
    );
    return respuesta.data.data.id;
  },
};

export const tiendaServicio = {
  obtenerProducto: async (id: string) => {
    const respuesta = await axios.get(`${API_URL}/productos/${id}`);
    return respuesta.data;
  },

  procesarTransaccion: async (cuerpo: any) => {
    const respuesta = await axios.post(`${API_URL}/transacciones`, cuerpo);
    return respuesta.data;
  },
};