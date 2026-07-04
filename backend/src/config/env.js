import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  frontendOrigin: required('FRONTEND_ORIGIN'),

  keycloakUrl: required('KEYCLOAK_URL'),
  keycloakRealm: required('KEYCLOAK_REALM'),
  keycloakClientId: required('KEYCLOAK_CLIENT_ID'),

  vaultAddr: required('VAULT_ADDR'),
  vaultToken: required('VAULT_TOKEN'),
  vaultTransitKey: required('VAULT_TRANSIT_KEY'),

  dbPath: process.env.DB_PATH ?? './data/panel.sqlite',
};
