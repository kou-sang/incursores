import { createContext, useContext } from 'react';

// Reemplaza alert()/confirm(): bloquean el hilo, rompen el diseño y en iOS PWA pueden no mostrarse.
export const FeedbackContext = createContext(null);

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback debe usarse dentro de <FeedbackProvider>');
  return context;
};
