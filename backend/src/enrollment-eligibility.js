const completionStatuses = new Set(["Passed", "Certified", "Completed"]);

export const enrollmentIsComplete = (enrollment) => Boolean(
  enrollment
  && (
    completionStatuses.has(String(enrollment.status || ""))
    || Number(enrollment.progress || 0) >= 100
    || enrollment.completedAt
    || enrollment.completed_at
  )
);

export const unmetPrerequisiteIds = ({ prerequisites = [], enrollments = [], userId }) => {
  const completed = new Set(
    enrollments
      .filter((enrollment) => enrollment.userId === userId && enrollmentIsComplete(enrollment))
      .map((enrollment) => enrollment.courseId),
  );
  return [...new Set(prerequisites)].filter((courseId) => !completed.has(courseId));
};

export const assertSnapshotEnrollmentEligibility = ({ course, enrollments, userId }) => {
  const unmet = unmetPrerequisiteIds({
    prerequisites: course.prerequisites || [],
    enrollments,
    userId,
  });
  return unmet.length ? { eligible: false, unmetPrerequisiteIds: unmet } : { eligible: true, unmetPrerequisiteIds: [] };
};
