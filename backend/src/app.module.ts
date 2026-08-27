import { Module } from '@nestjs/common';
import { TransaccionesControlador } from './infraestructura/controladores/transacciones.controlador';
import { ProductosControlador } from './infraestructura/controladores/productos.controlador';

@Module({
  imports: [],
  controllers: [TransaccionesControlador, ProductosControlador],
  providers: [],
})
export class AppModule {}