import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';

@ApiTags('Productos')
@Controller('productos')
export class ProductosControlador {
  private prisma = new PrismaClient();

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene el detalle y stock de un producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async obtenerPorId(@Param('id') id: string) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
    });

    if (!producto) {
      throw new NotFoundException('El producto solicitado no existe');
    }

    return producto;
  }
}