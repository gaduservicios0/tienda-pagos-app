-- CreateEnum
CREATE TYPE "EstadoTransaccion" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'FALLIDA');

-- CreateEnum
CREATE TYPE "EstadoEntrega" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio_en_centavos" INTEGER NOT NULL,
    "unidades_disponibles" INTEGER NOT NULL,
    "url_imagen" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "correo_electronico" TEXT NOT NULL,
    "numero_telefono" TEXT NOT NULL,
    "tipo_documento" TEXT NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "codigo_postal" TEXT,
    "estado" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones" (
    "id" TEXT NOT NULL,
    "referencia" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "entrega_id" TEXT NOT NULL,
    "id_transaccion_pasarela" TEXT,
    "monto_producto_en_centavos" INTEGER NOT NULL,
    "tarifa_base_en_centavos" INTEGER NOT NULL,
    "tarifa_envio_en_centavos" INTEGER NOT NULL,
    "monto_total_en_centavos" INTEGER NOT NULL,
    "estado" "EstadoTransaccion" NOT NULL DEFAULT 'PENDIENTE',
    "mensaje_respuesta" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transacciones_referencia_key" ON "transacciones"("referencia");

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacciones" ADD CONSTRAINT "transacciones_entrega_id_fkey" FOREIGN KEY ("entrega_id") REFERENCES "entregas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
