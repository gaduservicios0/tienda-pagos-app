import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Copy, Calendar, CreditCard, Hash, Check } from 'lucide-react';
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
    <div className="min-h-screen bg-[#2C2A29] py-10 px-4 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Círculos decorativos de fondo con colores oficiales Wompi */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#00825A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-96 h-96 bg-[#B0F2AE]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header con Logotipo Oficial Wompi */}
      <div className="flex items-center gap-3 mb-6 z-10">
        <div className="bg-[#FAFAFA] px-3 py-1.5 rounded-xl shadow-sm flex items-center">
          <img
            src="/assets/svg/Wompi_LogoPrincipal.svg"
            alt="Wompi"
            className="h-5 w-auto object-contain"
          />
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-[#FAFAFA]/10 text-[#B0F2AE] border border-[#B0F2AE]/30 font-semibold">
          Comprobante Oficial Wompi
        </span>
      </div>

      {/* Tarjeta de Recibo / Voucher */}
      <div className="w-full max-w-md bg-[#FAFAFA] text-[#2C2A29] rounded-3xl shadow-2xl overflow-hidden z-10 border border-white/10 flex flex-col">
        {/* Cabecera del estado */}
        <div
          className={`p-6 text-center text-white relative ${
            esExitosa
              ? 'bg-gradient-to-br from-[#2C2A29] via-[#1E1C1B] to-[#00825A]'
              : esRechazada
              ? 'bg-gradient-to-br from-[#2C2A29] via-[#3D141E] to-[#6E1A2D]'
              : 'bg-gradient-to-br from-[#2C2A29] via-[#382F18] to-[#614E15]'
          }`}
        >
          {/* Icono de Estado */}
          <div className="flex justify-center mb-3">
            {esExitosa && (
              <div className="w-16 h-16 rounded-full bg-[#B0F2AE]/20 border-2 border-[#B0F2AE] flex items-center justify-center shadow-lg shadow-[#B0F2AE]/30">
                <CheckCircle2 className="w-9 h-9 text-[#B0F2AE]" />
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
            className={`inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2 shadow-sm ${
              esExitosa
                ? 'bg-[#B0F2AE] text-[#2C2A29]'
                : esRechazada
                ? 'bg-red-500 text-white'
                : 'bg-[#DFFF61] text-[#2C2A29]'
            }`}
          >
            {esExitosa ? 'Pago Aprobado' : esRechazada ? 'Pago Declinado' : 'Pago Fallido / Pendiente'}
          </span>

          <h2 className="text-xl font-black text-white">
            {esExitosa ? '¡Gracias por tu compra!' : esRechazada ? 'Transacción No Procesada' : 'Atención Requerida'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {resultado.mensaje || (esExitosa ? 'Tu pago ha sido confirmado por la pasarela de pagos Wompi.' : 'No se pudo completar el cobro con la tarjeta.')}
          </p>

          <div className="mt-4 pt-4 border-t border-white/15 flex items-baseline justify-center gap-1.5">
            <span className="text-xs text-slate-300 font-medium">Total:</span>
            <span className="text-3xl font-black text-[#B0F2AE]">
              ${(montos.total / 100).toLocaleString('es-CO')}
            </span>
            <span className="text-xs font-bold text-slate-300">COP</span>
          </div>
        </div>

        {/* Detalles del Comprobante */}
        <div className="p-6 space-y-4 bg-slate-50/70">
          {resultado.idTransaccion && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-[#B0F2AE]/30 flex items-center justify-center text-[#00825A] shrink-0">
                  <Hash className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ID Transacción Wompi</p>
                  <p className="text-xs font-mono font-bold text-[#2C2A29] truncate">{resultado.idTransaccion}</p>
                </div>
              </div>
              <button
                onClick={copiarReferencia}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Copiar ID"
              >
                {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}

          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs shadow-sm">
            <div className="flex justify-between items-center text-slate-600">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-[#00825A]" /> Fecha y Hora
              </span>
              <span className="font-semibold text-[#2C2A29]">{fechaActual}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2.5">
              <span className="flex items-center gap-1.5 text-slate-500">
                <CreditCard className="w-3.5 h-3.5 text-[#00825A]" /> Método de Pago
              </span>
              <span className="font-semibold text-[#2C2A29]">
                Tarjeta •••• {datosTarjeta.numero ? datosTarjeta.numero.slice(-4) : '4242'} ({datosTarjeta.cuotas || 1} {Number(datosTarjeta.cuotas) === 1 ? 'cuota' : 'cuotas'})
              </span>
            </div>

            {datosTarjeta.nombreTitular && (
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2.5">
                <span className="text-slate-500">Titular</span>
                <span className="font-semibold text-[#2C2A29] truncate max-w-[180px]">{datosTarjeta.nombreTitular}</span>
              </div>
            )}

            {datosEntrega.correoElectronico && (
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2.5">
                <span className="text-slate-500">Correo</span>
                <span className="font-semibold text-[#2C2A29] truncate max-w-[180px]">{datosEntrega.correoElectronico}</span>
              </div>
            )}

            {datosEntrega.direccion && (
              <div className="flex justify-between items-center text-slate-600 border-t border-slate-100 pt-2.5">
                <span className="text-slate-500">Dirección de Entrega</span>
                <span className="font-semibold text-[#2C2A29] text-right truncate max-w-[180px]">
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
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-[#2C2A29] text-sm">
              <span>Total Pagado</span>
              <span className="text-[#00825A] font-black">${(montos.total / 100).toLocaleString('es-CO')} COP</span>
            </div>
          </div>
        </div>

        {/* Pie y Botones con Certificado PCI DSS */}
        <div className="p-6 bg-white border-t border-slate-100 flex flex-col gap-3">
          <button
            onClick={alFinalizar}
            className="w-full py-3.5 px-6 rounded-full bg-[#B0F2AE] hover:bg-[#DFFF61] active:scale-[0.98] text-[#2C2A29] font-black text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#00825A]/20"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a la Tienda
          </button>

          <div className="flex items-center justify-center gap-2.5 text-[11px] text-slate-500 font-medium pt-1">
            <img
              src="/assets/svg/LogoCertificadoPCI.svg"
              alt="PCI DSS"
              className="h-5 w-auto object-contain"
            />
            <span>Procesado de forma segura por Wompi Bancolombia</span>
          </div>
        </div>
      </div>
    </div>
  );
};