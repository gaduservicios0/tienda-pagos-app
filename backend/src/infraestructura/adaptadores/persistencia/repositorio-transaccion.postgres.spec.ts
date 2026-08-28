import { RepositorioTransaccionPostgres } from './repositorio-transaccion.postgres';

describe('RepositorioTransaccionPostgres', () => {
  let repo: RepositorioTransaccionPostgres;
  const mockPrisma = {
    transaccion: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new RepositorioTransaccionPostgres();
    (repo as any).prisma = mockPrisma;
  });

  it('debe crear una transaccion pendiente y retornar modelo de dominio', async () => {
    mockPrisma.transaccion.create.mockResolvedValue({
      id: 't-1',
      referencia: 'REF-1',
      productoId: 'p-1',
      clienteId: 'c-1',
      entregaId: 'e-1',
      montoProductoEnCentavos: 10000,
      tarifaBaseEnCentavos: 1000,
      tarifaEnvioEnCentavos: 2000,
      montoTotalEnCentavos: 13000,
      estado: 'PENDIENTE',
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    });

    const resultado = await repo.crearTransaccionPendiente({
      referencia: 'REF-1',
      productoId: 'p-1',
      clienteId: 'c-1',
      entregaId: 'e-1',
      montoProductoEnCentavos: 10000,
      tarifaBaseEnCentavos: 1000,
      tarifaEnvioEnCentavos: 2000,
      montoTotalEnCentavos: 13000,
    });

    expect(resultado.id).toBe('t-1');
    expect(resultado.estado).toBe('PENDIENTE');
  });

  it('debe actualizar estado de una transaccion', async () => {
    mockPrisma.transaccion.update.mockResolvedValue({});
    await repo.actualizarEstado('t-1', 'APROBADA', 'Ok', 'wompi-1');
    expect(mockPrisma.transaccion.update).toHaveBeenCalledWith({
      where: { id: 't-1' },
      data: {
        estado: 'APROBADA',
        mensajeRespuesta: 'Ok',
        idTransaccionPasarela: 'wompi-1',
      },
    });
  });

  it('debe buscar una transaccion por id', async () => {
    mockPrisma.transaccion.findUnique.mockResolvedValue({
      id: 't-1',
      referencia: 'REF-1',
      estado: 'APROBADA',
    });

    const resultado = await repo.buscarPorId('t-1');
    expect(resultado?.id).toBe('t-1');
  });

  it('debe retornar null si la transaccion por id no existe', async () => {
    mockPrisma.transaccion.findUnique.mockResolvedValue(null);
    const resultado = await repo.buscarPorId('inexistente');
    expect(resultado).toBeNull();
  });

  it('debe buscar una transaccion por referencia', async () => {
    mockPrisma.transaccion.findUnique.mockResolvedValue({
      id: 't-1',
      referencia: 'REF-1',
      estado: 'APROBADA',
    });

    const resultado = await repo.buscarPorReferencia('REF-1');
    expect(resultado?.referencia).toBe('REF-1');
  });

  it('debe retornar null si la referencia no existe', async () => {
    mockPrisma.transaccion.findUnique.mockResolvedValue(null);
    const resultado = await repo.buscarPorReferencia('REF-NO');
    expect(resultado).toBeNull();
  });
});

