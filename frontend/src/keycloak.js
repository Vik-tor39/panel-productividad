import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

let initPromise = null;

export function initKeycloak() {
  if (!initPromise) {
    initPromise = keycloak.init({
      onLoad: 'login-required',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
  }
  return initPromise;
}

keycloak.onTokenExpired = () => {
  keycloak.updateToken(30).catch(() => keycloak.login());
};

export function hasRole(role) {
  return keycloak.hasRealmRole(role) || keycloak.hasResourceRole(role, keycloak.clientId);
}
