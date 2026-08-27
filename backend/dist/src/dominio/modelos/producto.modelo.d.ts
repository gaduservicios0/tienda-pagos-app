export declare class Producto {
    readonly id: string;
    readonly nombre: string;
    readonly descripcion: string;
    readonly precioEnCentavos: number;
    unidadesDisponibles: number;
    readonly urlImagen: string;
    readonly creadoEn?: Date | undefined;
    readonly actualizadoEn?: Date | undefined;
    constructor(id: string, nombre: string, descripcion: string, precioEnCentavos: number, unidadesDisponibles: number, urlImagen: string, creadoEn?: Date | undefined, actualizadoEn?: Date | undefined);
    tieneStock(): boolean;
}
