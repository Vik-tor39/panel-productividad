import {
  countCompletedToday,
  countCompletedTodayForUser,
  countByUser,
  countByDay,
  countByDayForUser,
  countTotalEvents,
  countGlobalByUserAndDay,
} from '../repositories/eventsRepository.js';

export function getSummary(userId) {
  return {
    completadas_hoy: countCompletedTodayForUser(userId),
    por_dia: countByDayForUser(userId),
  };
}

export function getAdminSummary() {
  return {
    completadas_hoy: countCompletedToday(),
    por_usuario: countByUser(),
    por_dia: countByDay(),
    total_eventos: countTotalEvents(),
  };
}

export function getGlobalStats() {
  const rows = countGlobalByUserAndDay();
  const byUser = new Map();

  for (const row of rows) {
    if (!byUser.has(row.user_id)) {
      byUser.set(row.user_id, { usuario: row.username, totalTareas: 0, porDia: {} });
    }
    const entry = byUser.get(row.user_id);
    entry.porDia[row.day] = row.count;
    entry.totalTareas += row.count;
  }

  return { stats: Array.from(byUser.values()) };
}
