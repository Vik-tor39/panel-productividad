import { get } from './client.js';

export function getSummary() {
  return get('/stats/summary');
}

export function getAdminStats() {
  return get('/stats/admin');
}

export function getGlobalStats() {
  return get('/stats/global');
}
