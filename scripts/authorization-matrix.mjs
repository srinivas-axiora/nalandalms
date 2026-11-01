import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HTTP_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]);
const ROLE_ALIASES = Object.freeze({
  SA: "Super Admin",
  A: "Admin",
  M: "Manager",
  I: "Instructor",
  E: "Employee",
  L: "Learner",
});

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
export const defaultMatrixPath = path.resolve(
  scriptDirectory,
  "../docs/SECURITY-ATTACK-SURFACE.md",
);

function stripCode(value) {
  return value.replace(/^`|`$/g, "").trim();
}

function parseAuthentication(authCell) {
  if (authCell === "Public") return { authentication: "none", requiredRoles: [] };
  if (authCell === "Public token") return { authentication: "share-token", requiredRoles: [] };
  if (authCell === "Public attempt token") return { authentication: "attempt-token", requiredRoles: [] };
  if (authCell === "Any") return { authentication: "session", requiredRoles: ["*"] };

  const requiredRoles = authCell
    .split("/")
    .map((token) => ROLE_ALIASES[token.trim()])
    .filter(Boolean);

  if (requiredRoles.length === 0) {
    throw new Error(`Unsupported authorization declaration: ${authCell}`);
  }
  return { authentication: "session", requiredRoles };
}

function parseCsrf(value) {
  if (value === "Y") return "required";
  if (value === "Exempt") return "exempt";
  if (value === "N/A") return "not-applicable";
  throw new Error(`Unsupported CSRF declaration: ${value}`);
}

export function parseAuthorizationMatrix(markdown) {
  const inventory = [];
  let section = "Uncategorized";

  for (const rawLine of markdown.split(/\r?\n/)) {
    if (rawLine.startsWith("## ")) {
      section = rawLine.slice(3).trim();
      continue;
    }
    if (!rawLine.startsWith("|")) continue;

    const cells = rawLine
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length !== 8 || !HTTP_METHODS.has(cells[0])) continue;

    const [method, rawRoute, auth, state, csrf, step, rateLimit, resourceOwnership] = cells;
    const route = stripCode(rawRoute);
    const identity = parseAuthentication(auth);
    inventory.push({
      key: `${method} ${route}`,
      method,
      path: route,
      section,
      authentication: identity.authentication,
      requiredRoles: identity.requiredRoles,
      stateChanging: state === "Y" || state === "Cookie",
      csrf: parseCsrf(csrf),
      stepUp: step === "Y",
      rateLimit,
      resourceOwnership,
    });
  }

  return inventory;
}

export function loadAuthorizationMatrix(matrixPath = defaultMatrixPath) {
  return parseAuthorizationMatrix(fs.readFileSync(matrixPath, "utf8"));
}

export function registeredExpressRoutes(app) {
  const routes = [];
  for (const layer of app.router?.stack || []) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      routes.push({
        key: `${method.toUpperCase()} ${layer.route.path}`,
        method: method.toUpperCase(),
        path: layer.route.path,
        middleware: layer.route.stack.map((routeLayer) => routeLayer.name),
      });
    }
  }
  return routes;
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const inventory = loadAuthorizationMatrix();
  if (process.argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify(inventory, null, 2)}\n`);
  } else {
    process.stdout.write(`${inventory.length} route policies loaded from ${defaultMatrixPath}\n`);
  }
}
