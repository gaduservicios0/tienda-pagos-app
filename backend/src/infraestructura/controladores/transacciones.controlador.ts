import { Controller, Post, Body, BadRequestException, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdaptadorPasarela } from '../adaptadores/pasarela/adaptador-pasarela';
import { PrismaClient } from '@prisma/client';

@ApiTags('Transacciones')
@Controller('transacciones')
export class TransaccionesControlador {
  private prisma = new PrismaClient();

  @Post()
  @ApiOperation({ summary: 'Crea y procesa una transacción de pago' })
  @ApiResponse({ status: 201, description: 'Transacción procesada correctamente' })
  async procesarTransaccion(@Body() cuerpo: any) {
    const { productoId, tokenAceptacion, tokenTarjeta, cuotas, cliente, entrega } = cuerpo;

    const producto = await this.prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto || producto.unidadesDisponibles <= 0) {
      throw new BadRequestException('El producto no cuenta con existencias disponibles');
    }

    // Registrar cliente o reutilizar
    let clienteDb = await this.prisma.cliente.findFirst({
      where: { correoElectronico: cliente.correoElectronico },
    });
    if (!clienteDb) {
      clienteDb = await this.prisma.cliente.create({
        data: {
          nombreCompleto: cliente.nombreCompleto,
          correoElectronico: cliente.correoElectronico,
          numeroTelefono: cliente.numeroTelefono,
          tipoDocumento: cliente.tipoDocumento || 'CC',
          numeroDocumento: cliente.numeroDocumento || '123456789',
        },
      });
    }

    // Registrar entrega
    const entregaDb = await this.prisma.entrega.create({
      data: {
        clienteId: clienteDb.id,
        direccion: entrega.direccion,
        ciudad: entrega.ciudad,
        departamento: entrega.departamento,
        codigoPostal: entrega.codigoPostal || '110111',
      },
    });

    const referencia = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tarifaBase = 500000; // $5.000 COP en centavos
    const tarifaEnvio = 1200000; // $12.000 COP en centavos
    const total = producto.precioEnCentavos + tarifaBase + tarifaEnvio;

    // Crear transacción PENDIENTE
    const transaccion = await this.prisma.transaccion.create({
      data: {
        referencia,
        productoId: producto.id,
        clienteId: clienteDb.id,
        entregaId: entregaDb.id,
        montoProductoEnCentavos: producto.precioEnCentavos,
        tarifaBaseEnCentavos: tarifaBase,
        tarifaEnvioEnCentavos: tarifaEnvio,
        montoTotalEnCentavos: total,
        estado: 'PENDIENTE',
      },
    });

    // Invocar pasarela
    const pasarela = new AdaptadorPasarela();
    const resultado = await pasarela.procesarPago({
      tokenAceptacion,
      tokenTarjeta,
      referencia,
      montoEnCentavos: total,
      moneda: 'COP',
      correoCliente: cliente.correoElectronico,
      cuotas,
      firmaIntegridad: '',
    });

    if (resultado.isErr()) {
      await this.prisma.transaccion.update({
        where: { id: transaccion.id },
        data: { estado: 'FALLIDA', mensajeRespuesta: resultado.error.message },
      });
      return { idTransaccion: transaccion.id, estado: 'FALLIDA', mensaje: resultado.error.message };
    }

    const { idTransaccion, estado, mensaje } = resultado.value;

    // Actualizar transacción y descontar stock
    await this.prisma.transaccion.update({
      where: { id: transaccion.id },
      data: { idTransaccionPasarela: idTransaccion, estado, mensajeRespuesta: mensaje },
    });

    if (estado === 'APROBADA') {
      await this.prisma.producto.update({
        where: { id: producto.id },
        data: { unidadesDisponibles: { decrement: 1 } },
      });
    }

    return { idTransaccion: transaccion.id, estado, mensaje };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consulta el estado de una transacción' })
  async consultarPorId(@Param('id') id: string) {
    const trx = await this.prisma.transaccion.findUnique({
      where: { id },
      include: { producto: true, entrega: true },
    });
    if (!trx) throw new NotFoundException('Transacción no encontrada');
    return trx;
  }
}