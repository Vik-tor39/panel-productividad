import { useEffect, useState } from 'react';
import { getGlobalStats } from '../api/stats.js';

export function GlobalStatsPanel() {
  const [globalStats, setGlobalStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getGlobalStats()
      .then(setGlobalStats)
      .catch((err) => setError(err));
  }, []);

  if (error) {
    return <p className="panel-error">No se pudieron cargar las estadísticas globales.</p>;
  }

  if (!globalStats) {
    return <p>Cargando estadísticas globales...</p>;
  }

  return (
    <section className="panel">
      <h2>Estadísticas globales</h2>
      <table>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Total tareas</th>
            <th>Por día</th>
          </tr>
        </thead>
        <tbody>
          {globalStats.stats.map((row) => (
            <tr key={row.usuario}>
              <td>{row.usuario}</td>
              <td>{row.totalTareas}</td>
              <td>
                {Object.entries(row.porDia)
                  .map(([day, count]) => `${day}: ${count}`)
                  .join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
