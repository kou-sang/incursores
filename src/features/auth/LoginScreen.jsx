import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { BrandMark, FieldLabel } from '../../components/ui';
import { loginWithEmail, loginWithGoogle, registerWithEmail, requestPasswordReset } from '../../services/authService';
import { playClick } from '../../utils/audio';
import { logError, toUserMessage } from '../../utils/errors';

const MODES = Object.freeze({ LOGIN: 'login', REGISTER: 'register', FORGOT: 'forgot' });
const INITIAL_FORM = { username: '', email: '', password: '', gender: 'masculino' };

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const LoginScreen = () => {
  const [mode, setMode] = useState(MODES.LOGIN);
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => setForm((previous) => ({ ...previous, [field]: event.target.value }));

  const switchMode = (nextMode) => {
    playClick();
    setError('');
    setSuccessMessage('');
    setMode(nextMode);
  };

  // Envoltorio único: estado de envío local (sin desmontar el formulario como hacía el spinner global).
  const runAction = async (context, action) => {
    playClick();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      await action();
    } catch (actionError) {
      if (actionError?.code === 'auth/popup-closed-by-user' || actionError?.code === 'auth/cancelled-popup-request') return;
      logError(context, actionError);
      setError(toUserMessage(actionError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === MODES.LOGIN) runAction('auth:login', () => loginWithEmail(form));
    if (mode === MODES.REGISTER) runAction('auth:register', () => registerWithEmail(form));
    if (mode === MODES.FORGOT) {
      runAction('auth:reset', async () => {
        await requestPasswordReset(form.email);
        // Mensaje neutro: no revela si el correo existe (evita enumeración de cuentas).
        setSuccessMessage('Si el correo está registrado, recibirás un enlace. Revisa también spam.');
      });
    }
  };

  const submitLabels = { login: 'Ingresar', register: 'Crear perfil', forgot: 'Enviar enlace' };

  return (
    <main className="flex min-h-[100dvh] items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card w-full max-w-md p-6 md:p-8">
        <div className="mb-1 flex justify-center"><BrandMark size={32} /></div>
        <p className="mb-6 text-center text-sm text-secondary">Registra tus entrenamientos y compite con tus amigos</p>

        {error && <p role="alert" className="mb-4 rounded-xl bg-[var(--accent-soft)] p-3 text-center text-sm font-semibold text-accent">{error}</p>}
        {successMessage && <p role="status" className="badge-good mb-4 rounded-xl p-3 text-center text-sm font-semibold">{successMessage}</p>}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === MODES.REGISTER && (
            <div>
              <FieldLabel htmlFor="username">Usuario</FieldLabel>
              <input id="username" className="input" autoComplete="nickname" required maxLength={24} value={form.username} onChange={updateField('username')} />
            </div>
          )}

          <div>
            <FieldLabel htmlFor="email">Correo</FieldLabel>
            <input id="email" type="email" inputMode="email" autoComplete="email" className="input" required value={form.email} onChange={updateField('email')} />
          </div>

          {mode !== MODES.FORGOT && (
            <div>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <input
                id="password"
                type="password"
                className="input"
                autoComplete={mode === MODES.REGISTER ? 'new-password' : 'current-password'}
                required
                minLength={6}
                value={form.password}
                onChange={updateField('password')}
              />
            </div>
          )}

          {mode === MODES.REGISTER && (
            <div>
              <FieldLabel htmlFor="gender">Sexo (para el mapa corporal)</FieldLabel>
              <select id="gender" className="input" value={form.gender} onChange={updateField('gender')}>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>
          )}

          {mode === MODES.LOGIN && (
            <div className="text-right">
              <button type="button" onClick={() => switchMode(MODES.FORGOT)} className="text-sm font-semibold text-accent hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Procesando…' : submitLabels[mode]}
          </button>
        </form>

        {mode === MODES.LOGIN && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs font-semibold text-muted">
              <span className="h-px flex-1 bg-[var(--border)]" /> o continuar con <span className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <button type="button" className="btn btn-ghost w-full" disabled={isSubmitting} onClick={() => runAction('auth:google', loginWithGoogle)}>
              <GoogleIcon /> Google
            </button>
            <p className="mt-6 border-t divider pt-4 text-center text-sm">
              ¿Nuevo aquí?{' '}
              <button type="button" onClick={() => switchMode(MODES.REGISTER)} className="font-bold text-accent hover:underline">Crea tu perfil</button>
            </p>
          </>
        )}

        {mode !== MODES.LOGIN && (
          <button type="button" onClick={() => switchMode(MODES.LOGIN)} className="mx-auto mt-5 flex items-center gap-1 text-sm font-semibold text-secondary hover:underline">
            <ArrowLeft size={16} aria-hidden /> Volver
          </button>
        )}
      </motion.div>
    </main>
  );
};
