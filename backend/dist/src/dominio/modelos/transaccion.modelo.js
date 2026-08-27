"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaccion = void 0;
class Transaccion {
    id;
    referencia;
    productoId;
    clienteId;
    entregaId;
    montoProductoEnCentavos;
    tarifaBaseEnCentavos;
    tarifaEnvioEnCentavos;
    montoTotalEnCentavos;
    estado;
    idTransaccionPasarela;
    mensajeRespuesta;
    creadoEn;
    actualizadoEn;
    constructor(id, referencia, productoId, clienteId, entregaId, montoProductoEnCentavos, tarifaBaseEnCentavos, tarifaEnvioEnCentavos, montoTotalEnCentavos, estado, idTransaccionPasarela, mensajeRespuesta, creadoEn, actualizadoEn) {
        this.id = id;
        this.referencia = referencia;
        this.productoId = productoId;
        this.clienteId = clienteId;
        this.entregaId = entregaId;
        this.montoProductoEnCentavos = montoProductoEnCentavos;
        this.tarifaBaseEnCentavos = tarifaBaseEnCentavos;
        this.tarifaEnvioEnCentavos = tarifaEnvioEnCentavos;
        this.montoTotalEnCentavos = montoTotalEnCentavos;
        this.estado = estado;
        this.idTransaccionPasarela = idTransaccionPasarela;
        this.mensajeRespuesta = mensajeRespuesta;
        this.creadoEn = creadoEn;
        this.actualizadoEn = actualizadoEn;
    }
}
exports.Transaccion = Transaccion;
//# sourceMappingURL=transaccion.modelo.js.map