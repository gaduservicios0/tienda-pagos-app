import { EstadoTransaccion, Transaccion } from '../modelos/transaccion.modelo';
export interface DatosCrearTransaccion {
    referencia: string;
    productoId: string;
    clienteId: string;
    entregaId: string;
    montoProductoEnCentavos: number;
    tarifaBaseEnCentavos: number;
    tarifaEnvioEnCentavos: number;
    montoTotalEnCentavos: number;
}
export interface RepositorioTransaccionPuerto {
    crearTransaccionPendiente(datos: DatosCrearTransaccion): Promise<Transaccion>;
    actualizarEstado(id: string, estado: EstadoTransaccion, mensajeRespuesta?: string, idTransaccionPasarela?: string): Promise<void>;
    buscarPorId(id: string): Promise<Transaccion | null>;
    buscarPorReferencia(referencia: string): Promise<Transaccion | null>;
}
