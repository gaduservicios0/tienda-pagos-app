export type EstadoTransaccion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'FALLIDA';
export declare class Transaccion {
    readonly id: string;
    readonly referencia: string;
    readonly productoId: string;
    readonly clienteId: string;
    readonly entregaId: string;
    readonly montoProductoEnCentavos: number;
    readonly tarifaBaseEnCentavos: number;
    readonly tarifaEnvioEnCentavos: number;
    readonly montoTotalEnCentavos: number;
    estado: EstadoTransaccion;
    idTransaccionPasarela?: string | null | undefined;
    mensajeRespuesta?: string | null | undefined;
    readonly creadoEn?: Date | undefined;
    readonly actualizadoEn?: Date | undefined;
    constructor(id: string, referencia: string, productoId: string, clienteId: string, entregaId: string, montoProductoEnCentavos: number, tarifaBaseEnCentavos: number, tarifaEnvioEnCentavos: number, montoTotalEnCentavos: number, estado: EstadoTransaccion, idTransaccionPasarela?: string | null | undefined, mensajeRespuesta?: string | null | undefined, creadoEn?: Date | undefined, actualizadoEn?: Date | undefined);
}
