export declare class ProductosControlador {
    private prisma;
    obtenerPorId(id: string): Promise<{
        id: string;
        nombre: string;
        descripcion: string;
        precioEnCentavos: number;
        unidadesDisponibles: number;
        urlImagen: string;
        creadoEn: Date;
        actualizadoEn: Date;
    }>;
}
