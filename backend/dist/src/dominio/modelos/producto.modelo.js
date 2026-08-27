"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Producto = void 0;
class Producto {
    id;
    nombre;
    descripcion;
    precioEnCentavos;
    unidadesDisponibles;
    urlImagen;
    creadoEn;
    actualizadoEn;
    constructor(id, nombre, descripcion, precioEnCentavos, unidadesDisponibles, urlImagen, creadoEn, actualizadoEn) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precioEnCentavos = precioEnCentavos;
        this.unidadesDisponibles = unidadesDisponibles;
        this.urlImagen = urlImagen;
        this.creadoEn = creadoEn;
        this.actualizadoEn = actualizadoEn;
    }
    tieneStock() {
        return this.unidadesDisponibles > 0;
    }
}
exports.Producto = Producto;
//# sourceMappingURL=producto.modelo.js.map