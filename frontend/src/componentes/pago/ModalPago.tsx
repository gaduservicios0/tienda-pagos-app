import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../estado/store';
import { 
  establecerPaso, 
  actualizarDatosTarjeta, 
  actualizarDatosEntrega, 
  guardarResultado 
} from '../../estado/slices/pago.slice';
import { detectarFranquicia, validarLuhn } from '../../utilidades/validadores-tarjeta';
import axios from 'axios';
import { 
  Lock, 
  ShieldCheck, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  Truck, 
  ShoppingBag, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  User,
  Mail,
  MapPin
} from 'lucide-react';

interface Props {
  abierto: boolean;
  alCerrar: () => void;
}

export const ModalPago: React.FC<Props> = ({ abierto, alCerrar }) => {
  const dispatch = useDispatch();
  const { datosTarjeta, datosEntrega, montos } = useSelector((state: RootState) => state.pago);
  
  const [cargando, setCargando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [mostrarResumenBackdrop, setMostrarResumenBackdrop] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(true);

  if (!abierto) return null;

  const franquicia = detectarFranquicia(datosTarjeta.numero);
  const tarjetaValida = validarLuhn(datosTarjeta.numero);
  const numeroLimpio = datosTarjeta.numero.replace(/\s/g, '');

  // Formateador visual de tarjeta en bloques de 4
  const manejarCambioNumeroTarjeta = (valor: string) => {
    const soloNumeros = valor.replace(/\D/g, '').slice(0, 16);
    const formateado = soloNumeros.replace(/(\d{4})(?=\d)/g, '$1 ');
    dispatch(actualizarDatosTarjeta({ numero: formateado }));
  };

  const manejarEnvioPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);
    setMensajeEstado(null);

    if (!tarjetaValida) {
      setErrorValidacion('Por favor ingresa un número de tarjeta de crédito válido.');
      return;
    }

    if (!datosTarjeta.nombreTitular.trim()) {
      setErrorValidacion('Por favor ingresa el nombre del titular tal como figura en la tarjeta.');
      return;
    }

    if (!datosTarjeta.mesVencimiento || !datosTarjeta.anioVencimiento) {
      setErrorValidacion('Por favor ingresa la fecha de vencimiento completa (Mes y Año).');
      return;
    }

    if (!datosTarjeta.cvc || datosTarjeta.cvc.length < 3) {
      setErrorValidacion('Por favor ingresa el código CVC de seguridad (3 o 4 dígitos).');
      return;
    }

    if (!datosEntrega.correoElectronico.trim() || !datosEntrega.correoElectronico.includes('@')) {
      setErrorValidacion('Por favor ingresa un correo electrónico válido para la confirmación.');
      return;
    }

    if (!datosEntrega.direccion.trim()) {
      setErrorValidacion('Por favor ingresa la dirección de entrega del pedido.');
      return;
    }

    if (!aceptaTerminos) {
      setErrorValidacion('Debes aceptar los términos y condiciones de Wompi para continuar.');
      return;
    }

    setCargando(true);
    setMensajeEstado('1/3 Obteniendo autorización segura con Wompi...');

    try {
      const llavePublica = import.meta.env.VITE_WOMPI_PUB_KEY || 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';
      const urlSandbox = import.meta.env.VITE_WOMPI_SANDBOX_URL || 'https://api-sandbox.co.uat.wompi.dev/v1';
      const urlBackend = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

      // 1. Obtener acceptance_token fresco del comercio Wompi
      const resComercio = await axios.get(`${urlSandbox}/merchants/${llavePublica}`);
      const tokenAceptacion = resComercio.data.data.presigned_acceptance.acceptance_token;

      setMensajeEstado('2/3 Tokenizando tarjeta de crédito...');

      // 2. Tokenizar la tarjeta con Wompi
      const mesFormateado = datosTarjeta.mesVencimiento.padStart(2, '0');
      const anioFormateado = datosTarjeta.anioVencimiento.length === 4 
        ? datosTarjeta.anioVencimiento.slice(-2) 
        : datosTarjeta.anioVencimiento.padStart(2, '0');

      const resTarjeta = await axios.post(
        `${urlSandbox}/tokens/cards`,
        {
          number: numeroLimpio,
          cvc: datosTarjeta.cvc,
          exp_month: mesFormateado,
          exp_year: anioFormateado,
          card_holder: datosTarjeta.nombreTitular.trim() || 'Cliente Prueba',
        },
        {
          headers: {
            Authorization: `Bearer ${llavePublica}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const tokenTarjeta = resTarjeta.data.data.id;

      setMensajeEstado('3/3 Procesando transacción con firma de integridad...');

      // 3. Procesar en el Backend con cálculo de firma SHA-256
      const resPago = await axios.post(`${urlBackend}/transacciones`, {
        productoId: 'prod-001',
        tokenAceptacion,
        tokenTarjeta,
        cuotas: Number(datosTarjeta.cuotas) || 1,
        cliente: {
          nombreCompleto: datosTarjeta.nombreTitular.trim() || datosEntrega.nombreCompleto || 'Cliente Prueba',
          correoElectronico: datosEntrega.correoElectronico.trim(),
          numeroTelefono: datosEntrega.numeroTelefono || '3001234567',
          tipoDocumento: datosEntrega.tipoDocumento || 'CC',
          numeroDocumento: datosEntrega.numeroDocumento || '1020304050',
        },
        entrega: {
          direccion: datosEntrega.direccion.trim(),
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
          'Error al procesar el pago con la pasarela';
        setErrorValidacion(`Error de pago: ${detalle}`);
      } else if (err instanceof Error) {
        setErrorValidacion(`Error: ${err.message}`);
      } else {
        setErrorValidacion('Ocurrió un error inesperado al conectar con Wompi.');
      }
    } finally {
      setCargando(false);
      setMensajeEstado(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !cargando) alCerrar();
      }}
    >
      {/* Contenedor Material Backdrop */}
      <div className="w-full max-w-lg bg-[#0A0E27] rounded-3xl shadow-2xl overflow-hidden border border-[#2B1B54] flex flex-col my-auto relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* ============================================================ */}
        {/* BACK LAYER (Material Backdrop): Encabezado y Resumen Wompi */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-b from-[#0A0E27] via-[#131138] to-[#1C164D] text-white p-5 sm:p-6 relative">
          {/* Barra superior de marca Wompi */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-white font-sans">wompi</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-pulse"></span>
              </div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 px-2.5 py-0.5 rounded-full">
                Sandbox
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E599]" />
                Pago Seguro
              </span>
              <button
                type="button"
                onClick={alCerrar}
                disabled={cargando}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-lg font-bold transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Cerrar modal"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Toggle del Resumen de Compra (Backdrop Drawer Control) */}
          <div className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total a Pagar</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-[#00E599] tracking-tight">
                  ${(montos.total / 100).toLocaleString('es-CO')}
                </span>
                <span className="text-xs font-bold text-slate-300">COP</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMostrarResumenBackdrop(!mostrarResumenBackdrop)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-full border border-white/15 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#00E599]" />
              <span>{mostrarResumenBackdrop ? 'Ocultar Resumen' : 'Ver Resumen'}</span>
              {mostrarResumenBackdrop ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Contenido desplegable del Resumen (Backdrop Surface Details) */}
          {mostrarResumenBackdrop && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between text-xs bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=150&q=80"
                      alt="Chaqueta"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-white">Chaqueta Impermeable Urbana</p>
                    <p className="text-[10px] text-slate-400">Cantidad: 1 unidad</p>
                  </div>
                </div>
                <span className="font-bold text-slate-200">
                  ${(montos.subtotal / 100).toLocaleString('es-CO')} COP
                </span>
              </div>

              <div className="bg-black/30 p-3 rounded-2xl space-y-2 text-xs border border-white/5">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal Producto</span>
                  <span>${(montos.subtotal / 100).toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Tarifa Base de Procesamiento</span>
                  <span>${(montos.tarifaBase / 100).toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3 text-[#00E599]" /> Envío Nacional
                  </span>
                  <span>${(montos.tarifaEnvio / 100).toLocaleString('es-CO')} COP</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-extrabold text-sm text-[#00E599]">
                  <span>Total Liquidado</span>
                  <span>${(montos.total / 100).toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3 h-3 text-[#00E599]" />
                <span>Cifrado SSL de 256 bits respaldado por Bancolombia</span>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* FRONT LAYER (Material Backdrop): Formulario Interactivo Wompi */}
        {/* ============================================================ */}
        <div className="bg-white text-slate-900 rounded-t-[28px] sm:rounded-t-[32px] p-5 sm:p-6 shadow-2xl flex flex-col relative z-20">
          
          {/* Manija táctil / Indicador de elevación Backdrop */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />

          {/* Simulador Interactivo de Tarjeta de Crédito Wompi */}
          <div className="w-full bg-gradient-to-tr from-[#0D0B24] via-[#241442] to-[#451466] rounded-2xl p-4 sm:p-5 text-white shadow-xl mb-5 relative overflow-hidden border border-[#3E216E]">
            {/* Patrón holográfico de fondo */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#00E599]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#5820B0]/30 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-6 rounded-md bg-gradient-to-r from-amber-200 to-yellow-400 flex items-center justify-center shadow-inner border border-amber-300">
                  <div className="w-6 h-3 border border-amber-600/40 rounded-sm"></div>
                </div>
                <div className="w-4 h-4 rounded-full border border-white/40 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full border border-white/60"></div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/15 backdrop-blur-sm text-xs font-black tracking-wider text-white border border-white/20">
                  {franquicia || 'TARJETA'}
                </span>
              </div>
            </div>

            {/* Número de Tarjeta en Vivo */}
            <div className="mb-4 relative z-10">
              <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest">Número de Tarjeta</p>
              <p className="text-base sm:text-lg font-mono font-bold tracking-widest text-slate-100">
                {datosTarjeta.numero ? datosTarjeta.numero : '•••• •••• •••• ••••'}
              </p>
            </div>

            <div className="flex justify-between items-end relative z-10 text-xs">
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-mono">Titular</p>
                <p className="font-semibold uppercase tracking-wide truncate max-w-[170px] text-slate-200">
                  {datosTarjeta.nombreTitular || 'CLIENTE PRUEBA'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-mono text-center">Vence</p>
                  <p className="font-mono font-semibold text-slate-200">
                    {datosTarjeta.mesVencimiento || 'MM'}/{datosTarjeta.anioVencimiento || 'AA'}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-mono text-center">CVC</p>
                  <p className="font-mono font-semibold text-slate-200">
                    {datosTarjeta.cvc ? '•••' : '•••'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de Alerta y Estado */}
          {errorValidacion && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorValidacion}</span>
            </div>
          )}

          {mensajeEstado && (
            <div className="mb-4 p-3 bg-[#00E599]/10 border border-[#00E599]/30 rounded-2xl flex items-center gap-2 text-xs text-[#0A0E27] font-semibold animate-pulse">
              <Sparkles className="w-4 h-4 text-[#00E599] shrink-0" />
              <span>{mensajeEstado}</span>
            </div>
          )}

          {/* Formulario Wompi */}
          <form onSubmit={manejarEnvioPago} className="space-y-4">
            
            {/* 1. SECCIÓN: DATOS DE LA TARJETA */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A0E27] uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-[#5820B0]" />
                <span>Datos de la Tarjeta</span>
              </div>

              {/* Nombre en la Tarjeta */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nombre del Titular en la Tarjeta <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={datosTarjeta.nombreTitular}
                    onChange={(e) => dispatch(actualizarDatosTarjeta({ nombreTitular: e.target.value }))}
                    placeholder="Ej. Cliente Prueba"
                    className="w-full pl-9 pr-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#00E599] focus:border-[#00E599] outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Número de Tarjeta */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Número de Tarjeta de Crédito <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={datosTarjeta.numero}
                    onChange={(e) => manejarCambioNumeroTarjeta(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full pl-9 pr-20 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#00E599] focus:border-[#00E599] outline-none transition-all placeholder:text-slate-400 shadow-sm"
                  />
                  <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <span className="absolute right-3 top-2.5 text-[11px] font-black uppercase text-[#5820B0] bg-[#5820B0]/10 px-2 py-0.5 rounded-md">
                    {franquicia || 'Tarjeta'}
                  </span>
                </div>
                {!tarjetaValida && numeroLimpio.length >= 13 && (
                  <p className="text-[10px] text-red-500 mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Número no válido según el algoritmo de Luhn
                  </p>
                )}
              </div>

              {/* Fila: Expiración, CVC y Cuotas */}
              <div className="grid grid-cols-12 gap-2">
                {/* Expiración (5 columnas) */}
                <div className="col-span-5">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Vence (MM/AA) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      required
                      maxLength={2}
                      placeholder="MM"
                      value={datosTarjeta.mesVencimiento}
                      onChange={(e) => dispatch(actualizarDatosTarjeta({ mesVencimiento: e.target.value.replace(/\D/g, '') }))}
                      className="w-1/2 text-center py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#00E599] outline-none shadow-sm"
                    />
                    <input
                      type="text"
                      required
                      maxLength={2}
                      placeholder="AA"
                      value={datosTarjeta.anioVencimiento}
                      onChange={(e) => dispatch(actualizarDatosTarjeta({ anioVencimiento: e.target.value.replace(/\D/g, '') }))}
                      className="w-1/2 text-center py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#00E599] outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* CVC (3 columnas) */}
                <div className="col-span-3">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    CVC <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="123"
                      value={datosTarjeta.cvc}
                      onChange={(e) => dispatch(actualizarDatosTarjeta({ cvc: e.target.value.replace(/\D/g, '') }))}
                      className="w-full text-center py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-[#00E599] outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Cuotas (4 columnas) */}
                <div className="col-span-4">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Cuotas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={datosTarjeta.cuotas || 1}
                    onChange={(e) => dispatch(actualizarDatosTarjeta({ cuotas: Number(e.target.value) }))}
                    className="w-full py-2.5 px-2 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#00E599] outline-none cursor-pointer shadow-sm"
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

            {/* 2. SECCIÓN: DATOS DE ENVÍO Y CONTACTO */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A0E27] uppercase tracking-wider">
                <Truck className="w-3.5 h-3.5 text-[#5820B0]" />
                <span>Datos de Envío y Facturación</span>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Correo Electrónico de Notificación <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={datosEntrega.correoElectronico}
                    onChange={(e) => dispatch(actualizarDatosEntrega({ correoElectronico: e.target.value }))}
                    placeholder="gerson.mercado@outlook.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#00E599] outline-none placeholder:text-slate-400 shadow-sm"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Dirección de Entrega */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Dirección de Entrega <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={datosEntrega.direccion}
                    onChange={(e) => dispatch(actualizarDatosEntrega({ direccion: e.target.value }))}
                    placeholder="Carrera 14A # 16-42"
                    className="w-full pl-9 pr-3 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#00E599] outline-none placeholder:text-slate-400 shadow-sm"
                  />
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              {/* Ciudad y Departamento */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={datosEntrega.ciudad || 'Bogotá'}
                    onChange={(e) => dispatch(actualizarDatosEntrega({ ciudad: e.target.value }))}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#00E599] outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Departamento</label>
                  <input
                    type="text"
                    value={datosEntrega.departamento || 'Cundinamarca'}
                    onChange={(e) => dispatch(actualizarDatosEntrega({ departamento: e.target.value }))}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#00E599] outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Aceptación de términos y políticas Wompi */}
            <div className="pt-2">
              <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-[#5820B0] focus:ring-[#00E599] cursor-pointer"
                />
                <span>
                  Acepto el{' '}
                  <a
                    href="https://wompi.com/assets/downloadble/reglamento-Usuarios-Colombia.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5820B0] font-bold underline inline-flex items-center gap-0.5 hover:text-[#2B0938]"
                  >
                    Reglamento de Usuarios de Wompi <ExternalLink className="w-2.5 h-2.5" />
                  </a>{' '}
                  y la autorización de tratamiento de datos personales.
                </span>
              </label>
            </div>

            {/* BOTÓN PRINCIPAL WOMPI */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full py-4 px-6 rounded-full bg-[#00E599] hover:bg-[#00F0A0] active:scale-[0.99] disabled:opacity-50 text-[#0A0E27] font-black text-sm sm:text-base tracking-wide transition-all shadow-xl shadow-[#00E599]/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {cargando ? (
                <>
                  <div className="w-5 h-5 border-2 border-[#0A0E27] border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando con Wompi...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pagar ${(montos.total / 100).toLocaleString('es-CO')} COP</span>
                </>
              )}
            </button>

            {/* Pie de seguridad Wompi */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#00E599]" />
              <span>Transacción protegida por pasarela Wompi Bancolombia</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};