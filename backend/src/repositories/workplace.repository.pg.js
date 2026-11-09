import { query, withTransaction } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const dateOnly = (value) => value instanceof Date
  ? value.toISOString().slice(0, 10)
  : String(value || "").slice(0, 10);

export const mapAttendanceRecord = (row) => row && ({
  id: row.id,
  userId: row.user_id,
  date: dateOnly(row.attendance_date),
  checkInAt: iso(row.check_in_at),
  checkOutAt: row.check_out_at ? iso(row.check_out_at) : null,
  status: row.status,
});

export const mapPerformanceReview = (row) => row && ({
  id: row.id,
  userId: row.user_id,
  reviewerId: row.reviewer_id || null,
  reviewerName: row.reviewer_name,
  reviewDate: dateOnly(row.review_date),
  rating: Number(row.rating),
  comments: row.comments,
  goals: row.goals,
});

export const mapCommunication = (row) => row && ({
  id: row.id,
  senderId: row.sender_id,
  senderName: row.sender_name,
  recipientId: row.recipient_id,
  kind: row.kind,
  content: row.content,
  sentAt: iso(row.sent_at),
});

const audit = (client, actorId, action, entityType, entityId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, $2, $3, $4, $5::jsonb)`,
  [actorId || null, action, entityType, entityId, JSON.stringify(metadata)]
);

export function createWorkplaceRepository(
  db = { query, withTransaction },
  timeZone = process.env.APP_TIME_ZONE || "Asia/Kolkata",
) {
  const clockIn = async ({ id, userId }) => db.withTransaction(async (client) => {
    const inserted = await client.query(
      `INSERT INTO attendance_records (
         id, user_id, attendance_date, check_in_at, status
       ) SELECT $1, active_user.id, timezone($3, now())::date, now(), 'Present'
       FROM users active_user
       WHERE active_user.id = $2 AND active_user.status = 'Active'
       ON CONFLICT (user_id, attendance_date) DO NOTHING
       RETURNING *`,
      [id, userId, timeZone]
    );
    if (inserted.rows[0]) {
      await audit(client, userId, "ATTENDANCE_CLOCK_IN", "ATTENDANCE", id, {
        attendanceDate: dateOnly(inserted.rows[0].attendance_date),
      });
      return { record: mapAttendanceRecord(inserted.rows[0]), created: true };
    }
    const existing = await client.query(
      `SELECT * FROM attendance_records
       WHERE user_id = $1 AND attendance_date = timezone($2, now())::date`,
      [userId, timeZone]
    );
    return { record: mapAttendanceRecord(existing.rows[0]), created: false };
  });

  const clockOut = async ({ userId }) => db.withTransaction(async (client) => {
    const updated = await client.query(
      `UPDATE attendance_records record SET check_out_at = now(), updated_at = now()
       FROM users active_user
       WHERE record.user_id = $1
         AND active_user.id = record.user_id AND active_user.status = 'Active'
         AND record.attendance_date = timezone($2, now())::date
         AND record.check_out_at IS NULL
       RETURNING *`,
      [userId, timeZone]
    );
    if (updated.rows[0]) {
      await audit(client, userId, "ATTENDANCE_CLOCK_OUT", "ATTENDANCE", updated.rows[0].id, {
        attendanceDate: dateOnly(updated.rows[0].attendance_date),
      });
      return { record: mapAttendanceRecord(updated.rows[0]), updated: true };
    }
    const existing = await client.query(
      `SELECT * FROM attendance_records
       WHERE user_id = $1 AND attendance_date = timezone($2, now())::date`,
      [userId, timeZone]
    );
    return { record: mapAttendanceRecord(existing.rows[0]), updated: false };
  });

  const listAttendance = async ({ userId, limit = 10 }) => {
    const boundedLimit = Math.min(100, Math.max(1, Number(limit) || 10));
    const { rows } = await db.query(
      `SELECT * FROM attendance_records
       WHERE user_id = $1 ORDER BY attendance_date DESC, id DESC LIMIT $2`,
      [userId, boundedLimit]
    );
    return rows.map(mapAttendanceRecord);
  };

  const attendanceSummary = async ({ userId }) => {
    const { rows } = await db.query(
      `SELECT count(*)::integer AS total,
              count(*) FILTER (WHERE status = 'Present')::integer AS present
       FROM attendance_records WHERE user_id = $1`,
      [userId]
    );
    const total = Number(rows[0]?.total || 0);
    const present = Number(rows[0]?.present || 0);
    return { total, present, rate: total ? Math.round((present / total) * 100) : 0 };
  };

  const listPerformanceReviews = async ({ userId, limit = 10 }) => {
    const boundedLimit = Math.min(50, Math.max(1, Number(limit) || 10));
    const { rows } = await db.query(
      `SELECT * FROM performance_reviews
       WHERE user_id = $1 ORDER BY review_date DESC, id DESC LIMIT $2`,
      [userId, boundedLimit]
    );
    return rows.map(mapPerformanceReview);
  };

  const listAnnouncements = async ({ limit = 25 } = {}) => {
    const boundedLimit = Math.min(100, Math.max(1, Number(limit) || 25));
    const { rows } = await db.query(
      `SELECT * FROM workplace_communications
       WHERE kind = 'Announcement' AND recipient_id = 'ALL'
       ORDER BY sent_at DESC, id DESC LIMIT $1`,
      [boundedLimit]
    );
    return rows.map(mapCommunication);
  };

  const listInbox = async ({ userId, limit = 50 }) => {
    const boundedLimit = Math.min(100, Math.max(1, Number(limit) || 50));
    const { rows } = await db.query(
      `SELECT * FROM workplace_communications
       WHERE recipient_id = $1 AND kind <> 'Announcement'
       ORDER BY sent_at DESC, id DESC LIMIT $2`,
      [userId, boundedLimit]
    );
    return rows.map(mapCommunication);
  };

  const resolveRecipient = async ({ search, senderId }) => {
    const normalized = String(search || "").trim();
    if (!normalized) return { user: null, ambiguous: false };
    const { rows } = await db.query(
      `SELECT id, name, designation
       FROM users
       WHERE status = 'Active' AND id <> $2
         AND lower(name) LIKE '%' || lower($1) || '%'
       ORDER BY CASE WHEN lower(name) = lower($1) THEN 0 ELSE 1 END, name, id
       LIMIT 3`,
      [normalized, senderId]
    );
    if (rows.length !== 1) return { user: null, ambiguous: rows.length > 1 };
    return { user: rows[0], ambiguous: false };
  };

  const sendCommunication = async ({ id, sender, recipientId, content, kind = "Direct" }) =>
    db.withTransaction(async (client) => {
      const participantIds = recipientId === "ALL" ? [sender.id] : [sender.id, recipientId];
      const participants = await client.query(
        "SELECT id FROM users WHERE id = ANY($1::text[]) AND status = 'Active' FOR SHARE",
        [participantIds]
      );
      if (participants.rows.length !== new Set(participantIds).size) return null;
      const { rows } = await client.query(
        `INSERT INTO workplace_communications (
           id, sender_id, sender_name, recipient_id, kind, content, sent_at
         ) VALUES ($1, $2, $3, $4, $5, $6, now()) RETURNING *`,
        [id, sender.id, sender.name, recipientId, kind, content]
      );
      await audit(client, sender.id, "WORKPLACE_MESSAGE_SENT", "WORKPLACE_COMMUNICATION", id, {
        kind,
        recipientId,
      });
      return mapCommunication(rows[0]);
    });

  return {
    clockIn,
    clockOut,
    listAttendance,
    attendanceSummary,
    listPerformanceReviews,
    listAnnouncements,
    listInbox,
    resolveRecipient,
    sendCommunication,
  };
}

export const workplaceRepository = createWorkplaceRepository();
