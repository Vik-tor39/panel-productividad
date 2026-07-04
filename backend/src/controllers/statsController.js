import { getSummary, getAdminSummary } from '../services/statsService.js';

export function summary(req, res) {
  res.json(getSummary());
}

export function admin(req, res) {
  res.json(getAdminSummary());
}
