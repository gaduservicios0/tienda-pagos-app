import { Producto } from '../modelos/producto.modelo';

export interface RepositorioProductoPuerto {
  buscarPorId(id: string): Promise<Producto | null>;
  descontarStock(id: string, cantidad: number): Promise<void>;
}