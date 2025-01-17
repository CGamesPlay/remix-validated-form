import invariant from "tiny-invariant";
import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { storeFamily } from "./storeFamily";

export type ControlledFieldState = {
  fields: {
    [fieldName: string]:
      | {
          refCount: number;
          value: unknown;
          defaultValue?: unknown;
          hydrated: boolean;
          valueUpdatePromise: Promise<void> | undefined;
          resolveValueUpdate: (() => void) | undefined;
        }
      | undefined;
  };
  register: (fieldName: string) => void;
  unregister: (fieldName: string) => void;
  setValue: (fieldName: string, value: unknown) => void;
  hydrateWithDefault: (fieldName: string, defaultValue: unknown) => void;
  awaitValueUpdate: (fieldName: string) => Promise<void>;
  reset: () => void;
};

export const controlledFieldStore = storeFamily(() =>
  create<ControlledFieldState>()(
    immer((set, get, api) => ({
      fields: {},

      register: (field) =>
        set((state) => {
          if (state.fields[field]) {
            state.fields[field]!.refCount++;
          } else {
            state.fields[field] = {
              refCount: 1,
              value: undefined,
              hydrated: false,
              valueUpdatePromise: undefined,
              resolveValueUpdate: undefined,
            };
          }
        }),

      unregister: (field) =>
        set((state) => {
          const fieldState = state.fields[field];
          if (!fieldState) return;

          fieldState.refCount--;
          if (fieldState.refCount === 0) delete state.fields[field];
        }),

      setValue: (field, value) =>
        set((state) => {
          const fieldState = state.fields[field];
          if (!fieldState) return;

          fieldState.value = value;
          const promise = new Promise<void>((resolve) => {
            fieldState.resolveValueUpdate = resolve;
          });
          fieldState.valueUpdatePromise = promise;
        }),

      hydrateWithDefault: (field, defaultValue) =>
        set((state) => {
          const fieldState = state.fields[field];
          if (!fieldState) return;

          fieldState.value = defaultValue;
          fieldState.defaultValue = defaultValue;
          fieldState.hydrated = true;
        }),

      awaitValueUpdate: async (field) => {
        await get().fields[field]?.valueUpdatePromise;
      },

      reset: () =>
        set((state) => {
          Object.values(state.fields).forEach((field) => {
            if (!field) return;
            field.value = field.defaultValue;
          });
        }),
    }))
  )
);
