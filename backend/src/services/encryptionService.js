import vault from 'node-vault';
import { env } from '../config/env.js';

export class KmsUnavailableError extends Error {}

const vaultClient = vault({
  endpoint: env.vaultAddr,
  token: env.vaultToken,
});

const CIPHERTEXT_PREFIX = 'vault:v1:';

export function isValidCiphertextFormat(ciphertext) {
  return typeof ciphertext === 'string' && ciphertext.startsWith(CIPHERTEXT_PREFIX);
}

export async function decryptPayload(ciphertext) {
  let response;
  try {
    response = await vaultClient.write(`transit/decrypt/${env.vaultTransitKey}`, { ciphertext });
  } catch (err) {
    throw new KmsUnavailableError(`Vault Transit decrypt failed: ${err.message}`);
  }

  const plaintextBase64 = response?.data?.plaintext;
  if (!plaintextBase64) {
    throw new KmsUnavailableError('Vault Transit response missing plaintext');
  }

  return Buffer.from(plaintextBase64, 'base64').toString('utf8');
}
