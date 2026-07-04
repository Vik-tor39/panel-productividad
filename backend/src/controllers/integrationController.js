import { decryptPayload, isValidCiphertextFormat, KmsUnavailableError } from '../services/encryptionService.js';
import { taskEventSchema } from '../schemas/taskEventSchema.js';
import { insertEvent, findEventByTaskId } from '../repositories/eventsRepository.js';

export async function receiveEvent(req, res) {
  const { ciphertext } = req.body ?? {};

  if (!isValidCiphertextFormat(ciphertext)) {
    return res.status(400).json({ error: 'invalid_payload' });
  }

  let plaintext;
  try {
    plaintext = await decryptPayload(ciphertext);
  } catch (err) {
    if (err instanceof KmsUnavailableError) {
      return res.status(502).json({ error: 'kms_unavailable' });
    }
    throw err;
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(plaintext);
  } catch {
    return res.status(422).json({ error: 'schema_validation_failed' });
  }

  const result = taskEventSchema.safeParse(parsedJson);
  if (!result.success) {
    return res.status(422).json({ error: 'schema_validation_failed' });
  }

  const event = result.data;

  const existing = findEventByTaskId(event.task_id);
  if (existing) {
    return res.status(201).json({ status: 'received', id: String(existing.id) });
  }

  const id = insertEvent(event);
  return res.status(201).json({ status: 'received', id: String(id) });
}
