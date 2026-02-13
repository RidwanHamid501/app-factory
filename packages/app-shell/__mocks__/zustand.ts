// Zustand mock for testing - enables store reset between tests
// Official docs: https://zustand.docs.pmnd.rs/guides/testing

import { type StateCreator } from 'zustand';

const { create: actualCreate } = jest.requireActual<typeof import('zustand')>('zustand');

const storeResetFns = new Set<() => void>();

// Mock create function that captures initial state for reset
export const create = (<T>() => {
  return (createState: StateCreator<T>) => {
    const store = actualCreate<T>()(createState);
    const initialState = store.getState();
    storeResetFns.add(() => {
      store.setState(initialState, true);
    });
    return store;
  };
}) as typeof actualCreate;

export const resetAllStores = () => {
  storeResetFns.forEach((resetFn) => {
    resetFn();
  });
};
