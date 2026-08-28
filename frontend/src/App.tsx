import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './estado/store';
import { establecerPaso, reiniciarFlujo } from './estado/slices/pago.slice';
import { ModalPago } from './componentes/pago/ModalPago';
import { EstadoTransaccion } from './componentes/resultado/EstadoTransaccion';
import { ShieldCheck, CreditCard, Sparkles, Check } from 'lucide-react';

export const App = () => {
  const dispatch = useDispatch();
  const { pasoActual, transaccionResultado } = useSelector((state: RootState) => state.pago);
  const [modalAbierto, setModalAbierto] = useState(pasoActual === 2 || pasoActual === 3);
  const [producto] = useState({
    id: 'prod-001',
    nombre: 'Chaqueta Impermeable Urbana',
    descripcion: 'Chaqueta ligera de alta resistencia con membrana transpirable y protección contra lluvia torrencial.',
    precioEnCentavos: 15000000,
    unidadesDisponibles: 12,
    urlImagen: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  });

  const abrirModalPago = () => {
    dispatch(establecerPaso(2));
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    dispatch(establecerPaso(1));
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
    <div className="min-h-screen bg-[#0A0E27] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Círculos decorativos de fondo con iluminación Wompi */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#5820B0]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-[450px] h-[450px] bg-[#00E599]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar con Identidad Corporativa Wompi */}
      <header className="border-b border-white/10 bg-[#0A0E27]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-white font-sans">wompi</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E599] animate-pulse"></span>
            </div>
            <span className="hidden sm:inline-block text-[10px] text-slate-400 border-l border-white/15 pl-3">
              Una empresa de Bancolombia
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E599]"></span>
              Sandbox Activo
            </span>
          </div>
        </div>
      </header>

      {/* Contenido Principal: Tarjeta de Producto */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center relative z-10 w-full">
        
        {/* Banner de Presentación */}
        <div className="text-center mb-8 max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#00E599] border border-white/10 backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pasarela de Pago Segura con Tarjeta de Crédito</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Tienda E-Commerce
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Experimenta el flujo oficial de pagos con tarjeta de crédito tokenizada a través del Sandbox de Wompi.
          </p>
        </div>

        {/* Tarjeta de Producto E-Commerce */}
        <div className="w-full max-w-md bg-gradient-to-b from-[#131138] to-[#1C164D] rounded-3xl shadow-2xl overflow-hidden border border-[#2D215E] flex flex-col">
          
          {/* Imagen del Producto */}
          <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden group">
            <img
              src={producto.urlImagen}
              alt={producto.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#131138] via-transparent to-transparent opacity-80" />
            
            <div className="absolute top-4 right-4 bg-[#0A0E27]/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#00E599] border border-[#00E599]/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#00E599]"></span>
              {producto.unidadesDisponibles} disponibles
            </div>
          </div>

          {/* Información del Producto */}
          <div className="p-6 sm:p-7 space-y-5">
            <div>
              <span className="text-[11px] font-bold text-[#00E599] uppercase tracking-wider">Moda y Accesorios</span>
              <h2 className="text-2xl font-extrabold text-white mt-0.5">{producto.nombre}</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{producto.descripcion}</p>
            </div>

            {/* Características rápidas */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <Check className="w-3.5 h-3.5 text-[#00E599]" />
                <span>Envío asegurado</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E599]" />
                <span>Garantía 1 año</span>
              </div>
            </div>

            {/* Precio y Botón de Pago Wompi */}
            <div className="pt-2 border-t border-white/10 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Precio del producto:</span>
                  <div className="text-3xl font-black text-[#00E599]">
                    ${(producto.precioEnCentavos / 100).toLocaleString('es-CO')}
                    <span className="text-xs font-bold text-slate-400 ml-1.5">COP</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  + Tarifa y Envío
                </span>
              </div>

              {/* Botón Principal Estilo Wompi */}
              <button
                onClick={abrirModalPago}
                disabled={producto.unidadesDisponibles <= 0}
                className="w-full py-4 px-6 rounded-full bg-[#00E599] hover:bg-[#00F0A0] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0E27] font-black text-base transition-all shadow-xl shadow-[#00E599]/20 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <CreditCard className="w-5 h-5" />
                <span>{producto.unidadesDisponibles > 0 ? 'Pagar con Tarjeta de Crédito' : 'Agotado'}</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Wompi */}
      <footer className="border-t border-white/10 py-6 bg-[#070A1C] text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">wompi</span>
            <span>• Pasarela de pagos de Colombia</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E599]" /> Cifrado 256-bit SSL
            </span>
            <span>PCI-DSS Level 1</span>
          </div>
        </div>
      </footer>

      {/* Modal de Pago con Material Backdrop */}
      <ModalPago
        abierto={modalAbierto}
        alCerrar={cerrarModal}
      />
    </div>
  );
};
export default App;