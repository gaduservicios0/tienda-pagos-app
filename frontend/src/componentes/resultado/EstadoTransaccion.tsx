import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowLeft, Copy, Calendar, CreditCard, Hash, Check } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../estado/store';

interface Props {
  resultado: {
    idTransaccion?: string;
    estado?: string;
    mensaje?: string;
  };
  alFinalizar: () => void;
}

export const EstadoTransaccion: React.FC<Props> = ({ resultado, alFinalizar }) => {
  const { datosTarjeta, datosEntrega, montos } = useSelector((state: RootState) => state.pago);
  const [copiado, setCopiado] = React.useState(false);

  const esExitosa = resultado.estado === 'APROBADA';
  const esRechazada = resultado.estado === 'RECHAZADA';
  const fechaActual = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const copiarReferencia = () => {
    if (resultado.idTransaccion) {
      navigator.clipboard.writeText(resultado.idTransaccion);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] py-10 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Círculos decorativos de fondo con colores de Wompi */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#5820B0]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-[#00E599]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Wompi */}
      <div className="flex items-center gap-2 mb-6 z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-black tracking-tight text-white font-sans">wompi</span>
          <span className="w-2 h-2 rounded-full bg-[#00E599] animate-pulse"></span>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1F1944] text-slate-300 border border-[#3D2C7A]">
          Comprobante Oficial
        </span>
      </div>

      {/* Tarjeta de Recibo / Voucher */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col">
        {/* Cabecera del estado */}
        <div
          className={`p-6 text-center text-white relative ${
            esExitosa
              ? 'bg-gradient-to-br from-[#0A0E27] via-[#1E1B4B] to-[#2B0938]'
              : esRechazada
              ? 'bg-gradient-to-br from-[#270A15] via-[#471223] to-[#1E1B4B]'
              : 'bg-gradient-to-br from-[#271E0A] via-[#473612] to-[#1E1B4B]'
          }`}
        >
          {/* Icono de Estado */}
          <div className="flex justify-center mb-3">
            {esExitosa && (
              <div className="w-16 h-16 rounded-full bg-[#00E599]/20 border-2 border-[#00E599] flex items-center justify-center shadow-lg shadow-[#00E599]/30">
                <CheckCircle2 className="w-9 h-9 text-[#00E599]" />
              </div>
            )}
            {esRechazada && (
              <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <XCircle className="w-9 h-9 text-red-400" />
              </div>
            )}
            {!esExitosa && !esRechazada && (
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <AlertTriangle className="w-9 h-9 text-amber-400" />
              </div>
            )}
          </div>

          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
              esExitosa
                ? 'bg-[#00E599] text-[#0A0E27]'
                : esRechazada
                ? 'bg-red-500 text-white'
                : 'bg-amber-400 text-[#0A0E27]'
            }`}
          >
            {esExitosa ? 'Pago Aprobado' : esRechazada ? 'Pago Declinado' : 'Pago Fallido / Pendiente'}
          </span>

          <h2 className="text-xl font-extrabold text-white">
            {esExitosa ? '¡Gracias por tu compra!' : esRechazada ? 'Transacción No Procesada' : 'Atención Requerida'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {resultado.mensaje || (esExitosa ? 'Tu pago ha sido confirmado por la pasarela de pagos Wompi.' : 'No se pudo completar el cobro con la tarjeta.')}
          </p>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-baseline justify-center gap-1.5">
            <span className="text-xs text-slate-400">Total:</span>
            <span className="text-3xl font-black text-[#00E599]">
              ${(montos.total / 100).toLocaleString('es-CO')}
            </span>
            <span className="text-xs font-semibold text-slate-300">COP</span>
          </div>
        </div>

        {/* Detalles del Comprobante */}
        <div className="p-6 space-y-4 bg-slate-50/50">
          {resultado.idTransaccion && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-[#5820B0]/10 flex items-center justify-center text-[#5820B0] shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ID Transacción</p>
                  <p className="text-xs font-mono font-bold text-slate-800 truncate">{resultado.idTransaccion}</p>
                </div>
              </div>
              <button
                onClick={copiarReferencia}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Copiar ID"
              >
                {copiado ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs shadow-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5" /> Fecha y Hora
              </span>
              <span className="font-semibold text-slate-800">{fechaActual}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2.5">
              <span className="flex items-center gap-1.5 text-slate-500">
                <CreditCard className="w-3.5 h-3.5" /> Método de Pago
              </span>
              <span className="font-semibold text-slate-800">
                Tarjeta •••• {datosTarjeta.numero ? datosTarjeta.numero.slice(-4) : '4242'} ({datosTarjeta.cuotas || 1} {Number(datosTarjeta.cuotas) === 1 ? 'cuota' : 'cuotas'})
              </span>
            </div>

            {datosTarjeta.nombreTitular && (
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2.5">
                <span className="text-slate-500">Titular</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">{datosTarjeta.nombreTitular}</span>
              </div>
            )}

            {datosEntrega.correoElectronico && (
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2.5">
                <span className="text-slate-500">Correo</span>
                <span className="font-semibold text-slate-800 truncate max-w-[180px]">{datosEntrega.correoElectronico}</span>
              </div>
            )}

            {datosEntrega.direccion && (
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2.5">
                <span className="text-slate-500">Dirección de Entrega</span>
                <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                  {datosEntrega.direccion}, {datosEntrega.ciudad}
                </span>
              </div>
            )}
          </div>

          {/* Desglose Financiero */}
          <div className="bg-slate-100 p-4 rounded-2xl text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Chaqueta Impermeable Urbana</span>
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
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Pagado</span>
              <span className="text-[#5820B0]">${(montos.total / 100).toLocaleString('es-CO')} COP</span>
            </div>
          </div>
        </div>

        {/* Pie y Botones */}
        <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-3">
          <button
            onClick={alFinalizar}
            className="w-full py-3.5 px-6 rounded-full bg-[#00E599] hover:bg-[#00F0A0] active:scale-[0.98] text-[#0A0E27] font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#00E599]" />
            <span>Procesado de forma segura por Wompi Bancolombia</span>
          </div>
        </div>
      </div>
    </div>
  );
};