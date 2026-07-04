import {
  countCompletedToday,
  countByUser,
  countByDay,
  countTotalEvents,
} from '../repositories/eventsRepository.js';

export function getSummary() {
  return {
    completadas_hoy: countCompletedToday(),
    por_usuario: countByUser(),
    por_dia: countByDay(),
  };
}

export function getAdminSummary() {
  return {
    ...getSummary(),
    total_eventos: countTotalEvents(),
  };
}
