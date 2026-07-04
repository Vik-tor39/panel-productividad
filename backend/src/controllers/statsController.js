import { getSummary, getAdminSummary, getGlobalStats } from '../services/statsService.js';

export function summary(req, res) {
  res.json(getSummary(req.user.sub));
}

export function admin(req, res) {
  res.json(getAdminSummary());
}

export function global(req, res) {
  res.json(getGlobalStats());
}
