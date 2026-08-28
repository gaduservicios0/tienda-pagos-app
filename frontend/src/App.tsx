import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './estado/store';
import { establecerPaso, reiniciarFlujo } from './estado/slices/pago.slice';
import { ModalPago } from './componentes/pago/ModalPago';
import { EstadoTransaccion } from './componentes/resultado/EstadoTransaccion';
import { ShieldCheck, CreditCard, Sparkles, Check, QrCode, Smartphone, Building2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#2C2A29] text-white flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Luces y degradados decorativos con los colores de marca Wompi */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#00825A]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-[500px] h-[500px] bg-[#B0F2AE]/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[350px] h-[350px] bg-[#DFFF61]/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Navbar Oficial Wompi */}
      <header className="border-b border-white/10 bg-[#2C2A29]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#FAFAFA] px-3 py-1.5 rounded-xl shadow-sm">
              <img
                src="/assets/svg/Wompi_LogoPrincipal.svg"
                alt="Wompi"
                className="h-5 w-auto object-contain"
              />
            </div>
            <span className="hidden sm:inline-block text-[11px] text-[#B0F2AE] font-medium border-l border-white/20 pl-3">
              Una idea de <strong className="text-white font-bold">Bancolombia</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#B0F2AE] text-[#2C2A29] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#00825A] animate-pulse"></span>
              Sandbox Activo
            </span>
          </div>
        </div>
      </header>

      {/* Contenido Principal: Tarjeta de Producto y Medios de Pago */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center relative z-10 w-full">
        
        {/* Banner de Presentación */}
        <div className="text-center mb-8 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAFAFA]/10 text-xs font-bold text-[#B0F2AE] border border-[#B0F2AE]/30 backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#DFFF61]" />
            <span>Pasarela Oficial Wompi Bancolombia</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Tienda E-Commerce
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Experimenta el flujo de pagos seguro y tokenizado con tarjeta de crédito en el ambiente Sandbox de Wompi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start w-full max-w-4xl">
          
          {/* Tarjeta de Producto E-Commerce */}
          <div className="md:col-span-7 bg-[#FAFAFA] text-[#2C2A29] rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col">
            
            {/* Imagen del Producto */}
            <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden group">
              <img
                src={producto.urlImagen}
                alt={producto.nombre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              
              <div className="absolute top-4 right-4 bg-[#2C2A29]/90 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-[#B0F2AE] border border-[#B0F2AE]/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#B0F2AE]"></span>
                {producto.unidadesDisponibles} disponibles
              </div>
            </div>

            {/* Información del Producto */}
            <div className="p-6 sm:p-7 space-y-5">
              <div>
                <span className="text-[11px] font-bold text-[#00825A] bg-[#B0F2AE]/40 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Moda y Accesorios
                </span>
                <h2 className="text-2xl font-black text-[#2C2A29] mt-2">{producto.nombre}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{producto.descripcion}</p>
              </div>

              {/* Características rápidas */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-1.5 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                  <Check className="w-3.5 h-3.5 text-[#00825A]" />
                  <span>Envío asegurado</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00825A]" />
                  <span>Garantía 1 año</span>
                </div>
              </div>

              {/* Precio y Botón Oficial Wompi */}
              <div className="pt-3 border-t border-slate-200 space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium">Precio del producto:</span>
                    <div className="text-3xl font-black text-[#2C2A29]">
                      ${(producto.precioEnCentavos / 100).toLocaleString('es-CO')}
                      <span className="text-xs font-bold text-slate-500 ml-1.5">COP</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#00825A] font-bold bg-[#B0F2AE]/30 px-2.5 py-1 rounded-lg border border-[#B0F2AE]/50">
                    + Tarifa y Envío
                  </span>
                </div>

                {/* BOTÓN OFICIAL DE PAGO WOMPI */}
                <button
                  onClick={abrirModalPago}
                  disabled={producto.unidadesDisponibles <= 0}
                  className="w-full py-4 px-6 rounded-full bg-[#B0F2AE] hover:bg-[#DFFF61] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-[#2C2A29] font-black text-base transition-all shadow-xl shadow-[#B0F2AE]/30 flex items-center justify-center gap-2.5 cursor-pointer border border-[#00825A]/20"
                >
                  <CreditCard className="w-5 h-5 text-[#2C2A29]" />
                  <span>{producto.unidadesDisponibles > 0 ? 'Pagar con Tarjeta de Crédito' : 'Agotado'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Columna lateral: Medios de pago soportados según la guía Wompi */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Sello Oficial Wompi Horizontal (Negativo Verde Mentol) */}
            <div className="bg-[#B0F2AE] text-[#2C2A29] p-4 rounded-2xl shadow-lg border border-[#00825A]/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#00825A]">Plataforma de pago</p>
                <img
                  src="/assets/svg/Wompi_LogoPrincipal.svg"
                  alt="Wompi"
                  className="h-6 w-auto my-1"
                />
                <p className="text-[11px] text-[#2C2A29] font-medium">
                  Una idea de <strong className="font-extrabold">Bancolombia</strong>
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-[#00825A]" />
            </div>

            {/* Opciones de pago inspiradas en la guía */}
            <div className="bg-[#FAFAFA] text-[#2C2A29] p-5 rounded-2xl shadow-xl border border-white/10 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Medios de Pago Disponibles
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="p-1.5 rounded-lg bg-[#B0F2AE]/30 text-[#00825A]">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2C2A29]">Tarjetas de Crédito y Débito</p>
                    <p className="text-[10px] text-slate-500">Visa, Mastercard, American Express</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="p-1.5 rounded-lg bg-[#99D1FC]/30 text-blue-700">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2C2A29]">QR Bancolombia</p>
                    <p className="text-[10px] text-slate-500">Paga al instante escaneando</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="p-1.5 rounded-lg bg-pink-100 text-pink-600">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2C2A29]">Nequi & DaviPlata</p>
                    <p className="text-[10px] text-slate-500">Transferencia digital directa</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2C2A29]">PSE Cuentas de Ahorro</p>
                    <p className="text-[10px] text-slate-500">Débito bancario seguro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificado PCI DSS Oficial */}
            <div className="bg-[#FAFAFA] p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/svg/LogoCertificadoPCI.svg"
                  alt="PCI DSS Compliant"
                  className="h-8 w-auto object-contain"
                />
                <div className="text-[11px] text-[#2C2A29]">
                  <p className="font-bold">Certificación PCI-DSS</p>
                  <p className="text-[10px] text-slate-500">Máxima seguridad en pagos</p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#00825A]" />
            </div>

          </div>
        </div>
      </main>

      {/* Footer Oficial Wompi */}
      <footer className="border-t border-white/10 py-6 bg-[#242221] text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-[#FAFAFA] px-2 py-0.5 rounded-md inline-flex items-center">
              <img src="/assets/svg/Wompi_LogoPrincipal.svg" alt="Wompi" className="h-3.5 w-auto" />
            </div>
            <span>• Pasarela de pagos de Colombia - Una idea de Bancolombia</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B0F2AE]" /> Cifrado 256-bit SSL
            </span>
            <span className="text-[#B0F2AE] font-semibold">PCI-DSS Nivel 1</span>
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