import { query, withTransaction } from "../db/pool.js";

const iso = (value) => (value instanceof Date ? value.toISOString() : value);

export const mapIdentityUser = (row) => row && ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  department: row.department || "Unassigned",
  departmentId: row.department_id || null,
  team: row.team || "Unassigned",
  designation: row.designation || "Employee",
  managerId: row.manager_id || null,
  status: row.status,
  sessionVersion: Number(row.session_version || 0),
  sv: Number(row.session_version || 0),
  preferences: row.preferences || {},
  joinedAt: row.joined_at ? iso(row.joined_at).slice(0, 10) : null,
  lastLoginAt: row.last_login_at ? iso(row.last_login_at) : null,
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

const selectUserSql = `
  SELECT u.*, d.name AS department
  FROM users u
  LEFT JOIN departments d ON d.id = u.department_id
`;

export function createIdentityRepository(db = { query, withTransaction }) {
  const findUserById = async (id, client = db) => {
    const { rows } = await client.query(`${selectUserSql} WHERE u.id = $1 LIMIT 1`, [id]);
    return mapIdentityUser(rows[0]);
  };

  const findUserByIdentifier = async (identifier, client = db) => {
    const { rows } = await client.query(
      `${selectUserSql}
       WHERE lower(u.email::text) = lower($1)
          OR (u.role = 'Super Admin'::user_role AND lower($1) = 'super admin')
       LIMIT 1`,
      [identifier]
    );
    return mapIdentityUser(rows[0]);
  };

  const listUsers = async (filters = {}) => {
    const params = [];
    let sql = `${selectUserSql} WHERE 1=1`;
    if (filters.managerId) {
      params.push(filters.managerId);
      sql += ` AND (u.manager_id = $${params.length} OR u.id = $${params.length})`;
    }
    if (filters.department) {
      params.push(filters.department);
      sql += ` AND d.name = $${params.length}`;
    }
    if (filters.role) {
      params.push(filters.role);
      sql += ` AND u.role = $${params.length}::user_role`;
    }
    if (filters.status && filters.status !== "All") {
      params.push(filters.status);
      sql += ` AND u.status = $${params.length}::lifecycle_status`;
    }
    sql += " ORDER BY u.created_at ASC";
    const { rows } = await db.query(sql, params);
    return rows.map(mapIdentityUser);
  };

  const findUserSummariesByIds = async (ids, client = db) => {
    const uniqueIds = [...new Set((ids || []).filter((id) => typeof id === "string" && id.length))];
    if (!uniqueIds.length) return [];
    const { rows } = await client.query(
      `SELECT u.id, u.name, u.email, u.status
       FROM users u
       WHERE u.id = ANY($1::text[])`,
      [uniqueIds]
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      status: row.status,
    }));
  };

  const ensureDepartment = async (client, name) => {
    if (!name) return null;
    const { rows } = await client.query(
      `INSERT INTO departments (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name]
    );
    return rows[0].id;
  };

  const writeAudit = (client, actorId, action, entityId, metadata = {}) => client.query(
    `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2, 'USER', $3, $4::jsonb)`,
    [actorId || null, action, entityId, JSON.stringify(metadata)]
  );

  const insertUser = async (user, { actorId = user.id, action = "CREATE_USER" } = {}) =>
    db.withTransaction(async (client) => {
      const departmentId = await ensureDepartment(client, user.department);
      await client.query(
        `INSERT INTO users (
           id, name, email, password_hash, role, department_id, team,
           designation, manager_id, status, session_version, preferences,
           joined_at, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5::user_role, $6, $7,
           $8, $9, $10::lifecycle_status, 0, $11::jsonb,
           $12::date, COALESCE($13::timestamptz, now()), now()
         )`,
        [
          user.id, user.name, user.email, user.passwordHash, user.role,
          departmentId, user.team || "Unassigned", user.designation || "Employee",
          user.managerId || null, user.status || "Active",
          JSON.stringify(user.preferences || {}), user.joinedAt || null,
          user.createdAt || null,
        ]
      );
      await writeAudit(client, actorId, action, user.id, { role: user.role });
      return findUserById(user.id, client);
    });

  const updateUser = async (id, updates, { actorId, action = "UPDATE_USER" } = {}) =>
    db.withTransaction(async (client) => {
      const current = await client.query("SELECT * FROM users WHERE id = $1 FOR UPDATE", [id]);
      if (!current.rows[0]) return null;
      const fields = [];
      const params = [id];
      const add = (column, value, cast = "") => {
        params.push(value);
        fields.push(`${column} = $${params.length}${cast}`);
      };
      if (updates.name !== undefined) add("name", updates.name);
      if (updates.email !== undefined) add("email", updates.email);
      if (updates.passwordHash !== undefined) add("password_hash", updates.passwordHash);
      if (updates.role !== undefined) add("role", updates.role, "::user_role");
      if (updates.team !== undefined) add("team", updates.team);
      if (updates.designation !== undefined) add("designation", updates.designation);
      if (updates.managerId !== undefined) add("manager_id", updates.managerId);
      if (updates.status !== undefined) add("status", updates.status, "::lifecycle_status");
      if (updates.preferences !== undefined) add("preferences", JSON.stringify(updates.preferences), "::jsonb");
      if (updates.joinedAt !== undefined) add("joined_at", updates.joinedAt, "::date");
      if (updates.department !== undefined) add("department_id", await ensureDepartment(client, updates.department));
      if (fields.length) {
        fields.push("updated_at = now()");
        await client.query(`UPDATE users SET ${fields.join(", ")} WHERE id = $1`, params);
      }
      const auditMetadata = {};
      for (const key of ["name", "email", "role", "team", "designation", "managerId", "status", "department", "joinedAt"]) {
        if (updates[key] !== undefined) auditMetadata[key] = updates[key];
      }
      if (updates.passwordHash !== undefined) auditMetadata.passwordChanged = true;
      await writeAudit(client, actorId, action, id, auditMetadata);
      return findUserById(id, client);
    });

  const revokeSessions = async (id, { actorId = id, action = "LOGOUT_AND_REVOKE_SESSION" } = {}) =>
    db.withTransaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE users SET session_version = session_version + 1, updated_at = now()
         WHERE id = $1 RETURNING session_version`,
        [id]
      );
      if (!rows[0]) return null;
      await writeAudit(client, actorId, action, id);
      return Number(rows[0].session_version);
    });

  const resetPassword = async ({ id, expectedSessionVersion, passwordHash }) =>
    db.withTransaction(async (client) => {
      const { rows } = await client.query(
        `UPDATE users SET password_hash = $3
         WHERE id = $1 AND status = 'Active' AND session_version = $2
         RETURNING session_version`,
        [id, expectedSessionVersion, passwordHash]
      );
      if (!rows[0]) return null;
      await writeAudit(client, id, "RESET_PASSWORD", id, { passwordChanged: true });
      return Number(rows[0].session_version);
    });

  const recordLogin = async (id) => db.withTransaction(async (client) => {
    await client.query("UPDATE users SET last_login_at = now() WHERE id = $1", [id]);
    await writeAudit(client, id, "LOGIN", id);
  });

  const recordUserAudit = async ({ actorId, action, userId, metadata = {} }) =>
    db.withTransaction((client) => writeAudit(client, actorId, action, userId, metadata));

  const archiveAndDeactivateUser = async ({ id, actor, deletionComment, replacementPasswordHash }) =>
    db.withTransaction(async (client) => {
      const current = await client.query(
        `${selectUserSql} WHERE u.id = $1 FOR UPDATE OF u`,
        [id]
      );
      const user = mapIdentityUser(current.rows[0]);
      if (!user) return null;
      const { passwordHash: _passwordHash, ...safeUser } = user;
      await client.query(
        `INSERT INTO deleted_archives (
           entity_type, entity_id, entity_data, related_data,
           deleted_by, deleted_by_name, deletion_comment
         ) VALUES ('User', $1, $2::jsonb, '{}'::jsonb, $3, $4, $5)`,
        [id, JSON.stringify(safeUser), actor.id, actor.name, deletionComment]
      );
      await client.query(
        `UPDATE users SET status = 'Inactive', password_hash = $2
         WHERE id = $1`,
        [id, replacementPasswordHash]
      );
      await writeAudit(client, actor.id, "ARCHIVE_AND_DEACTIVATE_USER", id);
      return { ...safeUser, status: "Inactive" };
    });

  const listUserArchives = async () => {
    const { rows } = await db.query(
      `SELECT id, entity_type, entity_id, entity_data, related_data,
              deleted_by, deleted_by_name, deletion_comment, deleted_at
       FROM deleted_archives WHERE entity_type = 'User' ORDER BY deleted_at DESC`
    );
    return rows.map((row) => ({
      id: row.id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      entityData: row.entity_data,
      relatedData: row.related_data,
      deletedBy: row.deleted_by,
      deletedByName: row.deleted_by_name,
      deletionComment: row.deletion_comment,
      deletedAt: iso(row.deleted_at),
    }));
  };

  const restoreUserArchive = async ({ archiveId, actorId, replacementPasswordHash }) =>
    db.withTransaction(async (client) => {
      const archiveResult = await client.query(
        `SELECT * FROM deleted_archives
         WHERE id = $1 AND entity_type = 'User' FOR UPDATE`,
        [archiveId]
      );
      const archive = archiveResult.rows[0];
      if (!archive) return null;
      const data = archive.entity_data || {};
      const existing = await client.query("SELECT id FROM users WHERE id = $1 FOR UPDATE", [archive.entity_id]);
      if (existing.rows[0]) {
        await client.query(
          `UPDATE users SET status = 'Inactive', password_hash = $2, updated_at = now()
           WHERE id = $1`,
          [archive.entity_id, replacementPasswordHash]
        );
      } else {
        const departmentId = await ensureDepartment(client, data.department);
        await client.query(
          `INSERT INTO users (
             id, name, email, password_hash, role, department_id, team,
             designation, manager_id, status, session_version, preferences,
             joined_at, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5::user_role, $6, $7,
             $8, $9, 'Inactive', 1, $10::jsonb,
             $11::date, COALESCE($12::timestamptz, now()), now()
           )`,
          [
            archive.entity_id, data.name, data.email, replacementPasswordHash,
            data.role || "Employee", departmentId, data.team || "Unassigned",
            data.designation || "Employee", data.managerId || null,
            JSON.stringify(data.preferences || {}), data.joinedAt || null,
            data.createdAt || null,
          ]
        );
      }
      await client.query("DELETE FROM deleted_archives WHERE id = $1", [archiveId]);
      await writeAudit(client, actorId, "RESTORE_ARCHIVE", archive.entity_id, {
        restoredStatus: "Inactive",
        passwordResetRequired: true,
      });
      return findUserById(archive.entity_id, client);
    });

  return {
    findUserById,
    findUserByIdentifier,
    findUserSummariesByIds,
    listUsers,
    insertUser,
    updateUser,
    revokeSessions,
    resetPassword,
    recordLogin,
    recordUserAudit,
    archiveAndDeactivateUser,
    listUserArchives,
    restoreUserArchive,
  };
}

export const identityRepository = createIdentityRepository();
