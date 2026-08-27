import { ok, err, Result } from 'neverthrow';
import { RepositorioProductoPuerto } from '../../dominio/puertos/repositorio-producto.puerto';
import { RepositorioTransaccionPuerto } from '../../dominio/puertos/repositorio-transaccion.puerto';
import { ServicioPasarelaPagoPuerto } from '../../dominio/puertos/servicio-pasarela-pago.puerto';

export class ProcesarPagoCasoDeUso {
  constructor(
    private readonly repoProducto: RepositorioProductoPuerto,
    private readonly repoTransaccion: RepositorioTransaccionPuerto,
    private readonly servicioPasarela: ServicioPasarelaPagoPuerto,
  ) {}

  async ejecutar(comando: any): Promise<Result<any, Error>> {
    const producto = await this.repoProducto.buscarPorId(comando.productoId);
    if (!producto || producto.unidadesDisponibles <= 0) {
      return err(new Error('Producto sin existencias disponibles'));
    }

    const transaccion = await this.repoTransaccion.crearTransaccionPendiente(comando);

    const resultadoPasarela = await this.servicioPasarela.procesarPago(comando.datosPago);
    if (resultadoPasarela.isErr()) {
      await this.repoTransaccion.actualizarEstado(transaccion.id, 'FALLIDA', resultadoPasarela.error.message);
      return err(resultadoPasarela.error);
    }

    const respuesta = resultadoPasarela.value;
    await this.repoTransaccion.actualizarEstado(transaccion.id, respuesta.estado, respuesta.mensaje);

    if (respuesta.estado === 'APROBADA') {
      await this.repoProducto.descontarStock(producto.id, 1);
    }

    return ok({ transaccionId: transaccion.id, estado: respuesta.estado });
  }
}