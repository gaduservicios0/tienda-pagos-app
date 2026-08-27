"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositorioProductoPostgres = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const producto_modelo_1 = require("../../../dominio/modelos/producto.modelo");
let RepositorioProductoPostgres = class RepositorioProductoPostgres {
    prisma = new client_1.PrismaClient();
    async buscarPorId(id) {
        const registro = await this.prisma.producto.findUnique({ where: { id } });
        if (!registro)
            return null;
        return new producto_modelo_1.Producto(registro.id, registro.nombre, registro.descripcion, registro.precioEnCentavos, registro.unidadesDisponibles, registro.urlImagen);
    }
    async descontarStock(id, cantidad) {
        await this.prisma.producto.update({
            where: { id },
            data: { unidadesDisponibles: { decrement: cantidad } },
        });
    }
};
exports.RepositorioProductoPostgres = RepositorioProductoPostgres;
exports.RepositorioProductoPostgres = RepositorioProductoPostgres = __decorate([
    (0, common_1.Injectable)()
], RepositorioProductoPostgres);
//# sourceMappingURL=repositorio-producto.postgres.js.map