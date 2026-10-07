// Apply the Drizzle migrations in drizzle/ to a D1 database.
//   npm run db:migrate:local        local dev database (.wrangler/state)
//   npm run db:migrate:staging      framepath-staging-db
//   npm run db:migrate:production   framepath-db
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const where = process.argv[2];
const root = fileURLToPath(new URL("../", import.meta.url));
const targets = JSON.parse(readFileSync(path.join(root, "deploy-targets.json"), "utf8"));
const migrationsDir = path.join(root, "drizzle");

// Local dev uses the placeholder database from vite.config.ts.
const database = where === "local"
  ? { name: "site-creator-d1", id: "00000000-0000-4000-8000-000000000000" }
  : targets[where]?.d1;
if (!database) {
  console.error(`Usage: node scripts/migrate.mjs <local|${Object.keys(targets).join("|")}>`);
  process.exit(1);
}

const config = path.join(mkdtempSync(path.join(tmpdir(), "framepath-migrate-")), "wrangler.json");
writeFileSync(config, JSON.stringify({
  name: "framepath-migrate",
  compatibility_date: "2025-01-01",
  d1_databases: [{ binding: "DB", database_name: database.name, database_id: database.id, migrations_dir: migrationsDir }],
}));

const args = ["wrangler", "d1", "migrations", "apply", "DB", "--config", config,
  ...(where === "local" ? ["--local", "--persist-to", path.join(root, ".wrangler/state")] : ["--remote"])];
const result = spawnSync("npx", args, { stdio: "inherit", cwd: root, shell: process.platform === "win32" });
process.exit(result.status ?? 1);
