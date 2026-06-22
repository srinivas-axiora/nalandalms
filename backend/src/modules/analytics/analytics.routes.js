// Module: Analytics (personal/team/org dashboards + time analytics).
// Handlers moved verbatim from server.js; shared deps injected via ctx.
export function registerAnalytics(app, ctx) {
  const { authenticate, requireRole, publicUser, visibleUserIdsFor, buildTimeRows, users, courses, learningTimeEvents } = ctx;

  app.get("/api/analytics/global", authenticate, requireRole("Admin"), (_req, res) => {
    res.json({ users: users.length, activeUsers: users.filter((user) => user.status === "Active").length, courses: courses.length, approvedCourses: courses.filter((course) => course.approval === "Approved").length, completionRate: 78, averageScore: 86, topPerformers: ["Diya Sharma", "Nisha Rao"], lowPerformers: ["Rohan Das"] });
  });

  app.get("/api/analytics/team", authenticate, requireRole("Manager"), (req, res) => {
    const team = users.filter((user) => user.managerId === req.user.id);
    res.json({ managerId: req.user.id, members: team.map(publicUser), completionRate: 74, skillGaps: ["Secure coding", "Data storytelling"], engagement: "Medium-high" });
  });

  app.get("/api/analytics/me", authenticate, (req, res) => {
    res.json({ userId: req.user.id, progress: 76, completedCourses: 9, pendingCourses: 3, strengths: ["Communication", "Compliance"], weaknesses: ["Secure coding"], suggestions: ["Complete Secure Coding for Cloud Teams", "Retake practice quiz"] });
  });

  app.get("/api/analytics/time", authenticate, requireRole("Admin", "Manager"), (req, res) => {
    const rows = buildTimeRows(req.user);
    const summary = rows.reduce((acc, row) => ({
      chapterTimeSeconds: acc.chapterTimeSeconds + (row.chapterTimeSeconds || 0),
      assessmentTimeSeconds: acc.assessmentTimeSeconds + (row.assessmentTimeSeconds || 0),
      courseTimeSeconds: acc.courseTimeSeconds + (row.courseTimeSeconds || 0)
    }), { chapterTimeSeconds: 0, assessmentTimeSeconds: 0, courseTimeSeconds: 0 });
    res.json({
      data: rows,
      total: rows.length,
      eventCount: learningTimeEvents.filter((event) => visibleUserIdsFor(req.user).includes(event.userId)).length,
      summary
    });
  });

  app.get("/api/analytics/time/events", authenticate, requireRole("Admin", "Manager"), (req, res) => {
    const visibleUserIds = visibleUserIdsFor(req.user);
    const limit = Math.min(Number(req.query.limit || 100), 500);
    const data = learningTimeEvents.filter((event) => visibleUserIds.includes(event.userId)).slice(0, limit);
    res.json({ data, total: data.length });
  });
}
