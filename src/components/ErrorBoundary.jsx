import { Component } from 'react';
import { logError } from '../utils/errors';

// Evita que un error de render en una pestaña deje la app en blanco.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    logError('render', { error, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="card mx-auto my-8 max-w-md p-6 text-center">
        <h2 className="text-lg font-bold">Algo salió mal</h2>
        <p className="mt-2 text-sm text-secondary">Este módulo falló al renderizarse. El resto de la app sigue funcionando.</p>
        <button type="button" className="btn btn-primary mt-4" onClick={() => this.setState({ hasError: false })}>
          Reintentar
        </button>
      </div>
    );
  }
}
