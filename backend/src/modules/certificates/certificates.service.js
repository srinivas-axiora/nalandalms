// L7 — Service: business logic for certificates (role scoping + issuance).
// Behavior is preserved verbatim from the original inline routes.
export function createCertificatesService({ repo, audit, now }) {
  const listForUser = (user) => {
    let visible = repo.all();
    if (user.role === "Manager") {
      const teamIds = repo.teamMemberIds(user.id);
      visible = visible.filter((cert) => cert.employeeId === user.id || teamIds.has(cert.employeeId));
    } else if (user.role === "Employee") {
      visible = visible.filter((cert) => cert.employeeId === user.id);
    }
    return visible;
  };

  const issue = (actor, data) => {
    const employee = repo.findUser(data.employeeId);
    const course = repo.findCourse(data.courseId);
    if (!employee || !course) return { status: 404, error: "Employee or Course not found" };

    const cert = {
      id: `CERT-${Math.floor(1000 + Math.random() * 9000)}`,
      ...data,
      issuedBy: actor.id,
      issuedByName: actor.name,
      issuedAt: now(),
    };
    repo.add(cert);
    audit(actor.id, "ISSUE_CERTIFICATE", "CERTIFICATE", cert.id, { employeeId: cert.employeeId, courseId: cert.courseId });
    return { status: 201, data: cert };
  };

  return { listForUser, issue };
}
