import { lazy } from 'react';
import { logError } from './errors';

/**
 * React.lazy + precarga manual. `prefetch()` descarga el módulo antes de que el usuario lo abra
 * (en reposo o al pasar el puntero), así el código sale del bundle inicial sin sumar espera al navegar.
 * La promesa se comparte: precarga y render real descargan el archivo una sola vez.
 */
export const lazyWithPrefetch = (loader, exportName) => {
  let pending = null;

  const load = () => {
    pending ??= loader()
      .then((module) => ({ default: module[exportName] }))
      .catch((error) => {
        pending = null; // Un fallo (ej. sin red) no deja la promesa rechazada en caché: el próximo intento reintenta
        throw error;
      });
    return pending;
  };

  const prefetch = () => {
    load().catch((error) => logError(`prefetch:${exportName}`, error));
  };

  return { Component: lazy(load), prefetch };
};

// Ejecuta tareas cuando el navegador está libre (no compite con el primer render ni con la interacción).
export const runWhenIdle = (task, timeout = 3000) => {
  try {
    // Ahorro de datos activado: no se precarga nada en segundo plano.
    if (navigator.connection?.saveData) return () => {};
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(task, { timeout });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(task, 1500);
    return () => window.clearTimeout(handle);
  } catch (error) {
    logError('idle:schedule', error);
    return () => {};
  }
};
