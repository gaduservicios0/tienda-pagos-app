import { RepositorioTransaccionPuerto, DatosCrearTransaccion } from '../../../dominio/puertos/repositorio-transaccion.puerto';
import { EstadoTransaccion, Transaccion } from '../../../dominio/modelos/transaccion.modelo';
export declare class RepositorioTransaccionPostgres implements RepositorioTransaccionPuerto {
    private prisma;
    crearTransaccionPendiente(datos: DatosCrearTransaccion): Promise<Transaccion>;
    actualizarEstado(id: string, estado: EstadoTransaccion, mensajeRespuesta?: string, idTransaccionPasarela?: string): Promise<void>;
    buscarPorId(id: string): Promise<Transaccion | null>;
    buscarPorReferencia(referencia: string): Promise<Transaccion | null>;
}
