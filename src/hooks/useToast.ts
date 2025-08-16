import React, { useState, useCallback } from 'react';

export type ToastVariant = 'default' | 'destructive' | 'success';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface Toast extends ToastProps {
  id: string;
}

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 5000;

let memoryState: { toasts: Toast[] } = {
  toasts: [],
};

const listeners: Array<(state: { toasts: Toast[] }) => void> = [];

function toast(props: ToastProps) {
  const id = Math.random().toString(36).substr(2, 9);

  const newToast: Toast = {
    ...props,
    id,
  };

  memoryState = {
    ...memoryState,
    toasts: [newToast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
  };

  listeners.forEach(listener => {
    listener(memoryState);
  });

  setTimeout(() => {
    memoryState = {
      ...memoryState,
      toasts: memoryState.toasts.filter(t => t.id !== id),
    };
    listeners.forEach(listener => {
      listener(memoryState);
    });
  }, TOAST_REMOVE_DELAY);

  return {
    id,
    dismiss: () => {
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.filter(t => t.id !== id),
      };
      listeners.forEach(listener => {
        listener(memoryState);
      });
    },
  };
}

function useToast() {
  const [state, setState] = useState(memoryState);

  const subscribe = useCallback((listener: (state: { toasts: Toast[] }) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  React.useEffect(() => {
    const unsubscribe = subscribe(setState);
    return () => unsubscribe();
  }, [subscribe]);

  return {
    ...state,
    toast,
    dismiss: (id: string) => {
      memoryState = {
        ...memoryState,
        toasts: state.toasts.filter(t => t.id !== id),
      };
      listeners.forEach(listener => {
        listener(memoryState);
      });
    },
  };
}

export { useToast, toast };
