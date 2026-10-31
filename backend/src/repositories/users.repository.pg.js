// PostgreSQL repository for Users.
// Returns objects in camelCase domain shape matching current memory store.
import { query } from "../db/pool.js";

const iso = (v) => (v instanceof Date ? v.toISOString() : v);

const mapUser = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  passwordHash: r.password_hash,
  role: r.role,
  department: r.department || "Unassigned",
  departmentId: r.department_id || null,
  team: r.team || "Unassigned",
  designation: r.designation || "Employee",
  managerId: r.manager_id || null,
  status: r.status,
  sessionVersion: r.session_version || 0,
  sv: r.session_version || 0,
  lastLoginAt: r.last_login_at ? iso(r.last_login_at) : null,
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
});

export async function listUsers(filters = {}) {
  let sql = `
    SELECT u.*, d.name AS department
    FROM users u
    LEFT JOIN departments d ON d.id = u.department_id
    WHERE 1=1
  `;
  const params = [];

  if (filters.status && filters.status !== "All") {
    params.push(filters.status);
    sql += ` AND u.status = $${params.length}`;
  }
  if (filters.role) {
    params.push(filters.role);
    sql += ` AND u.role = $${params.length}::user_role`;
  }
  if (filters.department) {
    params.push(filters.department);
    sql += ` AND d.name = $${params.length}`;
  }

  sql += " ORDER BY u.created_at ASC";
  const { rows } = await query(sql, params);
  return rows.map(mapUser);
}

export async function findUserById(id) {
  const { rows } = await query(
    `SELECT u.*, d.name AS department
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserByEmail(email) {
  const { rows } = await query(
    `SELECT u.*, d.name AS department
     FROM users u
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE lower(u.email) = lower($1) LIMIT 1`,
    [email]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

async function ensureDepartmentId(deptName) {
  if (!deptName) return null;
  const existing = await query("SELECT id FROM departments WHERE lower(name) = lower($1) LIMIT 1", [deptName]);
  if (existing.rows[0]) return existing.rows[0].id;

  const inserted = await query(
    "INSERT INTO departments (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
    [deptName]
  );
  return inserted.rows[0]?.id || null;
}

export async function insertUser(user) {
  const departmentId = await ensureDepartmentId(user.department);
  const { rows } = await query(
    `INSERT INTO users (
       id, name, email, password_hash, role, department_id,
       team, designation, manager_id, status, session_version, created_at, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5::user_role, $6,
       $7, $8, $9, $10::lifecycle_status, $11, COALESCE($12::timestamptz, now()), now()
     ) RETURNING *`,
    [
      user.id,
      user.name,
      user.email,
      user.passwordHash || null,
      user.role || "Employee",
      departmentId,
      user.team || "Unassigned",
      user.designation || "Employee",
      user.managerId || null,
      user.status || "Active",
      user.sessionVersion || 0,
      user.createdAt || null,
    ]
  );
  const created = mapUser(rows[0]);
  created.department = user.department || "Unassigned";
  return created;
}

export async function updateUser(id, updates) {
  const fields = [];
  const params = [id];

  if (updates.name !== undefined) {
    params.push(updates.name);
    fields.push(`name = $${params.length}`);
  }
  if (updates.email !== undefined) {
    params.push(updates.email);
    fields.push(`email = $${params.length}`);
  }
  if (updates.passwordHash !== undefined) {
    params.push(updates.passwordHash);
    fields.push(`password_hash = $${params.length}`);
  }
  if (updates.role !== undefined) {
    params.push(updates.role);
    fields.push(`role = $${params.length}::user_role`);
  }
  if (updates.team !== undefined) {
    params.push(updates.team);
    fields.push(`team = $${params.length}`);
  }
  if (updates.designation !== undefined) {
    params.push(updates.designation);
    fields.push(`designation = $${params.length}`);
  }
  if (updates.managerId !== undefined) {
    params.push(updates.managerId);
    fields.push(`manager_id = $${params.length}`);
  }
  if (updates.status !== undefined) {
    params.push(updates.status);
    fields.push(`status = $${params.length}::lifecycle_status`);
  }
  if (updates.department) {
    const deptId = await ensureDepartmentId(updates.department);
    params.push(deptId);
    fields.push(`department_id = $${params.length}`);
  }

  fields.push("updated_at = now()");
  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = $1 RETURNING *`;
  const { rows } = await query(sql, params);
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function incrementSessionVersion(id) {
  const { rows } = await query(
    "UPDATE users SET session_version = session_version + 1, updated_at = now() WHERE id = $1 RETURNING session_version",
    [id]
  );
  return rows[0]?.session_version ?? 0;
}

