import { Result } from 'neverthrow';
import { RepositorioProductoPuerto } from '../../dominio/puertos/repositorio-producto.puerto';
import { RepositorioTransaccionPuerto } from '../../dominio/puertos/repositorio-transaccion.puerto';
import { ServicioPasarelaPagoPuerto } from '../../dominio/puertos/servicio-pasarela-pago.puerto';
export declare class ProcesarPagoCasoDeUso {
    private readonly repoProducto;
    private readonly repoTransaccion;
    private readonly servicioPasarela;
    constructor(repoProducto: RepositorioProductoPuerto, repoTransaccion: RepositorioTransaccionPuerto, servicioPasarela: ServicioPasarelaPagoPuerto);
    ejecutar(comando: any): Promise<Result<any, Error>>;
}
