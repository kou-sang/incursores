import { useState } from 'react';
import { BrandMark, FieldLabel, InlineSpinner } from '../../components/ui';
import { logout } from '../../services/authService';
import { ensureUserDocuments } from '../../services/userService';
import { logError, toUserMessage } from '../../utils/errors';
import { ThemeToggleButton } from './LoginScreen';

// Paso obligatorio para cuentas sin perfil (Google nuevo o escritura fallida durante el registro).
export const ProfileSetup = ({ authUser }) => {
  const suggestedName = (authUser?.displayName || authUser?.email?.split('@')[0] || '').slice(0, 24);
  const [form, setForm] = useState({ username: suggestedName, gender: 'masculino' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await ensureUserDocuments({ uid: authUser.uid, email: authUser.email, ...form });
    } catch (submitError) {
      logError('profile:setup', submitError);
      setError(toUserMessage(submitError));
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center p-4">
      <ThemeToggleButton />
      <form onSubmit={handleSubmit} className="card w-full max-w-md space-y-4 p-6">
        <BrandMark />
        <h1 className="text-xl font-bold">Completa tu perfil</h1>
        <p className="text-sm text-secondary">Tu nombre de usuario será visible para tus amigos en el ranking.</p>
        {error && <p role="alert" className="text-sm font-semibold text-accent">{error}</p>}
        <div>
          <FieldLabel htmlFor="setup-username">Usuario</FieldLabel>
          <input id="setup-username" className="input" maxLength={24} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
        </div>
        <div>
          <FieldLabel htmlFor="setup-gender">Sexo (para el mapa corporal)</FieldLabel>
          <select id="setup-gender" className="input" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value })}>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? <><InlineSpinner /> Creando tu perfil…</> : 'Continuar'}</button>
        <button type="button" className="btn btn-ghost w-full" onClick={() => logout().catch((logoutError) => logError('auth:logout', logoutError))}>
          Usar otra cuenta
        </button>
      </form>
    </main>
  );
};
