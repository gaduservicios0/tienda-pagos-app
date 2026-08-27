export declare class TransaccionesControlador {
    private prisma;
    procesarTransaccion(cuerpo: any): Promise<{
        idTransaccion: string;
        estado: string;
        mensaje: string;
    }>;
    consultarPorId(id: string): Promise<{
        producto: {
            id: string;
            nombre: string;
            descripcion: string;
            precioEnCentavos: number;
            unidadesDisponibles: number;
            urlImagen: string;
            creadoEn: Date;
            actualizadoEn: Date;
        };
        entrega: {
            id: string;
            creadoEn: Date;
            estado: import("@prisma/client").$Enums.EstadoEntrega;
            clienteId: string;
            direccion: string;
            ciudad: string;
            departamento: string;
            codigoPostal: string | null;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        referencia: string;
        idTransaccionPasarela: string | null;
        montoProductoEnCentavos: number;
        tarifaBaseEnCentavos: number;
        tarifaEnvioEnCentavos: number;
        montoTotalEnCentavos: number;
        estado: import("@prisma/client").$Enums.EstadoTransaccion;
        mensajeRespuesta: string | null;
        productoId: string;
        clienteId: string;
        entregaId: string;
    }>;
}
