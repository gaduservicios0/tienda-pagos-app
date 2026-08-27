import { ProcesarPagoCasoDeUso } from './procesar-pago.caso-de-uso';
import { RepositorioProductoPuerto } from '../../dominio/puertos/repositorio-producto.puerto';
import { RepositorioTransaccionPuerto } from '../../dominio/puertos/repositorio-transaccion.puerto';
import { ServicioPasarelaPagoPuerto } from '../../dominio/puertos/servicio-pasarela-pago.puerto';
import { Producto } from '../../dominio/modelos/producto.modelo';
import { Transaccion } from '../../dominio/modelos/transaccion.modelo';
import { ok, err } from 'neverthrow';

describe('ProcesarPagoCasoDeUso', () => {
  let casoDeUso: ProcesarPagoCasoDeUso;
  let mockRepoProducto: jest.Mocked<RepositorioProductoPuerto>;
  let mockRepoTransaccion: jest.Mocked<RepositorioTransaccionPuerto>;
  let mockServicioPasarela: jest.Mocked<ServicioPasarelaPagoPuerto>;

  const comandoBase = {
    productoId: 'prod-001',
    datosPago: {
      tokenAceptacion: 'token-aceptacion',
      tokenTarjeta: 'tok_card_123',
      referencia: 'REF-12345',
      montoEnCentavos: 16700000,
      moneda: 'COP',
      correoCliente: 'cliente@ejemplo.com',
      cuotas: 1,
      firmaIntegridad: 'firma-sha256',
    },
    referencia: 'REF-12345',
    clienteId: 'cli-001',
    entregaId: 'ent-001',
    montoProductoEnCentavos: 15000000,
    tarifaBaseEnCentavos: 500000,
    tarifaEnvioEnCentavos: 1200000,
    montoTotalEnCentavos: 16700000,
  };

  beforeEach(() => {
    mockRepoProducto = {
      buscarPorId: jest.fn(),
      descontarStock: jest.fn(),
    };

    mockRepoTransaccion = {
      crearTransaccionPendiente: jest.fn(),
      actualizarEstado: jest.fn(),
      buscarPorId: jest.fn(),
      buscarPorReferencia: jest.fn(),
    };

    mockServicioPasarela = {
      procesarPago: jest.fn(),
    };

    casoDeUso = new ProcesarPagoCasoDeUso(
      mockRepoProducto,
      mockRepoTransaccion,
      mockServicioPasarela,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe retornar error si el producto no existe en la base de datos', async () => {
    mockRepoProducto.buscarPorId.mockResolvedValue(null);

    const resultado = await casoDeUso.ejecutar(comandoBase);

    expect(resultado.isErr()).toBe(true);
    expect(resultado._unsafeUnwrapErr().message).toBe('Producto sin existencias disponibles');
    expect(mockRepoTransaccion.crearTransaccionPendiente).not.toHaveBeenCalled();
    expect(mockServicioPasarela.procesarPago).not.toHaveBeenCalled();
  });

  it('debe retornar error si el producto tiene 0 unidades disponibles', async () => {
    const productoSinStock = new Producto(
      'prod-001',
      'Producto Agotado',
      'Sin unidades',
      15000000,
      0,
      'https://imagen.com/foto.jpg',
    );
    mockRepoProducto.buscarPorId.mockResolvedValue(productoSinStock);

    const resultado = await casoDeUso.ejecutar(comandoBase);

    expect(resultado.isErr()).toBe(true);
    expect(resultado._unsafeUnwrapErr().message).toBe('Producto sin existencias disponibles');
    expect(mockRepoTransaccion.crearTransaccionPendiente).not.toHaveBeenCalled();
  });

  it('debe marcar la transacción como FALLIDA y retornar error si la pasarela devuelve un fallo', async () => {
    const producto = new Producto(
      'prod-001',
      'Producto Disponible',
      'Con stock',
      15000000,
      5,
      'https://imagen.com/foto.jpg',
    );
    const transaccionCreada = new Transaccion(
      'trx-999',
      'REF-12345',
      'prod-001',
      'cli-001',
      'ent-001',
      15000000,
      500000,
      1200000,
      16700000,
      'PENDIENTE',
    );

    mockRepoProducto.buscarPorId.mockResolvedValue(producto);
    mockRepoTransaccion.crearTransaccionPendiente.mockResolvedValue(transaccionCreada);
    mockServicioPasarela.procesarPago.mockResolvedValue(err(new Error('Fondos insuficientes')));

    const resultado = await casoDeUso.ejecutar(comandoBase);

    expect(resultado.isErr()).toBe(true);
    expect(resultado._unsafeUnwrapErr().message).toBe('Fondos insuficientes');
    expect(mockRepoTransaccion.actualizarEstado).toHaveBeenCalledWith(
      'trx-999',
      'FALLIDA',
      'Fondos insuficientes',
    );
    expect(mockRepoProducto.descontarStock).not.toHaveBeenCalled();
  });

  it('debe completar el flujo con éxito y descontar stock cuando la transacción es APROBADA', async () => {
    const producto = new Producto(
      'prod-001',
      'Producto Disponible',
      'Con stock',
      15000000,
      3,
      'https://imagen.com/foto.jpg',
    );
    const transaccionCreada = new Transaccion(
      'trx-100',
      'REF-12345',
      'prod-001',
      'cli-001',
      'ent-001',
      15000000,
      500000,
      1200000,
      16700000,
      'PENDIENTE',
    );

    mockRepoProducto.buscarPorId.mockResolvedValue(producto);
    mockRepoTransaccion.crearTransaccionPendiente.mockResolvedValue(transaccionCreada);
    mockServicioPasarela.procesarPago.mockResolvedValue(
      ok({
        idTransaccion: 'wompi-trx-001',
        estado: 'APROBADA',
        mensaje: 'Transacción aprobada con éxito',
      }),
    );

    const resultado = await casoDeUso.ejecutar(comandoBase);

    expect(resultado.isOk()).toBe(true);
    expect(resultado._unsafeUnwrap()).toEqual({
      transaccionId: 'trx-100',
      estado: 'APROBADA',
    });
    expect(mockRepoTransaccion.actualizarEstado).toHaveBeenCalledWith(
      'trx-100',
      'APROBADA',
      'Transacción aprobada con éxito',
    );
    expect(mockRepoProducto.descontarStock).toHaveBeenCalledWith('prod-001', 1);
  });

  it('debe actualizar el estado a RECHAZADA sin descontar stock cuando la pasarela no aprueba', async () => {
    const producto = new Producto(
      'prod-001',
      'Producto Disponible',
      'Con stock',
      15000000,
      3,
      'https://imagen.com/foto.jpg',
    );
    const transaccionCreada = new Transaccion(
      'trx-101',
      'REF-12345',
      'prod-001',
      'cli-001',
      'ent-001',
      15000000,
      500000,
      1200000,
      16700000,
      'PENDIENTE',
    );

    mockRepoProducto.buscarPorId.mockResolvedValue(producto);
    mockRepoTransaccion.crearTransaccionPendiente.mockResolvedValue(transaccionCreada);
    mockServicioPasarela.procesarPago.mockResolvedValue(
      ok({
        idTransaccion: 'wompi-trx-002',
        estado: 'RECHAZADA',
        mensaje: 'Tarjeta declinada por el banco',
      }),
    );

    const resultado = await casoDeUso.ejecutar(comandoBase);

    expect(resultado.isOk()).toBe(true);
    expect(resultado._unsafeUnwrap()).toEqual({
      transaccionId: 'trx-101',
      estado: 'RECHAZADA',
    });
    expect(mockRepoTransaccion.actualizarEstado).toHaveBeenCalledWith(
      'trx-101',
      'RECHAZADA',
      'Tarjeta declinada por el banco',
    );
    expect(mockRepoProducto.descontarStock).not.toHaveBeenCalled();
  });
});