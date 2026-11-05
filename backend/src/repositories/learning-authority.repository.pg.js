import { query, withTransaction } from "../db/pool.js";

const iso = (value) => value instanceof Date ? value.toISOString() : value;
const isAdmin = (role) => role === "Admin" || role === "Super Admin";
const asObject = (value) => {
  if (!value) return {};
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return { ...value };
};

export class LearningAuthorityError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "LearningAuthorityError";
    this.code = code;
    this.details = details;
  }
}

const fail = (code, message, details) => {
  throw new LearningAuthorityError(code, message, details);
};

export const mapLearningChapterRow = (row) => row && ({
  id: row.id,
  courseId: row.course_id,
  sequence: Number(row.sequence || 1),
  title: row.title,
  description: row.description || "",
  contentType: row.content_type || "Rich Text",
  body: row.body || "",
  url: row.url || undefined,
  fileName: row.file_name || undefined,
  durationMinutes: Number(row.duration_minutes || 0),
  minimumTimeMinutes: Number(row.minimum_time_minutes ?? 1),
  version: Number(row.version || 1),
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

export const mapLearningEnrollmentRow = (row) => row && ({
  id: row.id,
  courseId: row.course_id,
  userId: row.user_id,
  progress: Number(row.progress || 0),
  completedChapters: row.completed_chapters || [],
  timeSpentMinutes: Number(row.time_spent_minutes || 0),
  timeSpentSeconds: Number(row.time_spent_seconds || 0),
  chapterTimeSpentSeconds: asObject(row.chapter_time_spent_seconds),
  lastHeartbeatTimestamps: asObject(row.chapter_heartbeat_timestamps),
  videoProgress: asObject(row.video_progress),
  lastHeartbeatAt: row.last_heartbeat_at ? iso(row.last_heartbeat_at) : null,
  status: row.status || "Enrolled",
  version: Number(row.version || 0),
  completedAt: row.completed_at ? iso(row.completed_at) : null,
});

const audit = (client, actorId, action, entityType, entityId, metadata = {}) => client.query(
  `INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, metadata)
   VALUES ($1, $2, $3, $4, $5::jsonb)`,
  [actorId || null, action, entityType, entityId, JSON.stringify(metadata)]
);

const canManage = (actor, course) => isAdmin(actor?.role) || course.owner_id === actor?.id;

const assertCourseVersion = (course, expectedVersion) => {
  if (Number(course.current_version) !== Number(expectedVersion)) {
    fail("VERSION_CONFLICT", "Course changed since it was loaded", {
      currentVersion: Number(course.current_version),
    });
  }
};

const assertChapterVersion = (chapter, expectedVersion) => {
  if (Number(chapter.version) !== Number(expectedVersion)) {
    fail("VERSION_CONFLICT", "Chapter changed since it was loaded", {
      currentVersion: Number(chapter.version),
    });
  }
};

const accessFor = ({ chapters, chapterId, enrollment }) => {
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  if (index < 0) return { allowed: false, code: "CHAPTER_NOT_FOUND", message: "Chapter not found" };
  if (!enrollment) return { allowed: false, code: "ENROLLMENT_REQUIRED", message: "You are not enrolled in this course" };
  const completed = enrollment.completed_chapters || [];
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (!completed.includes(chapters[cursor].id)) {
      return {
        allowed: false,
        code: "CHAPTER_LOCKED",
        message: "Prerequisite chapter incomplete",
        requiredChapterId: chapters[cursor].id,
        requiredChapterTitle: chapters[cursor].title,
      };
    }
  }
  return { allowed: true };
};

const responseFrom = ({ chapters, chapter, enrollment, effectiveIncrement, justCompleted = false, replayed = false }) => {
  const completed = enrollment.completed_chapters || [];
  const next = chapters.find((item) => !completed.includes(item.id));
  return {
    ok: true,
    chapterId: chapter.id,
    chapterTimeSeconds: Number(asObject(enrollment.chapter_time_spent_seconds)[chapter.id] || 0),
    isChapterCompleted: completed.includes(chapter.id),
    justCompleted,
    progress: Number(enrollment.progress || 0),
    enrollmentStatus: enrollment.status,
    enrollmentVersion: Number(enrollment.version || 0),
    effectiveIncrement: Number(effectiveIncrement || 0),
    nextChapterId: next?.id || null,
    replayed,
  };
};

export function createLearningAuthorityRepository(db = { query, withTransaction }) {
  const loadCourse = async (client, courseId, lock = "") => {
    const { rows } = await client.query(`SELECT * FROM courses WHERE id = $1${lock}`, [courseId]);
    return rows[0] || null;
  };

  const loadChapters = async (client, courseId) => {
    const { rows } = await client.query(
      "SELECT * FROM chapters WHERE course_id = $1 ORDER BY sequence, created_at, id",
      [courseId]
    );
    return rows;
  };

  const loadEnrollment = async (client, courseId, userId, lock = "") => {
    const { rows } = await client.query(
      `SELECT * FROM enrollments WHERE course_id = $1 AND user_id = $2${lock}`,
      [courseId, userId]
    );
    return rows[0] || null;
  };

  const listForActor = ({ courseId, actor }) => db.withTransaction(async (client) => {
    const course = await loadCourse(client, courseId, " FOR SHARE");
    if (!course) fail("COURSE_NOT_FOUND", "Course not found");
    const privileged = canManage(actor, course);
    const enrollment = privileged ? null : await loadEnrollment(client, courseId, actor.id);
    if (!privileged && (course.status !== "Active" || course.approval !== "Approved")) {
      fail("COURSE_NOT_FOUND", "Published course not found");
    }
    if (!privileged && !enrollment) fail("ENROLLMENT_REQUIRED", "You are not enrolled in this course");
    const chapters = await loadChapters(client, courseId);
    return {
      courseVersion: Number(course.current_version),
      chapters: chapters.map((row) => {
        const chapter = mapLearningChapterRow(row);
        if (privileged) return { ...chapter, isLocked: false, lockReason: null };
        const access = accessFor({ chapters, chapterId: row.id, enrollment });
        if (access.allowed) return { ...chapter, isLocked: false, lockReason: null };
        return {
          id: chapter.id,
          courseId: chapter.courseId,
          sequence: chapter.sequence,
          title: chapter.title,
          description: chapter.description,
          contentType: chapter.contentType,
          durationMinutes: chapter.durationMinutes,
          minimumTimeMinutes: chapter.minimumTimeMinutes,
          version: chapter.version,
          isLocked: true,
          lockReason: access.message,
          requiredChapterId: access.requiredChapterId,
        };
      }),
    };
  });

  const recordCourseVersion = async (client, course, actor, changeNote) => {
    const { rows } = await client.query(
      `UPDATE courses SET current_version = current_version + 1,
         approval = CASE WHEN $2::boolean THEN approval ELSE 'Pending'::approval_status END,
         updated_at = now() WHERE id = $1 RETURNING *`,
      [course.id, isAdmin(actor.role)]
    );
    const updated = rows[0];
    await client.query(
      `INSERT INTO course_versions (course_id, version, title, description, change_note, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [updated.id, updated.current_version, updated.title, updated.description, changeNote, actor.id]
    );
    return updated;
  };

  const createChapter = ({ courseId, actor, expectedCourseVersion, chapter }) =>
    db.withTransaction(async (client) => {
      const course = await loadCourse(client, courseId, " FOR UPDATE");
      if (!course) fail("COURSE_NOT_FOUND", "Course not found");
      if (!canManage(actor, course)) fail("FORBIDDEN", "You cannot manage this course");
      assertCourseVersion(course, expectedCourseVersion);
      const sequence = chapter.sequence ?? Number((await client.query(
        "SELECT COALESCE(max(sequence), 0) + 1 AS next_sequence FROM chapters WHERE course_id = $1",
        [courseId]
      )).rows[0].next_sequence);
      let inserted;
      try {
        inserted = await client.query(
          `INSERT INTO chapters (
             id, course_id, sequence, title, description, content_type, body, url,
             file_name, duration_minutes, minimum_time_minutes, version
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 1)
           RETURNING *`,
          [chapter.id, courseId, sequence, chapter.title, chapter.description || "",
            chapter.contentType || "Rich Text", chapter.body || "", chapter.url || null,
            chapter.fileName || null, chapter.durationMinutes ?? 10,
            chapter.minimumTimeMinutes ?? chapter.durationMinutes ?? 1]
        );
      } catch (error) {
        if (error?.code === "23505") fail("CHAPTER_CONFLICT", "Chapter identifier already exists");
        throw error;
      }
      const updatedCourse = await recordCourseVersion(client, course, actor, `Chapter created: ${chapter.id}`);
      await audit(client, actor.id, "CREATE_CHAPTER", "CHAPTER", chapter.id, {
        courseId,
        courseVersion: Number(updatedCourse.current_version),
      });
      return {
        chapter: mapLearningChapterRow(inserted.rows[0]),
        courseVersion: Number(updatedCourse.current_version),
      };
    });

  const updateChapter = ({ courseId, chapterId, actor, expectedCourseVersion, expectedChapterVersion, updates }) =>
    db.withTransaction(async (client) => {
      const course = await loadCourse(client, courseId, " FOR UPDATE");
      if (!course) fail("COURSE_NOT_FOUND", "Course not found");
      if (!canManage(actor, course)) fail("FORBIDDEN", "You cannot manage this course");
      assertCourseVersion(course, expectedCourseVersion);
      const found = await client.query(
        "SELECT * FROM chapters WHERE id = $1 AND course_id = $2 FOR UPDATE",
        [chapterId, courseId]
      );
      const existing = found.rows[0];
      if (!existing) fail("CHAPTER_NOT_FOUND", "Chapter not found");
      assertChapterVersion(existing, expectedChapterVersion);
      const fields = [];
      const params = [chapterId, courseId];
      const allowed = {
        sequence: "sequence", title: "title", description: "description",
        contentType: "content_type", body: "body", url: "url", fileName: "file_name",
        durationMinutes: "duration_minutes", minimumTimeMinutes: "minimum_time_minutes",
      };
      for (const [key, column] of Object.entries(allowed)) {
        if (updates[key] !== undefined) {
          params.push(updates[key]);
          fields.push(`${column} = $${params.length}`);
        }
      }
      if (!fields.length) fail("NO_CHANGES", "No chapter changes were supplied");
      fields.push("version = version + 1", "updated_at = now()");
      const { rows } = await client.query(
        `UPDATE chapters SET ${fields.join(", ")} WHERE id = $1 AND course_id = $2 RETURNING *`,
        params
      );
      const updatedCourse = await recordCourseVersion(client, course, actor, `Chapter updated: ${chapterId}`);
      await audit(client, actor.id, "UPDATE_CHAPTER", "CHAPTER", chapterId, {
        courseId,
        chapterVersion: Number(rows[0].version),
        courseVersion: Number(updatedCourse.current_version),
      });
      return {
        chapter: mapLearningChapterRow(rows[0]),
        courseVersion: Number(updatedCourse.current_version),
      };
    });

  const recordHeartbeat = ({ courseId, chapterId, userId, idempotencyKey, incrementSeconds, currentPositionSeconds = 0 }) =>
    db.withTransaction(async (client) => {
      const course = await loadCourse(client, courseId, " FOR SHARE");
      if (!course || course.status !== "Active" || course.approval !== "Approved") {
        fail("COURSE_NOT_FOUND", "Published course not found");
      }
      const enrollmentRow = await loadEnrollment(client, courseId, userId, " FOR UPDATE");
      if (!enrollmentRow) fail("ENROLLMENT_REQUIRED", "You are not enrolled in this course");
      const chapters = await loadChapters(client, courseId);
      const chapter = chapters.find((item) => item.id === chapterId);
      if (!chapter) fail("CHAPTER_NOT_FOUND", "Chapter not found");
      const access = accessFor({ chapters, chapterId, enrollment: enrollmentRow });
      if (!access.allowed) fail(access.code, access.message, access);

      const prior = await client.query(
        `SELECT * FROM learning_time_events
         WHERE user_id = $1 AND course_id = $2 AND idempotency_key = $3`,
        [userId, courseId, idempotencyKey]
      );
      if (prior.rows[0]) {
        if (prior.rows[0].chapter_id !== chapterId) {
          fail("IDEMPOTENCY_CONFLICT", "Idempotency key was already used for another chapter");
        }
        return responseFrom({
          chapters,
          chapter,
          enrollment: enrollmentRow,
          effectiveIncrement: prior.rows[0].seconds_spent,
          replayed: true,
        });
      }

      const dbClock = await client.query("SELECT clock_timestamp() AS server_now");
      const serverNow = new Date(dbClock.rows[0].server_now);
      const claimed = Math.min(30, Math.max(1, Math.round(Number(incrementSeconds) || 15)));
      const heartbeatTimestamps = asObject(enrollmentRow.chapter_heartbeat_timestamps);
      const previous = heartbeatTimestamps[chapterId] ? new Date(heartbeatTimestamps[chapterId]) : null;
      let effective = Math.min(claimed, 15);
      if (previous && Number.isFinite(previous.getTime())) {
        const elapsed = Math.max(0, Math.floor((serverNow.getTime() - previous.getTime()) / 1000));
        effective = Math.min(claimed, elapsed);
        if (effective < 1) fail("HEARTBEAT_TOO_SOON", "Heartbeat arrived before measurable server time elapsed", { retryAfterSeconds: 1 });
      }

      const chapterTimes = asObject(enrollmentRow.chapter_time_spent_seconds);
      const video = asObject(enrollmentRow.video_progress);
      const priorVideo = asObject(video[chapterId]);
      chapterTimes[chapterId] = Number(chapterTimes[chapterId] || 0) + effective;
      heartbeatTimestamps[chapterId] = serverNow.toISOString();
      video[chapterId] = {
        currentTime: Math.max(0, Number(currentPositionSeconds) || 0),
        maxPositionSeconds: Math.max(Number(priorVideo.maxPositionSeconds || priorVideo.currentTime || 0), Number(currentPositionSeconds) || 0),
        updatedAt: serverNow.toISOString(),
      };

      const completed = [...(enrollmentRow.completed_chapters || [])];
      const threshold = Math.max(10, Math.round(Number(chapter.minimum_time_minutes ?? chapter.duration_minutes ?? 1) * 60));
      const justCompleted = chapterTimes[chapterId] >= threshold && !completed.includes(chapterId);
      if (justCompleted) completed.push(chapterId);
      const completedCount = chapters.filter((item) => completed.includes(item.id)).length;
      const progress = chapters.length ? Math.round((completedCount / chapters.length) * 100) : 100;
      let status = enrollmentRow.status === "Enrolled" ? "InProgress" : enrollmentRow.status;
      let completedAt = enrollmentRow.completed_at;
      if (chapters.length && completedCount === chapters.length) {
        const assessments = await client.query(
          `SELECT count(*)::integer AS count FROM assessments
           WHERE course_id = $1 AND approval = 'Approved' AND status = 'Active'`,
          [courseId]
        );
        if (Number(assessments.rows[0].count) > 0) status = "AssessmentEligible";
        else {
          status = "Passed";
          completedAt = completedAt || serverNow;
        }
      }
      const totalSeconds = Number(enrollmentRow.time_spent_seconds || 0) + effective;
      const updated = await client.query(
        `UPDATE enrollments SET progress = $3, completed_chapters = $4,
           time_spent_seconds = $5, time_spent_minutes = $6,
           chapter_time_spent_seconds = $7::jsonb,
           chapter_heartbeat_timestamps = $8::jsonb, video_progress = $9::jsonb,
           last_heartbeat_at = $10, status = $11, completed_at = $12,
           version = version + 1
         WHERE course_id = $1 AND user_id = $2 RETURNING *`,
        [courseId, userId, progress, completed, totalSeconds, Math.ceil(totalSeconds / 60),
          JSON.stringify(chapterTimes), JSON.stringify(heartbeatTimestamps), JSON.stringify(video),
          serverNow, status, completedAt]
      );
      await client.query(
        `INSERT INTO chapter_time_totals (
           user_id, course_id, chapter_id, time_spent_seconds, first_recorded_at, last_recorded_at
         ) VALUES ($1, $2, $3, $4, $5, $5)
         ON CONFLICT (user_id, course_id, chapter_id) DO UPDATE SET
           time_spent_seconds = chapter_time_totals.time_spent_seconds + EXCLUDED.time_spent_seconds,
           last_recorded_at = EXCLUDED.last_recorded_at`,
        [userId, courseId, chapterId, effective, serverNow]
      );
      await client.query(
        `INSERT INTO learning_time_events (
           user_id, course_id, chapter_id, event_type, seconds_spent,
           idempotency_key, claimed_seconds, recorded_at
         ) VALUES ($1, $2, $3, 'CHAPTER_TIME', $4, $5, $6, $7)`,
        [userId, courseId, chapterId, effective, idempotencyKey, Number(incrementSeconds) || 15, serverNow]
      );
      if (effective < Number(incrementSeconds || 15)) {
        await audit(client, userId, "HEARTBEAT_SPEEDRUN_CLAMPED", "CHAPTER", chapterId, {
          courseId,
          claimed: Number(incrementSeconds) || 15,
          effective,
        });
      }
      if (justCompleted) {
        await audit(client, userId, "COMPLETE_CHAPTER", "CHAPTER", chapterId, { courseId });
      }
      return responseFrom({ chapters, chapter, enrollment: updated.rows[0], effectiveIncrement: effective, justCompleted });
    });

  const recordVideoProgress = ({ courseId, chapterId, userId, currentTime }) =>
    db.withTransaction(async (client) => {
      const course = await loadCourse(client, courseId, " FOR SHARE");
      if (!course || course.status !== "Active" || course.approval !== "Approved") {
        fail("COURSE_NOT_FOUND", "Published course not found");
      }
      const enrollment = await loadEnrollment(client, courseId, userId, " FOR UPDATE");
      if (!enrollment) fail("ENROLLMENT_REQUIRED", "You are not enrolled in this course");
      const chapters = await loadChapters(client, courseId);
      const chapter = chapters.find((item) => item.id === chapterId);
      if (!chapter) fail("CHAPTER_NOT_FOUND", "Chapter not found");
      const access = accessFor({ chapters, chapterId, enrollment });
      if (!access.allowed) fail(access.code, access.message, access);
      const clock = await client.query("SELECT clock_timestamp() AS server_now");
      const video = asObject(enrollment.video_progress);
      const prior = asObject(video[chapterId]);
      video[chapterId] = {
        currentTime,
        maxPositionSeconds: Math.max(Number(prior.maxPositionSeconds || prior.currentTime || 0), currentTime),
        updatedAt: iso(clock.rows[0].server_now),
      };
      const { rows } = await client.query(
        `UPDATE enrollments SET video_progress = $3::jsonb, version = version + 1
         WHERE course_id = $1 AND user_id = $2 RETURNING *`,
        [courseId, userId, JSON.stringify(video)]
      );
      return {
        ok: true,
        currentTime,
        maxPositionSeconds: video[chapterId].maxPositionSeconds,
        enrollmentVersion: Number(rows[0].version),
      };
    });

  const getProgress = ({ courseId, chapterId, userId }) => db.withTransaction(async (client) => {
    const course = await loadCourse(client, courseId, " FOR SHARE");
    if (!course || course.status !== "Active" || course.approval !== "Approved") fail("COURSE_NOT_FOUND", "Published course not found");
    const enrollment = await loadEnrollment(client, courseId, userId);
    if (!enrollment) fail("ENROLLMENT_REQUIRED", "You are not enrolled in this course");
    const chapters = await loadChapters(client, courseId);
    const chapter = chapters.find((item) => item.id === chapterId);
    if (!chapter) fail("CHAPTER_NOT_FOUND", "Chapter not found");
    const access = accessFor({ chapters, chapterId, enrollment });
    if (!access.allowed) fail(access.code, access.message, access);
    const video = asObject(asObject(enrollment.video_progress)[chapterId]);
    const seconds = Number(asObject(enrollment.chapter_time_spent_seconds)[chapterId] || 0);
    const minimum = Math.max(0, Math.round(Number(chapter.minimum_time_minutes || 0) * 60));
    return {
      currentTime: Number(video.currentTime || 0),
      maxPositionSeconds: Number(video.maxPositionSeconds || video.currentTime || 0),
      chapterTimeSeconds: seconds,
      minimumTimeSeconds: minimum,
      minimumTimeMet: seconds >= minimum,
      enrollmentVersion: Number(enrollment.version || 0),
    };
  });

  return { listForActor, createChapter, updateChapter, recordHeartbeat, recordVideoProgress, getProgress };
}

export const learningAuthorityRepository = createLearningAuthorityRepository();
