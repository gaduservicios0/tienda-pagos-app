import { configureStore } from '@reduxjs/toolkit';
import pagoReducer from './slices/pago.slice';

export const store = configureStore({
  reducer: {
    pago: pagoReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;