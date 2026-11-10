-- Phase 68 — course prerequisite graph integrity.

CREATE OR REPLACE FUNCTION enforce_course_prerequisite_graph()
RETURNS trigger AS $$
DECLARE
  invalid_ids TEXT[];
  dependent_ids TEXT[];
  has_cycle BOOLEAN;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('nalanda:course-prerequisite-graph'));

  IF TG_OP = 'DELETE' THEN
    SELECT array_agg(id ORDER BY id) INTO dependent_ids
    FROM courses
    WHERE OLD.id = ANY(prerequisites)
      AND status = 'Active' AND approval = 'Approved';
    IF cardinality(dependent_ids) > 0 THEN
      RAISE EXCEPTION USING ERRCODE = '23514', CONSTRAINT = 'course_prerequisite_in_use',
        MESSAGE = 'course is required by an active approved course';
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.id = ANY(NEW.prerequisites) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', CONSTRAINT = 'course_prerequisite_cycle',
      MESSAGE = 'course prerequisite graph contains a self-cycle';
  END IF;
  IF cardinality(NEW.prerequisites) <> (
    SELECT count(DISTINCT prerequisite_id) FROM unnest(NEW.prerequisites) prerequisite_id
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '23514', CONSTRAINT = 'course_prerequisite_duplicate',
      MESSAGE = 'course prerequisites must be unique';
  END IF;

  SELECT array_agg(prerequisite_id ORDER BY prerequisite_id) INTO invalid_ids
  FROM unnest(NEW.prerequisites) prerequisite_id
  LEFT JOIN courses prerequisite ON prerequisite.id = prerequisite_id
  WHERE prerequisite.id IS NULL;
  IF cardinality(invalid_ids) > 0 THEN
    RAISE EXCEPTION USING ERRCODE = '23503', CONSTRAINT = 'course_prerequisite_exists',
      MESSAGE = 'course prerequisite does not exist';
  END IF;

  WITH RECURSIVE walk(id, path, cycle) AS (
    SELECT prerequisite_id, ARRAY[NEW.id, prerequisite_id], prerequisite_id = NEW.id
    FROM unnest(NEW.prerequisites) prerequisite_id
    UNION ALL
    SELECT next_id, walk.path || next_id, next_id = ANY(walk.path)
    FROM walk
    JOIN courses current_course ON current_course.id = walk.id
    CROSS JOIN LATERAL unnest(current_course.prerequisites) next_id
    WHERE NOT walk.cycle
  )
  SELECT COALESCE(bool_or(cycle), false) INTO has_cycle FROM walk;
  IF has_cycle THEN
    RAISE EXCEPTION USING ERRCODE = '23514', CONSTRAINT = 'course_prerequisite_cycle',
      MESSAGE = 'course prerequisite graph contains a cycle';
  END IF;

  IF NEW.status = 'Active' AND NEW.approval = 'Approved' THEN
    SELECT array_agg(prerequisite.id ORDER BY prerequisite.id) INTO invalid_ids
    FROM courses prerequisite
    WHERE prerequisite.id = ANY(NEW.prerequisites)
      AND (prerequisite.status <> 'Active' OR prerequisite.approval <> 'Approved');
    IF cardinality(invalid_ids) > 0 THEN
      RAISE EXCEPTION USING ERRCODE = '23514', CONSTRAINT = 'course_prerequisite_unavailable',
        MESSAGE = 'active approved course requires active approved prerequisites';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE'
     AND (NEW.status <> 'Active' OR NEW.approval <> 'Approved') THEN
    SELECT array_agg(id ORDER BY id) INTO dependent_ids
    FROM courses
    WHERE id <> NEW.id AND NEW.id = ANY(prerequisites)
      AND status = 'Active' AND approval = 'Approved';
    IF cardinality(dependent_ids) > 0 THEN
      RAISE EXCEPTION USING ERRCODE = '23514', CONSTRAINT = 'course_prerequisite_in_use',
        MESSAGE = 'course is required by an active approved course';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_course_prerequisite_graph ON courses;
CREATE TRIGGER trg_course_prerequisite_graph
BEFORE INSERT OR UPDATE OF prerequisites, status, approval OR DELETE ON courses
FOR EACH ROW EXECUTE FUNCTION enforce_course_prerequisite_graph();

-- Validate historical rows through the same policy before permitting release.
UPDATE courses SET prerequisites = prerequisites;
