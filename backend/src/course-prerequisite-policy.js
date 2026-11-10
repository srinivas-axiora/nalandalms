const normalizedIds = (ids = []) => [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))];

const toCourse = (course) => ({
  id: String(course.id),
  prerequisites: normalizedIds(course.prerequisites || []),
  status: course.status,
  approval: course.approval,
});

export const validateCoursePrerequisites = ({
  courseId,
  prerequisiteIds = [],
  courses = [],
  requireAvailable = false,
}) => {
  const prerequisites = normalizedIds(prerequisiteIds);
  const graph = new Map(courses.map(toCourse).map((course) => [course.id, course]));
  graph.set(courseId, {
    ...(graph.get(courseId) || { id: courseId }),
    prerequisites,
  });

  const missingPrerequisiteIds = prerequisites.filter((id) => !courses.some((course) => String(course.id) === id));
  if (missingPrerequisiteIds.length) {
    return { valid: false, code: "COURSE_PREREQUISITE_NOT_FOUND", details: { missingPrerequisiteIds } };
  }

  const unavailablePrerequisiteIds = requireAvailable
    ? prerequisites.filter((id) => {
      const course = graph.get(id);
      return course?.status !== "Active" || course?.approval !== "Approved";
    })
    : [];
  if (unavailablePrerequisiteIds.length) {
    return { valid: false, code: "COURSE_PREREQUISITE_UNAVAILABLE", details: { unavailablePrerequisiteIds } };
  }

  const visit = (id, path, visiting) => {
    if (visiting.has(id)) return [...path, id];
    const nextVisiting = new Set(visiting).add(id);
    for (const next of graph.get(id)?.prerequisites || []) {
      const cycle = visit(next, [...path, id], nextVisiting);
      if (cycle) return cycle;
    }
    return null;
  };
  const cycle = visit(courseId, [], new Set());
  if (cycle) return { valid: false, code: "COURSE_PREREQUISITE_CYCLE", details: { cycle } };

  return { valid: true, prerequisites };
};

export const activeDependentCourseIds = ({ courseId, courses = [] }) => courses
  .filter((course) => (
    course.status === "Active"
    && course.approval === "Approved"
    && normalizedIds(course.prerequisites || []).includes(courseId)
  ))
  .map((course) => String(course.id));
