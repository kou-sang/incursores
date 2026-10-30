import { createContext, useContext } from 'react';

// Contexto + hook separados del proveedor (.jsx): react-refresh exige que los .jsx exporten solo componentes.
export const AppDataContext = createContext(null);

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error('useAppData debe usarse dentro de <AppDataProvider>');
  return context;
};
