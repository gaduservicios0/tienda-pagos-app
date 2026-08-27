import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './estado/store';
import { establecerPaso, reiniciarFlujo } from './estado/slices/pago.slice';
import { ModalPago } from './componentes/pago/ModalPago';
import { EstadoTransaccion } from './componentes/resultado/EstadoTransaccion';

export const App = () => {
  const dispatch = useDispatch();
  const { pasoActual, transaccionResultado } = useSelector((state: RootState) => state.pago);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [producto] = useState({
    id: 'prod-001',
    nombre: 'Chaqueta Impermeable Urbana',
    descripcion: 'Chaqueta ligera de alta resistencia con protección contra lluvia y viento.',
    precioEnCentavos: 15000000,
    unidadesDisponibles: 12,
    urlImagen: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
  });

  const abrirModalPago = () => {
    dispatch(establecerPaso(2));
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  const reiniciar = () => {
    dispatch(reiniciarFlujo());
    setModalAbierto(false);
  };

  if (pasoActual === 4 && transaccionResultado) {
    return <EstadoTransaccion resultado={transaccionResultado} alFinalizar={reiniciar} />;
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-sm w-full border border-slate-200">
        <div className="relative h-64 w-full bg-slate-200 overflow-hidden">
          <img
            src={producto.urlImagen}
            alt={producto.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800">
            Stock: {producto.unidadesDisponibles} uds
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{producto.nombre}</h1>
            <p className="text-xs text-slate-500 mt-1">{producto.descripcion}</p>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500">Precio unitario:</span>
            <span className="text-2xl font-black text-slate-900">
              ${(producto.precioEnCentavos / 100).toLocaleString('es-CO')} COP
            </span>
          </div>

          <button
            onClick={abrirModalPago}
            disabled={producto.unidadesDisponibles <= 0}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            {producto.unidadesDisponibles > 0 ? 'Pagar con tarjeta de crédito' : 'Agotado'}
          </button>
        </div>
      </div>

      <ModalPago
        abierto={modalAbierto || pasoActual === 2 || pasoActual === 3}
        alCerrar={cerrarModal}
        alFinalizar={reiniciar}
      />
    </main>
  );
};
export default App;