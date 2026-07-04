import { useEffect, useState } from 'react';
import { getAdminStats } from '../api/stats.js';
import { StatCard } from './StatCard.jsx';

export function AdminPanel() {
  const [adminStats, setAdminStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminStats()
      .then(setAdminStats)
      .catch((err) => setError(err));
  }, []);

  if (error) {
    return <p className="panel-error">No se pudo cargar la información de administrador.</p>;
  }

  if (!adminStats) {
    return <p>Cargando estadísticas de administrador...</p>;
  }

  return (
    <section className="panel">
      <h2>Administración</h2>
      <div className="stat-grid">
        <StatCard label="Total de eventos registrados" value={adminStats.total_eventos} />
      </div>
    </section>
  );
}
