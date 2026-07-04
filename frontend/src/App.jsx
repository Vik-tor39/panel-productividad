import { useEffect, useState } from 'react';
import { initKeycloak } from './keycloak.js';
import { Dashboard } from './components/Dashboard.jsx';

export default function App() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    initKeycloak()
      .then((authenticated) => setStatus(authenticated ? 'authenticated' : 'unauthenticated'))
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') {
    return <p className="centered">Conectando con Keycloak...</p>;
  }

  if (status === 'error') {
    return <p className="centered panel-error">No se pudo iniciar sesión. Intenta recargar la página.</p>;
  }

  if (status === 'unauthenticated') {
    return <p className="centered">Redirigiendo al login...</p>;
  }

  return <Dashboard />;
}
