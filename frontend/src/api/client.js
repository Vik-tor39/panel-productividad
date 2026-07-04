import { keycloak } from '../keycloak.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(status, body) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function request(path, options = {}) {
  await keycloak.updateToken(30).catch(() => keycloak.login());

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${keycloak.token}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  return response.json();
}

export function get(path) {
  return request(path, { method: 'GET' });
}
