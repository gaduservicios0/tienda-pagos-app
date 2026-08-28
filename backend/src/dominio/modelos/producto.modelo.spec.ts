import { Producto } from './producto.modelo';

describe('Producto Modelo', () => {
  it('debe instanciar correctamente un producto y validar stock disponible', () => {
    const prod = new Producto('p-1', 'Zapatos', 'Desc', 10000, 5, 'url');
    expect(prod.tieneStock()).toBe(true);
  });

  it('debe retornar false si no tiene unidades disponibles', () => {
    const prod = new Producto('p-2', 'Gorra', 'Desc', 5000, 0, 'url');
    expect(prod.tieneStock()).toBe(false);
  });
});

