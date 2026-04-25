import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const arg = (process.argv[2] || "").replace(/^v/, "");
if (!arg) {
  console.error("Usage: pnpm bump <patch|minor|major|x.y.z>");
  process.exit(1);
}

const pkgPath = resolve(root, "package.json");
const current = JSON.parse(readFileSync(pkgPath, "utf8")).version;

const explicit = /^\d+\.\d+\.\d+$/.test(arg);
const next = explicit ? arg : bumpSemver(current, arg);

const targets = [
  "package.json",
  "manifest.chrome.json",
  "manifest.firefox.json",
];
for (const file of targets) {
  const path = resolve(root, file);
  const data = JSON.parse(readFileSync(path, "utf8"));
  data.version = next;
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`  ${file}: ${current} → ${next}`);
}

console.log(`\nBumped extension version: ${current} → ${next}`);

function bumpSemver(version, kind) {
  const parts = version.split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    throw new Error(`current version is not semver: ${version}`);
  }
  const [major, minor, patch] = parts;
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  if (kind === "patch") return `${major}.${minor}.${patch + 1}`;
  throw new Error(
    `unknown bump kind: ${kind} (expected patch|minor|major or x.y.z)`,
  );
}
