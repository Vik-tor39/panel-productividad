import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { env } from '../config/env.js';

const jwks = jwksClient({
  jwksUri: `${env.keycloakUrl}/realms/${env.keycloakRealm}/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
});

function getSigningKey(header, callback) {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization ?? '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  jwt.verify(
    token,
    getSigningKey,
    {
      algorithms: ['RS256'],
      issuer: `${env.keycloakUrl}/realms/${env.keycloakRealm}`,
    },
    (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'unauthorized' });
      }
      req.user = decoded;
      next();
    },
  );
}

function extractRoles(decoded) {
  const realmRoles = decoded.realm_access?.roles ?? [];
  const clientRoles = decoded.resource_access?.[env.keycloakClientId]?.roles ?? [];
  return new Set([...realmRoles, ...clientRoles]);
}

export function requireRole(role) {
  return (req, res, next) => {
    const roles = extractRoles(req.user ?? {});
    if (!roles.has(role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}

export function requireAdmin(req, res, next) {
  const roles = extractRoles(req.user ?? {});
  if (!roles.has('admin')) {
    return res.status(403).json({ error: 'Rol insuficiente' });
  }
  next();
}
