import { Result } from 'neverthrow';
import { ServicioPasarelaPagoPuerto, ParametrosTransaccionPasarela, RespuestaPasarela } from '../../../dominio/puertos/servicio-pasarela-pago.puerto';
export declare class AdaptadorPasarela implements ServicioPasarelaPagoPuerto {
    private readonly baseUrl;
    private readonly llavePrivada;
    private readonly secretoIntegridad;
    private generarFirmaIntegridad;
    procesarPago(datos: ParametrosTransaccionPasarela): Promise<Result<RespuestaPasarela, Error>>;
}
