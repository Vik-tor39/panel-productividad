import { useEffect, useState } from 'react';
import { keycloak, hasRole } from '../keycloak.js';
import { getSummary } from '../api/stats.js';
import { StatCard } from './StatCard.jsx';
import { AdminPanel } from './AdminPanel.jsx';
import { GlobalStatsPanel } from './GlobalStatsPanel.jsx';

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [showGlobalStats, setShowGlobalStats] = useState(false);

  useEffect(() => {
    getSummary()
      .then(setSummary)
      .catch((err) => setError(err));
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1>Panel de Productividad</h1>
        <div className="dashboard__user">
          <span>{keycloak.tokenParsed?.preferred_username}</span>
          <button onClick={() => keycloak.logout()}>Cerrar sesión</button>
        </div>
      </header>

      {error && <p className="panel-error">No se pudieron cargar las estadísticas.</p>}

      {!error && !summary && <p>Cargando estadísticas...</p>}

      {summary && (
        <>
          <div className="stat-grid">
            <StatCard label="Mis tareas completadas hoy" value={summary.completadas_hoy} />
          </div>

          <section className="panel">
            <h2>Mis tareas por día</h2>
            <table>
              <thead>
                <tr>
                  <th>Día</th>
                  <th>Tareas completadas</th>
                </tr>
              </thead>
              <tbody>
                {summary.por_dia.map((row) => (
                  <tr key={row.day}>
                    <td>{row.day}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {hasRole('admin') && <AdminPanel />}

      {hasRole('admin') && (
        <section className="panel">
          <button onClick={() => setShowGlobalStats((prev) => !prev)}>
            {showGlobalStats ? 'Ocultar' : 'Ver'} estadísticas globales (Admin)
          </button>
          {showGlobalStats && <GlobalStatsPanel />}
        </section>
      )}
    </div>
  );
}
