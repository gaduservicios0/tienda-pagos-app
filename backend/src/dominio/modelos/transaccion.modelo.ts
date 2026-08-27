export type EstadoTransaccion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'FALLIDA';

export class Transaccion {
  constructor(
    public readonly id: string,
    public readonly referencia: string,
    public readonly productoId: string,
    public readonly clienteId: string,
    public readonly entregaId: string,
    public readonly montoProductoEnCentavos: number,
    public readonly tarifaBaseEnCentavos: number,
    public readonly tarifaEnvioEnCentavos: number,
    public readonly montoTotalEnCentavos: number,
    public estado: EstadoTransaccion,
    public idTransaccionPasarela?: string | null,
    public mensajeRespuesta?: string | null,
    public readonly creadoEn?: Date,
    public readonly actualizadoEn?: Date,
  ) {}
}