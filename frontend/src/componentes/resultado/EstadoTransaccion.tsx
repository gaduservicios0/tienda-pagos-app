import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface Props {
  resultado: {
    idTransaccion?: string;
    estado?: string;
    mensaje?: string;
  };
  alFinalizar: () => void;
}

export const EstadoTransaccion: React.FC<Props> = ({ resultado, alFinalizar }) => {
  const esExitosa = resultado.estado === 'APROBADA';
  const esRechazada = resultado.estado === 'RECHAZADA';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-lg p-6 text-center space-y-4">
        <div className="flex justify-center">
          {esExitosa && <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />}
          {esRechazada && <XCircle className="w-16 h-16 text-red-500" />}
          {!esExitosa && !esRechazada && <AlertTriangle className="w-16 h-16 text-yellow-500" />}
        </div>

        <h3 className="text-xl font-bold text-slate-800">
          {esExitosa ? '¡Pago Exitoso!' : esRechazada ? 'Pago Rechazado' : 'Transacción Pendiente o Fallida'}
        </h3>

        <p className="text-xs text-slate-600">
          {resultado.mensaje || 'Hemos procesado su solicitud con la pasarela.'}
        </p>

        {resultado.idTransaccion && (
          <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono text-slate-700 break-all">
            ID: {resultado.idTransaccion}
          </div>
        )}

        <button
          onClick={alFinalizar}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors"
        >
          Volver a la Tienda
        </button>
      </div>
    </div>
  );
};