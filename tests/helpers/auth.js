import request from "supertest";
import { app } from "../../backend/server.js";
import { users } from "../../backend/src/core.js";
import { signToken, signStepUpToken } from "../../backend/src/domain.js";

export const testUsers = {
  superAdmin: users.find((u) => u.role === "Super Admin") || { id: "SAnalanda", role: "Super Admin", department: "Administration" },
  admin: users.find((u) => u.role === "Admin") || { id: "EMP-1001", role: "Admin", department: "People Ops" },
  manager: users.find((u) => u.role === "Manager") || { id: "EMP-1003", role: "Manager", department: "Engineering" },
  employee: users.find((u) => u.role === "Employee") || { id: "EMP-1004", role: "Employee", department: "Engineering" },
  learner: { id: "LRN-TEST-1", role: "Learner", name: "Test Learner", email: "learner@test.com", status: "Active" },
  instructor: { id: "INS-TEST-1", role: "Instructor", name: "Test Instructor", email: "instructor@test.com", status: "Active" },
};

export const getCsrfPair = async () => {
  const res = await request(app).get("/api/csrf-token");
  const token = res.body.csrfToken;
  const cookie = res.headers["set-cookie"]?.find((c) => c.startsWith("csrfToken="));
  return { token, cookie: cookie ? cookie.split(";")[0] : `csrfToken=${token}` };
};

export const authCookieFor = (user) => {
  const jwt = signToken(user);
  return `token=${jwt}`;
};

export const stepUpCookieFor = (user) => {
  const jwt = signStepUpToken(user);
  return `stepUpToken=${jwt}`;
};

