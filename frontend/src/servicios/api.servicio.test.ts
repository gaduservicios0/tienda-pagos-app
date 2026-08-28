import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { pasarelaServicio, tiendaServicio } from './api.servicio';

vi.mock('axios');
const mockedAxios = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

describe('api.servicio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pasarelaServicio', () => {
    it('debe obtener el acceptance_token de Wompi', async () => {
      mockedAxios.get = vi.fn().mockResolvedValueOnce({
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: 'acc-token-123',
            },
          },
        },
      });

      const token = await pasarelaServicio.obtenerTokenAceptacion();
      expect(token).toBe('acc-token-123');
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('debe tokenizar una tarjeta de credito correctamente', async () => {
      mockedAxios.post = vi.fn().mockResolvedValueOnce({
        data: {
          data: {
            id: 'tok_stagtest_999',
          },
        },
      });

      const tokenId = await pasarelaServicio.tokenizarTarjeta({
        numero: '4242 4242 4242 4242',
        cvc: '123',
        mesVencimiento: '12',
        anioVencimiento: '2028',
        nombreTitular: 'Cliente Test',
      });

      expect(tokenId).toBe('tok_stagtest_999');
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/tokens/cards'),
        {
          number: '4242424242424242',
          cvc: '123',
          exp_month: '12',
          exp_year: '28',
          card_holder: 'Cliente Test',
        },
        expect.any(Object),
      );
    });
  });

  describe('tiendaServicio', () => {
    it('debe obtener los datos de un producto', async () => {
      const mockProducto = { id: 'prod-001', nombre: 'Chaqueta' };
      mockedAxios.get = vi.fn().mockResolvedValueOnce({ data: mockProducto });

      const res = await tiendaServicio.obtenerProducto('prod-001');
      expect(res).toEqual(mockProducto);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('/productos/prod-001'));
    });

    it('debe procesar una transaccion', async () => {
      const mockRes = { idTransaccion: 'trx-123', estado: 'APROBADA' };
      mockedAxios.post = vi.fn().mockResolvedValueOnce({ data: mockRes });

      const res = await tiendaServicio.procesarTransaccion({ productoId: 'prod-001' });
      expect(res).toEqual(mockRes);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/transacciones'),
        { productoId: 'prod-001' },
      );
    });
  });
});

