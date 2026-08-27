import { Result } from 'neverthrow';
export interface ParametrosTransaccionPasarela {
    tokenAceptacion: string;
    tokenTarjeta: string;
    referencia: string;
    montoEnCentavos: number;
    moneda: string;
    correoCliente: string;
    cuotas: number;
    firmaIntegridad: string;
}
export interface RespuestaPasarela {
    idTransaccion: string;
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'FALLIDA';
    mensaje: string;
}
export interface ServicioPasarelaPagoPuerto {
    procesarPago(datos: ParametrosTransaccionPasarela): Promise<Result<RespuestaPasarela, Error>>;
}
