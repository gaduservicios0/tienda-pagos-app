import { RepositorioProductoPuerto } from '../../../dominio/puertos/repositorio-producto.puerto';
import { Producto } from '../../../dominio/modelos/producto.modelo';
export declare class RepositorioProductoPostgres implements RepositorioProductoPuerto {
    private prisma;
    buscarPorId(id: string): Promise<Producto | null>;
    descontarStock(id: string, cantidad: number): Promise<void>;
}
