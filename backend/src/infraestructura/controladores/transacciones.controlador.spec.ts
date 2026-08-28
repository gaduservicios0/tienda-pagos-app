import { Test, TestingModule } from '@nestjs/testing';
import { TransaccionesControlador } from './transacciones.controlador';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdaptadorPasarela } from '../adaptadores/pasarela/adaptador-pasarela';
import { ok, err } from 'neverthrow';

jest.mock('../adaptadores/pasarela/adaptador-pasarela');

describe('TransaccionesControlador', () => {
  let controlador: TransaccionesControlador;
  const mockPrisma = {
    producto: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cliente: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    entrega: {
      create: jest.fn(),
    },
    transaccion: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const modulo: TestingModule = await Test.createTestingModule({
      controllers: [TransaccionesControlador],
    }).compile();

    controlador = modulo.get<TransaccionesControlador>(TransaccionesControlador);
    (controlador as any).prisma = mockPrisma;
  });

  it('debe lanzar BadRequestException si el producto no tiene existencias o no existe', async () => {
    mockPrisma.producto.findUnique.mockResolvedValue(null);

    await expect(
      controlador.procesarTransaccion({ productoId: 'p1', cliente: {}, entrega: {} }),
    ).rejects.toThrow(BadRequestException);
  });

  it('debe procesar exitosamente la transaccion y descontar stock cuando la pasarela aprueba (con cliente existente)', async () => {
    mockPrisma.producto.findUnique.mockResolvedValue({
      id: 'p1',
      precioEnCentavos: 15000000,
      unidadesDisponibles: 5,
    });
    mockPrisma.cliente.findFirst.mockResolvedValue({ id: 'c1', correoElectronico: 'test@correo.com' });
    mockPrisma.entrega.create.mockResolvedValue({ id: 'e1' });
    mockPrisma.transaccion.create.mockResolvedValue({ id: 't1' });
    mockPrisma.transaccion.update.mockResolvedValue({ id: 't1', estado: 'APROBADA' });
    mockPrisma.producto.update.mockResolvedValue({ id: 'p1', unidadesDisponibles: 4 });

    (AdaptadorPasarela.prototype.procesarPago as jest.Mock).mockResolvedValue(
      ok({
        idTransaccion: 'wompi-123',
        estado: 'APROBADA',
        mensaje: 'Aprobada',
      }),
    );

    const res = await controlador.procesarTransaccion({
      productoId: 'p1',
      tokenAceptacion: 'tok-acc',
      tokenTarjeta: 'tok-card',
      cuotas: 2,
      cliente: {
        nombreCompleto: 'Prueba',
        correoElectronico: 'test@correo.com',
        numeroTelefono: '3001234567',
        tipoDocumento: 'NIT',
        numeroDocumento: '900123456',
      },
      entrega: {
        direccion: 'Calle 123',
        ciudad: 'Bogota',
        departamento: 'Cundinamarca',
        codigoPostal: '110221',
      },
    });

    expect(res.estado).toBe('APROBADA');
    expect(mockPrisma.producto.update).toHaveBeenCalled();
  });

  it('debe crear nuevo cliente si no existe con valores por defecto', async () => {
    mockPrisma.producto.findUnique.mockResolvedValue({
      id: 'p1',
      precioEnCentavos: 15000000,
      unidadesDisponibles: 5,
    });
    mockPrisma.cliente.findFirst.mockResolvedValue(null);
    mockPrisma.cliente.create.mockResolvedValue({ id: 'c2' });
    mockPrisma.entrega.create.mockResolvedValue({ id: 'e2' });
    mockPrisma.transaccion.create.mockResolvedValue({ id: 't2' });
    mockPrisma.transaccion.update.mockResolvedValue({ id: 't2', estado: 'RECHAZADA' });

    (AdaptadorPasarela.prototype.procesarPago as jest.Mock).mockResolvedValue(
      ok({
        idTransaccion: 'wompi-456',
        estado: 'RECHAZADA',
        mensaje: 'Fondos insuficientes',
      }),
    );

    const res = await controlador.procesarTransaccion({
      productoId: 'p1',
      tokenAceptacion: 'tok-acc',
      tokenTarjeta: 'tok-card',
      cliente: {
        nombreCompleto: 'Cliente Sin Docs',
        correoElectronico: 'nuevo@correo.com',
      },
      entrega: {
        direccion: 'Calle 456',
        ciudad: 'Medellin',
        departamento: 'Antioquia',
      },
    });

    expect(res.estado).toBe('RECHAZADA');
    expect(mockPrisma.producto.update).not.toHaveBeenCalled();
  });

  it('debe registrar la transaccion como FALLIDA si la pasarela retorna error', async () => {
    mockPrisma.producto.findUnique.mockResolvedValue({
      id: 'p1',
      precioEnCentavos: 15000000,
      unidadesDisponibles: 5,
    });
    mockPrisma.cliente.findFirst.mockResolvedValue({ id: 'c1', correoElectronico: 'test@correo.com' });
    mockPrisma.entrega.create.mockResolvedValue({ id: 'e1' });
    mockPrisma.transaccion.create.mockResolvedValue({ id: 't1' });

    (AdaptadorPasarela.prototype.procesarPago as jest.Mock).mockResolvedValue(
      err(new Error('Error de pasarela')),
    );

    const res = await controlador.procesarTransaccion({
      productoId: 'p1',
      tokenAceptacion: 'tok-acc',
      tokenTarjeta: 'tok-card',
      cliente: { correoElectronico: 'test@correo.com' },
      entrega: { direccion: 'Calle 123' },
    });

    expect(res.estado).toBe('FALLIDA');
    expect(mockPrisma.transaccion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ estado: 'FALLIDA' }),
      }),
    );
  });

  it('debe consultar una transaccion por id existente', async () => {
    const mockTrx = { id: 't1', referencia: 'REF-123' };
    mockPrisma.transaccion.findUnique.mockResolvedValue(mockTrx);

    const res = await controlador.consultarPorId('t1');
    expect(res).toEqual(mockTrx);
  });

  it('debe lanzar NotFoundException al consultar una transaccion inexistente', async () => {
    mockPrisma.transaccion.findUnique.mockResolvedValue(null);

    await expect(controlador.consultarPorId('t-no-existe')).rejects.toThrow(NotFoundException);
  });
});

