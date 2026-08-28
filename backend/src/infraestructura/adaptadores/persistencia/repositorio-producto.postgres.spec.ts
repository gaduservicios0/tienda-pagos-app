import { RepositorioProductoPostgres } from './repositorio-producto.postgres';

describe('RepositorioProductoPostgres', () => {
  let repo: RepositorioProductoPostgres;
  const mockPrisma = {
    producto: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new RepositorioProductoPostgres();
    (repo as any).prisma = mockPrisma;
  });

  it('debe mapear el producto encontrado a la entidad de dominio', async () => {
    mockPrisma.producto.findUnique.mockResolvedValue({
      id: 'p1',
      nombre: 'Prod 1',
      descripcion: 'Desc',
      precioEnCentavos: 5000,
      unidadesDisponibles: 10,
      urlImagen: 'url',
    });

    const resultado = await repo.buscarPorId('p1');
    expect(resultado).not.toBeNull();
    expect(resultado?.nombre).toBe('Prod 1');
  });

  it('debe retornar null si el producto no existe', async () => {
    mockPrisma.producto.findUnique.mockResolvedValue(null);
    const resultado = await repo.buscarPorId('inexistente');
    expect(resultado).toBeNull();
  });

  it('debe descontar stock llamando a prisma update', async () => {
    mockPrisma.producto.update.mockResolvedValue({});
    await repo.descontarStock('p1', 2);
    expect(mockPrisma.producto.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { unidadesDisponibles: { decrement: 2 } },
    });
  });
});

