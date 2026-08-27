"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcesarPagoCasoDeUso = void 0;
const neverthrow_1 = require("neverthrow");
class ProcesarPagoCasoDeUso {
    repoProducto;
    repoTransaccion;
    servicioPasarela;
    constructor(repoProducto, repoTransaccion, servicioPasarela) {
        this.repoProducto = repoProducto;
        this.repoTransaccion = repoTransaccion;
        this.servicioPasarela = servicioPasarela;
    }
    async ejecutar(comando) {
        const producto = await this.repoProducto.buscarPorId(comando.productoId);
        if (!producto || producto.unidadesDisponibles <= 0) {
            return (0, neverthrow_1.err)(new Error('Producto sin existencias disponibles'));
        }
        const transaccion = await this.repoTransaccion.crearTransaccionPendiente(comando);
        const resultadoPasarela = await this.servicioPasarela.procesarPago(comando.datosPago);
        if (resultadoPasarela.isErr()) {
            await this.repoTransaccion.actualizarEstado(transaccion.id, 'FALLIDA', resultadoPasarela.error.message);
            return (0, neverthrow_1.err)(resultadoPasarela.error);
        }
        const respuesta = resultadoPasarela.value;
        await this.repoTransaccion.actualizarEstado(transaccion.id, respuesta.estado, respuesta.mensaje);
        if (respuesta.estado === 'APROBADA') {
            await this.repoProducto.descontarStock(producto.id, 1);
        }
        return (0, neverthrow_1.ok)({ transaccionId: transaccion.id, estado: respuesta.estado });
    }
}
exports.ProcesarPagoCasoDeUso = ProcesarPagoCasoDeUso;
//# sourceMappingURL=procesar-pago.caso-de-uso.js.map