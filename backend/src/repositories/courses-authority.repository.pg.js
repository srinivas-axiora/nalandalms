import { query, withTransaction } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const isAdmin = (role) => role === "Admin" || role === "Super Admin";

export class CourseAuthorityError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "CourseAuthorityError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details) => {
  throw new CourseAuthorityError(code, message, details);
};

export const mapCourseAuthorityRow = (row) => row && ({
  id: row.id,
  title: row.title,
  description: row.description,
  skill: row.skill || "",
  skillIds: row.skill_ids || [],
  targetLevel: row.target_level || "Beginner",
  difficulty: row.difficulty || "Beginner",
  estimatedHours: Number(row.estimated_hours || 0),
  priceCents: Number(row.price_cents || 0),
  currency: row.currency || "INR",
  isFree: Number(row.price_cents || 0) === 0,
  category: row.category || "General",
  prerequisites: row.prerequisites || [],
  tags: row.tags || [],
  thumbnailColor: row.thumbnail_color || "#22d3ee",
  contentTypes: row.content_types || ["Rich Text"],
  status: row.status,
  approval: row.approval,
  ownerId: row.owner_id,
  version: Number(row.current_version || 1),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
  storage: row.storage_metadata || { files: [] },
});

const audit = (client, actorId, action, courseId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, $2, 'COURSE', $3, $4::jsonb)`,
  [actorId || null, action, courseId, JSON.stringify(metadata)]
);

const canManage = (actor, row) => isAdmin(actor?.role) || row.owner_id === actor?.id;

export function createCourseAuthorityRepository(db = { query, withTransaction }) {
  const getRow = async (id, client = db, forUpdate = false) => {
    const { rows } = await client.query(
      `SELECT * FROM courses WHERE id = $1${forUpdate ? " FOR UPDATE" : ""}`,
      [id]
    );
    return rows[0] || null;
  };

  const assertVersion = (row, expectedVersion) => {
    if (Number(expectedVersion) !== Number(row.current_version)) {
      fail("VERSION_CONFLICT", "Course changed since it was loaded", {
        currentVersion: Number(row.current_version),
      });
    }
  };

  const listCatalog = async (filters = {}) => {
    const params = [];
    const add = (value) => {
      params.push(value);
      return `$${params.length}`;
    };
    let sql = `
      SELECT c.*, u.name AS instructor_name, u.designation AS instructor_title,
             count(DISTINCT ch.id)::integer AS chapter_count,
             count(DISTINCT e.id)::integer AS enrollment_count
      FROM courses c
      JOIN users u ON u.id = c.owner_id
      LEFT JOIN chapters ch ON ch.course_id = c.id
      LEFT JOIN enrollments e ON e.course_id = c.id
      WHERE c.status = 'Active' AND c.approval = 'Approved'`;
    if (filters.skill) {
      const token = add(filters.skill);
      sql += ` AND (c.skill = ${token} OR ${token} = ANY(c.skill_ids))`;
    }
    if (filters.category) sql += ` AND c.category = ${add(filters.category)}`;
    if (filters.difficulty) sql += ` AND c.difficulty = ${add(filters.difficulty)}`;
    if (filters.search) {
      const token = add(`%${String(filters.search).trim()}%`);
      sql += ` AND (c.title ILIKE ${token} OR c.description ILIKE ${token})`;
    }
    sql += " GROUP BY c.id, u.id ORDER BY c.created_at DESC, c.id";
    const { rows } = await db.query(sql, params);
    return rows.map((row) => ({
      ...mapCourseAuthorityRow(row),
      instructorName: row.instructor_name,
      instructorTitle: row.instructor_title || "Instructor",
      chapterCount: Number(row.chapter_count || 0),
      enrollmentCount: Number(row.enrollment_count || 0),
    }));
  };

  const listVisible = async ({ actor, status = "Active", approval, skill }) => {
    const params = [];
    let sql = "SELECT DISTINCT c.* FROM courses c";
    if (!isAdmin(actor.role) && actor.role !== "Manager") {
      params.push(actor.id);
      sql += " JOIN enrollments e ON e.course_id = c.id AND e.user_id = $1";
    }
    sql += " WHERE 1=1";
    if (actor.role === "Manager") {
      params.push(actor.id);
      sql += ` AND (c.owner_id = $${params.length} OR (c.status = 'Active' AND c.approval = 'Approved'))`;
    } else if (!isAdmin(actor.role)) {
      sql += " AND c.status = 'Active' AND c.approval = 'Approved'";
    }
    if (status && status !== "All") {
      params.push(status);
      sql += ` AND c.status = $${params.length}::lifecycle_status`;
    }
    if (approval) {
      params.push(approval);
      sql += ` AND c.approval = $${params.length}::approval_status`;
    }
    if (skill) {
      params.push(skill);
      sql += ` AND (c.skill = $${params.length} OR $${params.length} = ANY(c.skill_ids))`;
    }
    sql += " ORDER BY c.created_at DESC, c.id";
    const { rows } = await db.query(sql, params);
    return rows.map(mapCourseAuthorityRow);
  };

  const findCourseById = async (id) => mapCourseAuthorityRow(await getRow(id));

  const createCourse = async ({ course, actor }) => {
    try {
      return await db.withTransaction(async (client) => {
        const { rows } = await client.query(
          `INSERT INTO courses (
             id, title, description, skill, skill_ids, target_level, difficulty,
             estimated_hours, price_cents, currency, category, prerequisites, tags,
             thumbnail_color, content_types, storage_metadata, status, approval,
             owner_id, current_version, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7,
             $8, $9, $10, $11, $12, $13,
             $14, $15, $16::jsonb, $17::lifecycle_status, $18::approval_status,
             $19, 1, COALESCE($20::timestamptz, now()), now()
           ) RETURNING *`,
          [
            course.id, course.title, course.description, course.skill || "",
            course.skillIds || [], course.targetLevel || "Beginner",
            course.difficulty || "Beginner", course.estimatedHours ?? 4,
            course.priceCents ?? 0, course.currency || "INR",
            course.category || "General", course.prerequisites || [], course.tags || [],
            course.thumbnailColor || "#22d3ee", course.contentTypes || ["Rich Text"],
            JSON.stringify(course.storage || { files: [] }), course.status || "Active",
            isAdmin(actor.role) ? "Approved" : "Pending", actor.id,
            course.createdAt || null,
          ]
        );
        await client.query(
          `INSERT INTO course_versions (course_id, version, title, description, change_note, created_by)
           VALUES ($1, 1, $2, $3, 'Initial version', $4)`,
          [rows[0].id, rows[0].title, rows[0].description, actor.id]
        );
        await audit(client, actor.id, "CREATE_COURSE", rows[0].id, {
          approval: rows[0].approval,
          version: 1,
        });
        return mapCourseAuthorityRow(rows[0]);
      });
    } catch (error) {
      if (error?.code === "23505") fail("COURSE_CONFLICT", "Course identifier already exists");
      throw error;
    }
  };

  const updateCourse = async ({ id, actor, expectedVersion, updates }) =>
    db.withTransaction(async (client) => {
      const row = await getRow(id, client, true);
      if (!row) fail("COURSE_NOT_FOUND", "Course not found");
      if (!canManage(actor, row)) fail("FORBIDDEN", "You cannot manage this course");
      assertVersion(row, expectedVersion);

      const fields = [];
      const params = [id];
      const allowed = {
        title: "title", description: "description", skill: "skill", skillIds: "skill_ids",
        targetLevel: "target_level", difficulty: "difficulty", estimatedHours: "estimated_hours",
        priceCents: "price_cents", currency: "currency", category: "category",
        prerequisites: "prerequisites", tags: "tags", thumbnailColor: "thumbnail_color",
        contentTypes: "content_types",
      };
      for (const [key, column] of Object.entries(allowed)) {
        if (updates[key] !== undefined) {
          params.push(updates[key]);
          fields.push(`${column} = $${params.length}`);
        }
      }
      if (!fields.length) fail("NO_CHANGES", "No course changes were supplied");
      params.push(isAdmin(actor.role) ? "Approved" : "Pending");
      fields.push(`approval = $${params.length}::approval_status`);
      fields.push("current_version = current_version + 1", "updated_at = now()");
      const { rows } = await client.query(
        `UPDATE courses SET ${fields.join(", ")} WHERE id = $1 RETURNING *`,
        params
      );
      await client.query(
        `INSERT INTO course_versions (course_id, version, title, description, change_note, created_by)
         VALUES ($1, $2, $3, $4, 'Course updated', $5)`,
        [id, rows[0].current_version, rows[0].title, rows[0].description, actor.id]
      );
      await audit(client, actor.id, "UPDATE_COURSE", id, {
        version: Number(rows[0].current_version),
      });
      return mapCourseAuthorityRow(rows[0]);
    });

  const duplicateCourse = async ({ sourceId, newId, actor }) =>
    db.withTransaction(async (client) => {
      const row = await getRow(sourceId, client, true);
      if (!row) fail("COURSE_NOT_FOUND", "Course not found");
      if (!canManage(actor, row)) fail("FORBIDDEN", "You cannot duplicate this course");
      let inserted;
      try {
        inserted = await client.query(
          `INSERT INTO courses (
             id, title, description, skill, skill_ids, target_level, difficulty,
             estimated_hours, price_cents, currency, category, prerequisites, tags,
             thumbnail_color, content_types, storage_metadata, status, approval,
             owner_id, current_version
           ) SELECT
             $2, title || ' Copy', description, skill, skill_ids, target_level, difficulty,
             estimated_hours, price_cents, currency, category, prerequisites, tags,
             thumbnail_color, content_types, storage_metadata, 'Active', $3::approval_status,
             $4, 1
           FROM courses WHERE id = $1 RETURNING *`,
          [sourceId, newId, isAdmin(actor.role) ? "Approved" : "Pending", actor.id]
        );
      } catch (error) {
        if (error?.code === "23505") fail("COURSE_CONFLICT", "Generated course identifier already exists");
        throw error;
      }
      await client.query(
        `INSERT INTO course_versions (course_id, version, title, description, change_note, created_by)
         VALUES ($1, 1, $2, $3, 'Duplicated course', $4)`,
        [newId, inserted.rows[0].title, inserted.rows[0].description, actor.id]
      );
      await audit(client, actor.id, "DUPLICATE_COURSE", newId, { sourceId });
      return mapCourseAuthorityRow(inserted.rows[0]);
    });

  const reviewCourse = async ({ id, actor, expectedVersion, approval, reason }) => {
    if (!isAdmin(actor?.role)) fail("FORBIDDEN", "Administrator role required");
    return db.withTransaction(async (client) => {
      const row = await getRow(id, client, true);
      if (!row) fail("COURSE_NOT_FOUND", "Course not found");
      assertVersion(row, expectedVersion);
      const { rows } = await client.query(
        `UPDATE courses SET approval = $2::approval_status,
           status = CASE WHEN $2 = 'Rejected' THEN 'Inactive'::lifecycle_status ELSE status END,
           current_version = current_version + 1, updated_at = now()
         WHERE id = $1 RETURNING *`,
        [id, approval]
      );
      await audit(client, actor.id, "COURSE_APPROVAL", id, {
        approval,
        reason,
        version: Number(rows[0].current_version),
      });
      return mapCourseAuthorityRow(rows[0]);
    });
  };

  const setCourseStatus = async ({ id, actor, expectedVersion, status }) => {
    if (!isAdmin(actor?.role)) fail("FORBIDDEN", "Administrator role required");
    return db.withTransaction(async (client) => {
      const row = await getRow(id, client, true);
      if (!row) fail("COURSE_NOT_FOUND", "Course not found");
      assertVersion(row, expectedVersion);
      const { rows } = await client.query(
        `UPDATE courses SET status = $2::lifecycle_status,
           current_version = current_version + 1, updated_at = now()
         WHERE id = $1 RETURNING *`,
        [id, status]
      );
      await audit(client, actor.id, "COURSE_STATUS", id, {
        status,
        version: Number(rows[0].current_version),
      });
      return mapCourseAuthorityRow(rows[0]);
    });
  };

  const selfEnroll = async ({ enrollmentId, courseId, userId }) =>
    db.withTransaction(async (client) => {
      const row = await getRow(courseId, client, true);
      if (!row || row.status !== "Active" || row.approval !== "Approved") {
        fail("COURSE_NOT_FOUND", "Approved course not found");
      }
      if (Number(row.price_cents || 0) > 0) {
        fail("PAYMENT_REQUIRED", "Payment required to enroll in this course", {
          priceCents: Number(row.price_cents),
          currency: row.currency,
        });
      }
      const inserted = await client.query(
        `INSERT INTO enrollments (id, course_id, user_id, assigned_by, status, started_at)
         VALUES ($1, $2, $3, $3, 'Enrolled', now())
         ON CONFLICT (course_id, user_id) DO NOTHING RETURNING *`,
        [enrollmentId, courseId, userId]
      );
      if (inserted.rows[0]) {
        await audit(client, userId, "SELF_ENROLL", courseId);
        return { enrollment: inserted.rows[0], created: true };
      }
      const existing = await client.query(
        "SELECT * FROM enrollments WHERE course_id = $1 AND user_id = $2",
        [courseId, userId]
      );
      return { enrollment: existing.rows[0], created: false };
    });

  const archiveAndDelete = async ({ id, actor, expectedVersion, deletionComment }) =>
    db.withTransaction(async (client) => {
      const row = await getRow(id, client, true);
      if (!row) fail("COURSE_NOT_FOUND", "Course not found");
      if (!canManage(actor, row)) fail("FORBIDDEN", "You cannot delete this course");
      assertVersion(row, expectedVersion);

      const history = await client.query(
        `SELECT
           (SELECT count(*) FROM enrollments WHERE course_id = $1)::integer AS enrollments,
           (SELECT count(*) FROM payment_orders WHERE course_id = $1)::integer AS payment_orders,
           (SELECT count(*) FROM assessment_attempts WHERE course_id = $1)::integer AS attempts,
           (SELECT count(*) FROM issued_certificates WHERE course_id = $1)::integer AS certificates,
           (SELECT count(*) FROM candidate_assessment_links WHERE course_id = $1)::integer AS candidate_links,
           (SELECT count(*) FROM proctor_captures WHERE course_id = $1)::integer AS proctor_captures,
           (SELECT count(*) FROM chapter_feedbacks WHERE course_id = $1)::integer AS feedbacks,
           (SELECT count(*) FROM learning_time_events WHERE course_id = $1)::integer AS time_events`,
        [id]
      );
      const retained = history.rows[0] || {};
      if (Object.values(retained).some((count) => Number(count) > 0)) {
        fail("COURSE_HAS_HISTORY", "Course has retained learner, payment or credential history", retained);
      }

      const related = await client.query(
        `SELECT
           COALESCE((SELECT jsonb_agg(to_jsonb(ch)) FROM chapters ch WHERE ch.course_id = $1), '[]'::jsonb) AS chapters,
           COALESCE((SELECT jsonb_agg(to_jsonb(a)) FROM assessments a WHERE a.course_id = $1), '[]'::jsonb) AS assessments`,
        [id]
      );
      await client.query(
        `INSERT INTO deleted_archives (
           entity_type, entity_id, entity_data, related_data,
           deleted_by, deleted_by_name, deletion_comment
         ) VALUES ('Course', $1, $2::jsonb, $3::jsonb, $4, $5, $6)`,
        [id, JSON.stringify(row), JSON.stringify(related.rows[0] || {}), actor.id, actor.name || "", deletionComment]
      );
      await client.query("DELETE FROM course_approvals WHERE course_id = $1", [id]);
      await client.query("DELETE FROM course_versions WHERE course_id = $1", [id]);
      await client.query("DELETE FROM assessments WHERE course_id = $1", [id]);
      await client.query("DELETE FROM courses WHERE id = $1", [id]);
      await audit(client, actor.id, "DELETE_COURSE", id, { archived: true });
      return { deleted: true, id };
    });

  return {
    listCatalog,
    listVisible,
    findCourseById,
    createCourse,
    updateCourse,
    duplicateCourse,
    reviewCourse,
    setCourseStatus,
    selfEnroll,
    archiveAndDelete,
  };
}

export const courseAuthorityRepository = createCourseAuthorityRepository();
