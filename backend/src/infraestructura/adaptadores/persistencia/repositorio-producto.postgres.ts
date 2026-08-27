import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RepositorioProductoPuerto } from '../../../dominio/puertos/repositorio-producto.puerto';
import { Producto } from '../../../dominio/modelos/producto.modelo';

@Injectable()
export class RepositorioProductoPostgres implements RepositorioProductoPuerto {
  private prisma = new PrismaClient();

  async buscarPorId(id: string): Promise<Producto | null> {
    const registro = await this.prisma.producto.findUnique({ where: { id } });
    if (!registro) return null;
    return new Producto(
      registro.id,
      registro.nombre,
      registro.descripcion,
      registro.precioEnCentavos,
      registro.unidadesDisponibles,
      registro.urlImagen
    );
  }

  async descontarStock(id: string, cantidad: number): Promise<void> {
    await this.prisma.producto.update({
      where: { id },
      data: { unidadesDisponibles: { decrement: cantidad } },
    });
  }
}