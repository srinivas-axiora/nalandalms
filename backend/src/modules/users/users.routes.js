// Module: Users & org management (preferences, CRUD, status, delete).
// Handlers moved verbatim from server.js; shared deps injected via ctx.
import { z } from "zod";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { users, isAdmin, sessionVersions, archives, roles, now } from "../../core.js";
import { audit, publicUser } from "../../domain.js";
import { authenticate, requireRole, requireStepUp } from "../../middleware.js";
import { redactSensitive } from "../../security/redaction.js";
import { identityRepository } from "../../repositories/identity.repository.pg.js";
import { upsertIdentityProjection } from "../../identity-projection.js";
import { relationalIdentityEnabled } from "../../runtime-modes.js";

const USE_RELATIONAL_IDENTITY = relationalIdentityEnabled();

export function registerUsers(app) {
  app.patch("/api/users/me/preferences", authenticate, async (req, res) => {
    const schema = z.object({
      theme: z.enum(["dark", "light", "system"]).optional(),
      fontSize: z.enum(["small", "medium", "large"]).optional(),
      language: z.enum(["en", "hi", "ta"]).optional(),
      emailNotifications: z.boolean().optional(),
      pushNotifications: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
      courseReminders: z.boolean().optional(),
      reducedMotion: z.boolean().optional(),
      highContrast: z.boolean().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    let user = null;
    if (USE_RELATIONAL_IDENTITY) {
      try {
        user = await identityRepository.findUserById(req.user.id);
      } catch (err) {
        console.warn("[users:prefs] relational findUserById warning:", err?.message || err);
      }
    }
    if (!user) {
      user = users.find((item) => item.id === req.user.id);
    }
    if (!user) return res.status(404).json({ error: "User not found" });

    const preferences = { ...(user.preferences || {}), ...parsed.data };
    if (USE_RELATIONAL_IDENTITY) {
      try {
        const updated = await identityRepository.updateUser(user.id, { preferences }, {
          actorId: req.user.id,
          action: "UPDATE_PREFERENCES",
        });
        if (updated) {
          upsertIdentityProjection(updated);
          return res.json({ data: publicUser(updated) });
        }
      } catch (err) {
        console.warn("[users:prefs] relational updateUser warning:", err?.message || err);
      }
    }
    user.preferences = preferences;
    audit(req.user.id, "UPDATE_PREFERENCES", "USER", user.id, parsed.data);
    return res.json({ data: publicUser(user) });
  });

  app.get("/api/users", authenticate, requireRole("Admin", "Manager"), async (req, res) => {
    const { department, role, status = "Active" } = req.query;
    if (USE_RELATIONAL_IDENTITY) {
      try {
        const visible = await identityRepository.listUsers({
          ...(!isAdmin(req.user.role) ? { managerId: req.user.id } : {}),
          department,
          role,
          status,
        });
        if (visible && visible.length > 0) {
          return res.json({ data: visible.map(publicUser), total: visible.length });
        }
      } catch (err) {
        console.warn("[users:list] relational listUsers warning:", err?.message || err);
      }
    }
    let visible = isAdmin(req.user.role) ? users : users.filter((user) => user.managerId === req.user.id || user.id === req.user.id);
    if (department) visible = visible.filter((user) => user.department === department);
    if (role) visible = visible.filter((user) => user.role === role);
    if (status !== "All") visible = visible.filter((user) => user.status === status);
    res.json({ data: visible.map(publicUser), total: visible.length });
  });

  app.post("/api/users", authenticate, requireRole("Admin"), requireStepUp, async (req, res) => {
    const schema = z.object({
      id: z.string().min(2).optional(),
      name: z.string().min(2),
      email: z.string().email(),
      department: z.string().min(2),
      team: z.string().min(2).optional(),
      designation: z.string().min(2).optional(),
      role: z.enum(roles),
      managerId: z.string().nullable().optional(),
      status: z.enum(["Active", "Inactive"]).optional(),
      joinedAt: z.string().optional(),
      password: z.string().min(8)
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (parsed.data.role === "Super Admin" && req.user.role !== "Super Admin") {
      return res.status(403).json({ error: "Only a Super Admin can assign the Super Admin role" });
    }
    const requestedId = parsed.data.id || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const existing = USE_RELATIONAL_IDENTITY
      ? (await identityRepository.findUserById(requestedId))
        || (await identityRepository.findUserByIdentifier(parsed.data.email))
      : users.find((item) => item.id === requestedId || item.email === parsed.data.email);
    if (existing) {
      return res.status(409).json({ error: "User ID or email already exists" });
    }
    const user = { id: requestedId, ...parsed.data, status: parsed.data.status || "Active", passwordHash: bcrypt.hashSync(parsed.data.password, 10), createdAt: now() };
    delete user.password;
    if (USE_RELATIONAL_IDENTITY) {
      try {
        const created = await identityRepository.insertUser(user, { actorId: req.user.id });
        upsertIdentityProjection(created);
        return res.status(201).json({ data: publicUser(created) });
      } catch (error) {
        if (error?.code === "23505") return res.status(409).json({ error: "User ID or email already exists" });
        throw error;
      }
    }
    users.push(user);
    sessionVersions[user.id] = 0;
    audit(req.user.id, "CREATE_USER", "USER", user.id, { role: user.role });
    return res.status(201).json({ data: publicUser(user) });
  });

  app.patch("/api/users/:id", authenticate, requireRole("Admin"), requireStepUp, async (req, res) => {
    const schema = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      department: z.string().min(2).optional(),
      team: z.string().min(2).optional(),
      designation: z.string().min(2).optional(),
      role: z.enum(roles).optional(),
      managerId: z.string().nullable().optional(),
      status: z.enum(["Active", "Inactive"]).optional(),
      joinedAt: z.string().optional(),
      password: z.string().min(8).optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const user = USE_RELATIONAL_IDENTITY
      ? await identityRepository.findUserById(req.params.id)
      : users.find((item) => item.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "Super Admin" && req.user.role !== "Super Admin") {
      return res.status(403).json({ error: "Only a Super Admin can modify a Super Admin account" });
    }
    if (parsed.data.role === "Super Admin" && req.user.role !== "Super Admin") {
      return res.status(403).json({ error: "Only a Super Admin can grant the Super Admin role" });
    }
    if (user.id === req.user.id && parsed.data.role && parsed.data.role !== user.role) {
      return res.status(403).json({ error: "You cannot change your own role" });
    }
    if (user.id === req.user.id && parsed.data.status === "Inactive") {
      return res.status(403).json({ error: "You cannot deactivate your own account" });
    }

    const patch = { ...parsed.data };
    if (patch.password) {
      patch.passwordHash = bcrypt.hashSync(patch.password, 10);
      delete patch.password;
    }
    if (USE_RELATIONAL_IDENTITY) {
      const updated = await identityRepository.updateUser(user.id, patch, { actorId: req.user.id });
      upsertIdentityProjection(updated);
      return res.json({ data: publicUser(updated) });
    }
    const revokesSessions = Boolean(
      parsed.data.password
      || (parsed.data.role && parsed.data.role !== user.role)
      || (parsed.data.status === "Inactive" && user.status === "Active")
    );
    if (revokesSessions) sessionVersions[user.id] = (sessionVersions[user.id] || 0) + 1;
    Object.assign(user, patch);
    audit(req.user.id, "UPDATE_USER", "USER", user.id, patch);
    return res.json({ data: publicUser(user) });
  });

  app.patch("/api/users/:id/status", authenticate, requireRole("Admin"), requireStepUp, async (req, res) => {
    const schema = z.object({ status: z.enum(["Active", "Inactive"]) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    const user = USE_RELATIONAL_IDENTITY
      ? await identityRepository.findUserById(req.params.id)
      : users.find((item) => item.id === req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "Super Admin" && req.user.role !== "Super Admin") {
      return res.status(403).json({ error: "Only a Super Admin can modify a Super Admin account" });
    }
    if (user.id === req.user.id && parsed.data.status === "Inactive") {
      return res.status(403).json({ error: "You cannot deactivate your own account" });
    }

    if (USE_RELATIONAL_IDENTITY) {
      const updated = await identityRepository.updateUser(user.id, { status: parsed.data.status }, {
        actorId: req.user.id,
        action: "CHANGE_USER_STATUS",
      });
      upsertIdentityProjection(updated);
      return res.json({ data: publicUser(updated), note: "Session revoked if inactivated." });
    }
    if (parsed.data.status === "Inactive" && user.status === "Active") {
      sessionVersions[user.id] = (sessionVersions[user.id] || 0) + 1;
    }
    user.status = parsed.data.status;

    audit(req.user.id, "CHANGE_USER_STATUS", "USER", user.id, parsed.data);
    res.json({ data: publicUser(user), note: "Session revoked if inactivated." });
  });

  app.delete("/api/users/:id", authenticate, requireRole("Super Admin"), requireStepUp, async (req, res) => {
    const schema = z.object({ deletionComment: z.string().min(10) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    if (req.params.id === req.user.id) {
      return res.status(403).json({ error: "You cannot archive your own account" });
    }
    if (USE_RELATIONAL_IDENTITY) {
      const archived = await identityRepository.archiveAndDeactivateUser({
        id: req.params.id,
        actor: req.user,
        deletionComment: parsed.data.deletionComment,
        replacementPasswordHash: bcrypt.hashSync(uuid(), 10),
      });
      if (!archived) return res.status(404).json({ error: "User not found" });
      upsertIdentityProjection(archived);
      return res.json({ success: true, message: "User archived, credentials revoked and account deactivated" });
    }
    const idx = users.findIndex((item) => item.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "User not found" });
    const user = users[idx];

    // Revoke session
    sessionVersions[user.id] = (sessionVersions[user.id] || 0) + 1;

    archives.unshift({
      id: uuid(),
      entityType: "User",
      entityId: user.id,
      entityData: redactSensitive(user),
      deletedBy: req.user.id,
      deletedByName: req.user.name,
      deletionComment: parsed.data.deletionComment,
      deletedAt: now()
    });

    users.splice(idx, 1);
    audit(req.user.id, "DELETE_USER", "USER", user.id);
    res.json({ success: true, message: "User permanently deleted and archived" });
  });
}
