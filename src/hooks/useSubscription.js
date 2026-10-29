import { useEffect, useRef, useState } from 'react';
import { logError } from '../utils/errors';

/**
 * Adaptador genérico Firestore → React.
 * `subscribe(onData, onError)` debe devolver la función de cancelación.
 * El original no pasaba callback de error a onSnapshot: un permission-denied dejaba la UI vacía sin aviso.
 */
export const useSubscription = (subscribe, deps, initialData) => {
  const initialDataRef = useRef(initialData);
  const [state, setState] = useState({ data: initialData, error: null, loading: Boolean(subscribe), meta: {} });

  useEffect(() => {
    if (!subscribe) {
      setState({ data: initialDataRef.current, error: null, loading: false, meta: {} });
      return undefined;
    }

    let isActive = true;
    let unsubscribe = () => {};
    setState((previous) => ({ ...previous, loading: true, error: null }));

    try {
      unsubscribe = subscribe(
        (data, meta = {}) => {
          if (isActive) setState({ data, error: null, loading: false, meta });
        },
        (error) => {
          logError('subscription', error);
          if (isActive) setState((previous) => ({ ...previous, error, loading: false }));
        },
      );
    } catch (error) {
      logError('subscription:init', error);
      setState((previous) => ({ ...previous, error, loading: false }));
    }

    return () => {
      isActive = false;
      unsubscribe();
    };
    // Las dependencias las define el llamador (patrón equivalente a useEffect).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
};
