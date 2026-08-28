import { Test, TestingModule } from '@nestjs/testing';
import { ProductosControlador } from './productos.controlador';
import { NotFoundException } from '@nestjs/common';

describe('ProductosControlador', () => {
  let controlador: ProductosControlador;
  const mockPrisma = {
    producto: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const modulo: TestingModule = await Test.createTestingModule({
      controllers: [ProductosControlador],
    }).compile();

    controlador = modulo.get<ProductosControlador>(ProductosControlador);
    (controlador as any).prisma = mockPrisma;
  });

  it('debe retornar el producto si existe', async () => {
    const mockProducto = {
      id: 'prod-001',
      nombre: 'Chaqueta Impermeable',
      precioEnCentavos: 15000000,
      unidadesDisponibles: 10,
    };
    mockPrisma.producto.findUnique.mockResolvedValue(mockProducto);

    const resultado = await controlador.obtenerPorId('prod-001');
    expect(resultado).toEqual(mockProducto);
    expect(mockPrisma.producto.findUnique).toHaveBeenCalledWith({ where: { id: 'prod-001' } });
  });

  it('debe lanzar NotFoundException si el producto no existe', async () => {
    mockPrisma.producto.findUnique.mockResolvedValue(null);

    await expect(controlador.obtenerPorId('inexistente')).rejects.toThrow(NotFoundException);
  });
});

