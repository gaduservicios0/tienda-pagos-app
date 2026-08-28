"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransaccionesControlador = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const adaptador_pasarela_1 = require("../adaptadores/pasarela/adaptador-pasarela");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let TransaccionesControlador = class TransaccionesControlador {
    prisma = new client_1.PrismaClient();
    async procesarTransaccion(cuerpo) {
        const { productoId, tokenAceptacion, tokenTarjeta, cuotas, cliente, entrega } = cuerpo;
        const producto = await this.prisma.producto.findUnique({ where: { id: productoId } });
        if (!producto || producto.unidadesDisponibles <= 0) {
            throw new common_1.BadRequestException('El producto no cuenta con existencias disponibles');
        }
        let clienteDb = await this.prisma.cliente.findFirst({
            where: { correoElectronico: cliente.correoElectronico },
        });
        if (!clienteDb) {
            clienteDb = await this.prisma.cliente.create({
                data: {
                    nombreCompleto: cliente.nombreCompleto,
                    correoElectronico: cliente.correoElectronico,
                    numeroTelefono: cliente.numeroTelefono,
                    tipoDocumento: cliente.tipoDocumento || 'CC',
                    numeroDocumento: cliente.numeroDocumento || '123456789',
                },
            });
        }
        const entregaDb = await this.prisma.entrega.create({
            data: {
                clienteId: clienteDb.id,
                direccion: entrega.direccion,
                ciudad: entrega.ciudad,
                departamento: entrega.departamento,
                codigoPostal: entrega.codigoPostal || '110111',
            },
        });
        const referencia = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const tarifaBase = 500000;
        const tarifaEnvio = 1200000;
        const total = producto.precioEnCentavos + tarifaBase + tarifaEnvio;
        const transaccion = await this.prisma.transaccion.create({
            data: {
                referencia,
                productoId: producto.id,
                clienteId: clienteDb.id,
                entregaId: entregaDb.id,
                montoProductoEnCentavos: producto.precioEnCentavos,
                tarifaBaseEnCentavos: tarifaBase,
                tarifaEnvioEnCentavos: tarifaEnvio,
                montoTotalEnCentavos: total,
                estado: 'PENDIENTE',
            },
        });
        const integritySecret = process.env.WOMPI_INTEGRITY_KEY || 'stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp';
        const cadenaFirma = `${referencia}${total}COP${integritySecret}`;
        const firmaIntegridad = crypto.createHash('sha256').update(cadenaFirma).digest('hex');
        const pasarela = new adaptador_pasarela_1.AdaptadorPasarela();
        const resultado = await pasarela.procesarPago({
            tokenAceptacion,
            tokenTarjeta,
            referencia,
            montoEnCentavos: total,
            moneda: 'COP',
            correoCliente: cliente.correoElectronico,
            cuotas: Number(cuotas) || 1,
            firmaIntegridad,
        });
        if (resultado.isErr()) {
            await this.prisma.transaccion.update({
                where: { id: transaccion.id },
                data: { estado: 'FALLIDA', mensajeRespuesta: resultado.error.message },
            });
            return { idTransaccion: transaccion.id, estado: 'FALLIDA', mensaje: resultado.error.message };
        }
        const { idTransaccion, estado, mensaje } = resultado.value;
        const estadoFinal = (String(estado) === 'APPROVED' || estado === 'APROBADA')
            ? 'APROBADA'
            : estado;
        await this.prisma.transaccion.update({
            where: { id: transaccion.id },
            data: { idTransaccionPasarela: idTransaccion, estado: estadoFinal, mensajeRespuesta: mensaje },
        });
        if (estadoFinal === 'APROBADA') {
            await this.prisma.producto.update({
                where: { id: producto.id },
                data: { unidadesDisponibles: { decrement: 1 } },
            });
        }
        return { idTransaccion: transaccion.id, estado: estadoFinal, mensaje };
    }
    async consultarPorId(id) {
        const trx = await this.prisma.transaccion.findUnique({
            where: { id },
            include: { producto: true, entrega: true },
        });
        if (!trx)
            throw new common_1.NotFoundException('Transacción no encontrada');
        return trx;
    }
};
exports.TransaccionesControlador = TransaccionesControlador;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crea y procesa una transacción de pago' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transacción procesada correctamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransaccionesControlador.prototype, "procesarTransaccion", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Consulta el estado de una transacción' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransaccionesControlador.prototype, "consultarPorId", null);
exports.TransaccionesControlador = TransaccionesControlador = __decorate([
    (0, swagger_1.ApiTags)('Transacciones'),
    (0, common_1.Controller)('transacciones')
], TransaccionesControlador);
//# sourceMappingURL=transacciones.controlador.js.map