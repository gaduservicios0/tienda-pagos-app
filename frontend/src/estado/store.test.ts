import { describe, it, expect } from 'vitest';
import { store } from './store';
import { establecerPaso } from './slices/pago.slice';

describe('Redux Store', () => {
  it('debe inicializar el store con el estado de pago', () => {
    const state = store.getState();
    expect(state.pago).toBeDefined();
  });

  it('debe despachar acciones correctamente', () => {
    store.dispatch(establecerPaso(3));
    expect(store.getState().pago.pasoActual).toBe(3);
  });
});

