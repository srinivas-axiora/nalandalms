// L8 — Repository: data access for certificates over the shared store.
// `store` holds live references to the in-memory collections (issuedCertificates,
// users, courses). During the strangler migration these are injected; once the
// persistence layer is fully extracted they will be imported from store.js.
export function createCertificatesRepository(store) {
  return {
    all: () => store.issuedCertificates,
    add: (cert) => { store.issuedCertificates.unshift(cert); return cert; },
    findUser: (id) => store.users.find((u) => u.id === id),
    findCourse: (id) => store.courses.find((c) => c.id === id),
    teamMemberIds: (managerId) =>
      new Set(store.users.filter((u) => u.managerId === managerId).map((u) => u.id)),
  };
}
