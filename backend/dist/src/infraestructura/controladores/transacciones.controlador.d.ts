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
            direccion: string;
            ciudad: string;
            departamento: string;
            codigoPostal: string | null;
            estado: import("@prisma/client").$Enums.EstadoEntrega;
            clienteId: string;
        };
    } & {
        id: string;
        creadoEn: Date;
        actualizadoEn: Date;
        productoId: string;
        estado: import("@prisma/client").$Enums.EstadoTransaccion;
        clienteId: string;
        referencia: string;
        idTransaccionPasarela: string | null;
        montoProductoEnCentavos: number;
        tarifaBaseEnCentavos: number;
        tarifaEnvioEnCentavos: number;
        montoTotalEnCentavos: number;
        mensajeRespuesta: string | null;
        entregaId: string;
    }>;
}
