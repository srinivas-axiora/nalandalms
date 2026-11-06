import { query } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const bounded = (value, maximum) => value === null || value === undefined
  ? null
  : String(value).slice(0, maximum);

const mapAudit = (row) => row && ({
  id: row.id,
  actorId: row.actor_id || null,
  action: row.action,
  entityType: row.entity_type,
  entityId: row.entity_id,
  metadata: row.metadata || {},
  createdAt: iso(row.created_at),
});

const mapSecurityEvent = (row) => row && ({
  id: row.id,
  type: row.event_type,
  actorId: row.actor_id || null,
  ip: row.ip_address || null,
  method: row.http_method || null,
  path: row.request_path || null,
  userAgent: row.user_agent || null,
  requestId: row.request_id || null,
  metadata: row.metadata || {},
  createdAt: iso(row.created_at),
});

const pageLimit = (value, fallback, maximum) => {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new RangeError(`limit must be an integer between 1 and ${maximum}`);
  }
  return parsed;
};

export function createSecurityEvidenceRepository(db = { query }) {
  const appendAudit = async (event) => {
    const { rows } = await db.query(
      `INSERT INTO audit_logs (
         id, actor_id, action, entity_type, entity_id, metadata, ingest_key, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, COALESCE($8::timestamptz, now()))
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [
        event.id,
        bounded(event.actorId, 200),
        bounded(event.action, 200),
        bounded(event.entityType, 100),
        bounded(event.entityId, 300),
        JSON.stringify(event.metadata || {}),
        `runtime:${event.id}`,
        event.createdAt || null,
      ],
    );
    return mapAudit(rows[0]);
  };

  const appendSecurityEvent = async (event) => {
    const { rows } = await db.query(
      `INSERT INTO security_events (
         id, event_type, actor_id, ip_address, http_method, request_path,
         user_agent, request_id, metadata, ingest_key, created_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9::jsonb, $10, COALESCE($11::timestamptz, now())
       )
       ON CONFLICT (id) DO NOTHING
       RETURNING *`,
      [
        event.id,
        bounded(event.type, 200),
        bounded(event.actorId, 200),
        bounded(event.ip, 200),
        bounded(event.method, 16),
        bounded(event.path, 2048),
        bounded(event.userAgent, 1024),
        bounded(event.requestId, 200),
        JSON.stringify(event.metadata || {}),
        `runtime:${event.id}`,
        event.createdAt || null,
      ],
    );
    return mapSecurityEvent(rows[0]);
  };

  const listAudit = async ({ limit = 50 } = {}) => {
    const safeLimit = pageLimit(limit, 50, 200);
    const { rows } = await db.query(
      `SELECT *, count(*) OVER()::integer AS total_count
       FROM audit_logs
       ORDER BY created_at DESC, id DESC
       LIMIT $1`,
      [safeLimit],
    );
    return { data: rows.map(mapAudit), total: Number(rows[0]?.total_count || 0) };
  };

  const listSecurityEvents = async ({ limit = 100 } = {}) => {
    const safeLimit = pageLimit(limit, 100, 500);
    const { rows } = await db.query(
      `SELECT *, count(*) OVER()::integer AS total_count
       FROM security_events
       ORDER BY created_at DESC, id DESC
       LIMIT $1`,
      [safeLimit],
    );
    return { data: rows.map(mapSecurityEvent), total: Number(rows[0]?.total_count || 0) };
  };

  return { appendAudit, appendSecurityEvent, listAudit, listSecurityEvents };
}

export const securityEvidenceRepository = createSecurityEvidenceRepository();
