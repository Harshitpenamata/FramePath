// Build and deploy to a self-hosted target from deploy-targets.json.
//   npm run deploy:staging      any branch, for testing changes (e.g. AI prompts)
//   npm run deploy:production   only from a clean main that matches origin/main
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const env = process.argv[2];
const targets = JSON.parse(readFileSync(new URL("../deploy-targets.json", import.meta.url), "utf8"));
const target = targets[env];
if (!target) {
  console.error(`Usage: node scripts/deploy.mjs <${Object.keys(targets).join("|")}>`);
  process.exit(1);
}

const git = (...args) => spawnSync("git", args, { encoding: "utf8" }).stdout.trim();
const run = (cmd, args, extraEnv = {}) => {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", env: { ...process.env, ...extraEnv } });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

if (target.branch) {
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  if (branch !== target.branch) {
    console.error(`✖ ${env} deploys only from "${target.branch}" (you are on "${branch}"). Merge your change first.`);
    process.exit(1);
  }
  if (git("status", "--porcelain")) {
    console.error(`✖ Commit or stash your changes before deploying ${env}, so what is live matches git.`);
    process.exit(1);
  }
  spawnSync("git", ["fetch", "-q", "origin", target.branch]);
  if (git("rev-parse", "HEAD") !== git("rev-parse", `origin/${target.branch}`)) {
    console.error(`✖ Your ${target.branch} differs from origin/${target.branch}. Pull and push first.`);
    process.exit(1);
  }
} else if (git("status", "--porcelain")) {
  console.warn(`! Deploying uncommitted changes to ${env}.`);
}

console.log(`\n▶ Building for ${env} (${target.domain})\n`);
run("node", ["scripts/run-framework.mjs", "build"], { FRAMEPATH_ENV: env });

const built = JSON.parse(readFileSync(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"));
if (built.name !== target.worker) {
  console.error(`✖ Build targets "${built.name}", expected "${target.worker}". Not deploying.`);
  process.exit(1);
}

console.log(`\n▶ Deploying ${target.worker} → https://${target.domain}\n`);
run("npx", ["wrangler", "deploy", "--config", "dist/server/wrangler.json"]);
