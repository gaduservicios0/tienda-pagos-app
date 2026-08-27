import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../estado/store';
import { establecerPaso, actualizarDatosTarjeta, actualizarDatosEntrega, guardarResultado } from '../../estado/slices/pago.slice';
import { detectarFranquicia, validarLuhn } from '../../utilidades/validadores-tarjeta';
import axios from 'axios';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
}

export const ModalPago: React.FC<Props> = ({ abierto, alCerrar }) => {
  const dispatch = useDispatch();
  const { pasoActual, datosTarjeta, datosEntrega, montos } = useSelector((state: RootState) => state.pago);
  const [cargando, setCargando] = useState(false);
  const [errorToken, setErrorToken] = useState<string | null>(null);

  if (!abierto) return null;

  const franquicia = detectarFranquicia(datosTarjeta.numero);
  const tarjetaValida = validarLuhn(datosTarjeta.numero);

  const manejarEnvioPago = async () => {
    setCargando(true);
    setErrorToken(null);

    try {
      const llavePublica = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';
      const urlSandbox = 'https://api-sandbox.co.uat.wompi.dev/v1';
      const urlBackend = import.meta.env.VITE_API_URL || 'https://tienda-pagos-app.onrender.com/api';

      // 1. Obtener acceptance_token fresco
      const resComercio = await axios.get(`${urlSandbox}/merchants/${llavePublica}`);
      const tokenAceptacion = resComercio.data.data.presigned_acceptance.acceptance_token;

      // 2. Tokenizar la tarjeta
      const mesFormateado = datosTarjeta.mesVencimiento.padStart(2, '0');
      const anioFormateado = datosTarjeta.anioVencimiento.length === 4 
        ? datosTarjeta.anioVencimiento.slice(-2) 
        : datosTarjeta.anioVencimiento;

      const resTarjeta = await axios.post(
        `${urlSandbox}/tokens/cards`,
        {
          number: datosTarjeta.numero.replace(/\s/g, ''),
          cvc: datosTarjeta.cvc,
          exp_month: mesFormateado,
          exp_year: anioFormateado,
          card_holder: datosTarjeta.nombreTitular || 'Cliente Prueba',
        },
        {
          headers: {
            Authorization: `Bearer ${llavePublica}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const tokenTarjeta = resTarjeta.data.data.id;

      // 3. Procesar en el Backend
      const resPago = await axios.post(`${urlBackend}/transacciones`, {
        productoId: 'prod-001',
        tokenAceptacion,
        tokenTarjeta,
        cuotas: Number(datosTarjeta.cuotas) || 1,
        cliente: {
          nombreCompleto: datosTarjeta.nombreTitular || datosEntrega.nombreCompleto || 'Cliente Prueba',
          correoElectronico: datosEntrega.correoElectronico,
          numeroTelefono: datosEntrega.numeroTelefono || '3001234567',
          tipoDocumento: datosEntrega.tipoDocumento || 'CC',
          numeroDocumento: datosEntrega.numeroDocumento || '1020304050',
        },
        entrega: {
          direccion: datosEntrega.direccion,
          ciudad: datosEntrega.ciudad || 'Bogotá',
          departamento: datosEntrega.departamento || 'Cundinamarca',
          codigoPostal: '110111',
        },
      });

      dispatch(guardarResultado(resPago.data));
      dispatch(establecerPaso(4));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const detalle =
          err.response?.data?.error?.reason ||
          err.response?.data?.mensaje ||
          err.response?.data?.message ||
          err.message ||
          'Error de conexión con el servidor';
        setErrorToken(`Error: ${detalle}`);
      } else if (err instanceof Error) {
        setErrorToken(`Error: ${err.message}`);
      } else {
        setErrorToken('Error al procesar la transacción');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">
            {pasoActual === 2 ? 'Datos de Pago y Entrega' : 'Resumen de Compra'}
          </h2>
          <button onClick={alCerrar} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
        </div>

        {/* Contenido Dinámico */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorToken && (
            <div className="p-3 text-xs bg-red-100 text-red-700 rounded-lg">{errorToken}</div>
          )}

          {pasoActual === 2 && (
            <div className="space-y-4">
              {/* Sección: Datos de la Tarjeta */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Información de la Tarjeta
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nombre en la Tarjeta</label>
                  <input
                    type="text"
                    value={datosTarjeta.nombreTitular}
                    onChange={(e) => dispatch(actualizarDatosTarjeta({ nombreTitular: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Cliente Prueba"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Número de Tarjeta</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={19}
                      value={datosTarjeta.numero}
                      onChange={(e) => dispatch(actualizarDatosTarjeta({ numero: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="4242 4242 4242 4242"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-blue-600">{franquicia}</span>
                  </div>
                  {!tarjetaValida && datosTarjeta.numero.length > 12 && (
                    <span className="text-[10px] text-red-500">Número de tarjeta no válido (Algoritmo Luhn)</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Expiración</label>
                    <div className="flex space-x-1">
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="MM"
                        value={datosTarjeta.mesVencimiento}
                        onChange={(e) => dispatch(actualizarDatosTarjeta({ mesVencimiento: e.target.value }))}
                        className="w-1/2 px-1 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <input
                        type="text"
                        maxLength={2}
                        placeholder="AA"
                        value={datosTarjeta.anioVencimiento}
                        onChange={(e) => dispatch(actualizarDatosTarjeta({ anioVencimiento: e.target.value }))}
                        className="w-1/2 px-1 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="123"
                      value={datosTarjeta.cvc}
                      onChange={(e) => dispatch(actualizarDatosTarjeta({ cvc: e.target.value }))}
                      className="w-full px-2 py-2 border rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Cuotas</label>
                    <select
                      value={datosTarjeta.cuotas || 1}
                      onChange={(e) => dispatch(actualizarDatosTarjeta({ cuotas: Number(e.target.value) }))}
                      className="w-full px-2 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'cuota' : 'cuotas'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Sección: Datos de Entrega */}
              <div className="space-y-3 pt-2 border-t">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Datos de Entrega y Contacto
                </h3>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={datosEntrega.correoElectronico}
                    onChange={(e) => dispatch(actualizarDatosEntrega({ correoElectronico: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="cliente@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Dirección de Entrega</label>
                  <input
                    type="text"
                    value={datosEntrega.direccion}
                    onChange={(e) => dispatch(actualizarDatosEntrega({ direccion: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Carrera 14A # 16-42"
                  />
                </div>
              </div>
            </div>
          )}

          {pasoActual === 3 && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Producto</span>
                <span>${(montos.subtotal / 100).toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tarifa Base de Procesamiento</span>
                <span>${(montos.tarifaBase / 100).toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Costo de Envío</span>
                <span>${(montos.tarifaEnvio / 100).toLocaleString('es-CO')} COP</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-slate-800 text-base">
                <span>Total a Pagar ({datosTarjeta.cuotas || 1} {(datosTarjeta.cuotas || 1) === 1 ? 'cuota' : 'cuotas'})</span>
                <span>${(montos.total / 100).toLocaleString('es-CO')} COP</span>
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center">
          {pasoActual === 2 ? (
            <button
              onClick={() => dispatch(establecerPaso(3))}
              disabled={!tarjetaValida || !datosTarjeta.nombreTitular || !datosEntrega.direccion || !datosEntrega.correoElectronico}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-colors"
            >
              Continuar al Resumen
            </button>
          ) : (
            <div className="flex w-full space-x-2">
              <button
                onClick={() => dispatch(establecerPaso(2))}
                className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-medium transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={manejarEnvioPago}
                disabled={cargando}
                className="w-2/3 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {cargando ? 'Procesando...' : 'Pagar Ahora'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};