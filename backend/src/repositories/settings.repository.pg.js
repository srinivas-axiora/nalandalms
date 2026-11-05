import { query, withTransaction } from "../db/pool.js";

export class SettingsRepositoryError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "SettingsRepositoryError";
    this.code = code;
  }
}

export function createSettingsRepository(db = { query, withTransaction }) {
  const getProctoring = async (client = db) => {
    const { rows } = await client.query(
      "SELECT value FROM system_settings WHERE key = 'proctoring' LIMIT 1",
    );
    if (!rows[0]) throw new SettingsRepositoryError("SETTINGS_NOT_INITIALIZED", "Proctoring settings are not initialized");
    return rows[0].value;
  };

  const updateProctoring = ({ actorId, patch }) => db.withTransaction(async (client) => {
    const current = await client.query(
      "SELECT value FROM system_settings WHERE key = 'proctoring' FOR UPDATE",
    );
    if (!current.rows[0]) throw new SettingsRepositoryError("SETTINGS_NOT_INITIALIZED", "Proctoring settings are not initialized");
    const value = { ...current.rows[0].value, ...patch };
    const updated = await client.query(
      `UPDATE system_settings SET value = $1::jsonb, updated_by = $2, updated_at = now()
       WHERE key = 'proctoring' RETURNING value`,
      [JSON.stringify(value), actorId],
    );
    await client.query(
      `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
       VALUES ($1, 'UPDATE_SETTINGS', 'SETTINGS', 'proctoring', $2::jsonb)`,
      [actorId, JSON.stringify({ changedKeys: Object.keys(patch).sort() })],
    );
    return updated.rows[0].value;
  });

  return { getProctoring, updateProctoring };
}

export const settingsRepository = createSettingsRepository();
