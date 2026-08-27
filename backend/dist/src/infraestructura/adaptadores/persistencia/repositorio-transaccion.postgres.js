"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioTransaccionPostgres = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const transaccion_modelo_1 = require("../../../dominio/modelos/transaccion.modelo");
let RepositorioTransaccionPostgres = class RepositorioTransaccionPostgres {
    prisma = new client_1.PrismaClient();
    async crearTransaccionPendiente(datos) {
        const registro = await this.prisma.transaccion.create({
            data: {
                referencia: datos.referencia,
                productoId: datos.productoId,
                clienteId: datos.clienteId,
                entregaId: datos.entregaId,
                montoProductoEnCentavos: datos.montoProductoEnCentavos,
                tarifaBaseEnCentavos: datos.tarifaBaseEnCentavos,
                tarifaEnvioEnCentavos: datos.tarifaEnvioEnCentavos,
                montoTotalEnCentavos: datos.montoTotalEnCentavos,
                estado: 'PENDIENTE',
            },
        });
        return new transaccion_modelo_1.Transaccion(registro.id, registro.referencia, registro.productoId, registro.clienteId, registro.entregaId, registro.montoProductoEnCentavos, registro.tarifaBaseEnCentavos, registro.tarifaEnvioEnCentavos, registro.montoTotalEnCentavos, registro.estado, registro.idTransaccionPasarela, registro.mensajeRespuesta, registro.creadoEn, registro.actualizadoEn);
    }
    async actualizarEstado(id, estado, mensajeRespuesta, idTransaccionPasarela) {
        await this.prisma.transaccion.update({
            where: { id },
            data: {
                estado,
                mensajeRespuesta,
                idTransaccionPasarela,
            },
        });
    }
    async buscarPorId(id) {
        const registro = await this.prisma.transaccion.findUnique({ where: { id } });
        if (!registro)
            return null;
        return new transaccion_modelo_1.Transaccion(registro.id, registro.referencia, registro.productoId, registro.clienteId, registro.entregaId, registro.montoProductoEnCentavos, registro.tarifaBaseEnCentavos, registro.tarifaEnvioEnCentavos, registro.montoTotalEnCentavos, registro.estado, registro.idTransaccionPasarela, registro.mensajeRespuesta, registro.creadoEn, registro.actualizadoEn);
    }
    async buscarPorReferencia(referencia) {
        const registro = await this.prisma.transaccion.findUnique({ where: { referencia } });
        if (!registro)
            return null;
        return new transaccion_modelo_1.Transaccion(registro.id, registro.referencia, registro.productoId, registro.clienteId, registro.entregaId, registro.montoProductoEnCentavos, registro.tarifaBaseEnCentavos, registro.tarifaEnvioEnCentavos, registro.montoTotalEnCentavos, registro.estado, registro.idTransaccionPasarela, registro.mensajeRespuesta, registro.creadoEn, registro.actualizadoEn);
    }
};
exports.RepositorioTransaccionPostgres = RepositorioTransaccionPostgres;
exports.RepositorioTransaccionPostgres = RepositorioTransaccionPostgres = __decorate([
    (0, common_1.Injectable)()
], RepositorioTransaccionPostgres);
//# sourceMappingURL=repositorio-transaccion.postgres.js.map