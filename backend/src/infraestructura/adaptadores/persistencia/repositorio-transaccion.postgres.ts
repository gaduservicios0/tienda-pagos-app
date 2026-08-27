import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RepositorioTransaccionPuerto, DatosCrearTransaccion } from '../../../dominio/puertos/repositorio-transaccion.puerto';
import { EstadoTransaccion, Transaccion } from '../../../dominio/modelos/transaccion.modelo';

@Injectable()
export class RepositorioTransaccionPostgres implements RepositorioTransaccionPuerto {
  private prisma = new PrismaClient();

  async crearTransaccionPendiente(datos: DatosCrearTransaccion): Promise<Transaccion> {
    const registro = await this.prisma.transaccion.create({
      data: {
        referencia: datos.referencia,
        productoId: datos.productoId,
        clienteId: datos.clienteId,
        entregaId: datos.entregaId,
        montoProductoEnCentavos: datos.montoProductoEnCentavos,
        tarifaBaseEnCentavos: datos.tarifaBaseEnCentavos,
        tarifaEnvioEnCentavos: datos.tarifaEnvioEnCentavos,
        montoTotalEnCentavos: datos.montoTotalEnCentavos,
        estado: 'PENDIENTE',
      },
    });

    return new Transaccion(
      registro.id,
      registro.referencia,
      registro.productoId,
      registro.clienteId,
      registro.entregaId,
      registro.montoProductoEnCentavos,
      registro.tarifaBaseEnCentavos,
      registro.tarifaEnvioEnCentavos,
      registro.montoTotalEnCentavos,
      registro.estado as EstadoTransaccion,
      registro.idTransaccionPasarela,
      registro.mensajeRespuesta,
      registro.creadoEn,
      registro.actualizadoEn,
    );
  }

  async actualizarEstado(
    id: string,
    estado: EstadoTransaccion,
    mensajeRespuesta?: string,
    idTransaccionPasarela?: string,
  ): Promise<void> {
    await this.prisma.transaccion.update({
      where: { id },
      data: {
        estado,
        mensajeRespuesta,
        idTransaccionPasarela,
      },
    });
  }

  async buscarPorId(id: string): Promise<Transaccion | null> {
    const registro = await this.prisma.transaccion.findUnique({ where: { id } });
    if (!registro) return null;

    return new Transaccion(
      registro.id,
      registro.referencia,
      registro.productoId,
      registro.clienteId,
      registro.entregaId,
      registro.montoProductoEnCentavos,
      registro.tarifaBaseEnCentavos,
      registro.tarifaEnvioEnCentavos,
      registro.montoTotalEnCentavos,
      registro.estado as EstadoTransaccion,
      registro.idTransaccionPasarela,
      registro.mensajeRespuesta,
      registro.creadoEn,
      registro.actualizadoEn,
    );
  }

  async buscarPorReferencia(referencia: string): Promise<Transaccion | null> {
    const registro = await this.prisma.transaccion.findUnique({ where: { referencia } });
    if (!registro) return null;

    return new Transaccion(
      registro.id,
      registro.referencia,
      registro.productoId,
      registro.clienteId,
      registro.entregaId,
      registro.montoProductoEnCentavos,
      registro.tarifaBaseEnCentavos,
      registro.tarifaEnvioEnCentavos,
      registro.montoTotalEnCentavos,
      registro.estado as EstadoTransaccion,
      registro.idTransaccionPasarela,
      registro.mensajeRespuesta,
      registro.creadoEn,
      registro.actualizadoEn,
    );
  }
}