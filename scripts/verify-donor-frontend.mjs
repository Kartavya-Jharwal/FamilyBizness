import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const frontend = path.resolve("apps/portfolio/apps/frontend");
const publicRoot = path.join(frontend, "public/open-source");
const manifest = JSON.parse(fs.readFileSync(path.join(publicRoot, "donor-manifest.json"), "utf8"));
const hash = file => createHash("sha256").update(fs.readFileSync(file)).digest("hex");
assert.equal(manifest.schema, 1);
assert.equal(manifest.donors.length, 6);
for (const donor of manifest.donors) {
  assert(donor.sourceFiles.length > 0, `No source evidence: ${donor.id}`);
  for (const source of donor.sourceFiles) assert.match(source.sha256, /^[a-f0-9]{64}$/);
  for (const file of donor.hostFiles) assert(fs.existsSync(path.join(frontend, file)), `Missing host contribution: ${donor.id}/${file}`);
}
for (const [file, sha256] of Object.entries(manifest.distributedLicenseFingerprints)) assert.equal(hash(path.join(publicRoot, file)), sha256, `Changed original license: ${file}`);
const read = file => fs.readFileSync(path.join(frontend, "src/features/family-office", file), "utf8");
const operations = read("operations-page.tsx");
for (const component of ["ErpTaskList", "ErpTaskFields", "CalCalendarToolbar", "CalCalendarSwitch", "CalWeekAgenda"]) assert(operations.includes(`<${component}`), `Donor component is not mounted: ${component}`);
assert(read("estate-statutory-page.tsx").includes("<ErpEstateOwnershipRegister"), "Ownership mask is not mounted");
assert(read("simulation-page.tsx").includes("<SimulationDonorLab"), "Simulation donor lab is not mounted");
for (const file of ["erpnext-frontend.ts", "erpnext-task-workspace.tsx", "erpnext-ownership-register.tsx", "cal-calendar-frontend.tsx", "simulation-lab-workspace.tsx"]) {
  const source = read(file);
  assert(!/\bfetch\s*\(|new\s+(WebSocket|EventSource)|@calcom\/|frappe\./.test(source), `Donor runtime or transport leaked into ${file}`);
  assert(!/#[0-9a-f]{6}\b/i.test(source), `Primitive palette leaked into ${file}`);
}
if (process.argv.includes("--built")) {
  const built = path.resolve("dist/portfolio/open-source");
  assert(fs.readFileSync(path.join(publicRoot, "donor-manifest.json")).equals(fs.readFileSync(path.join(built, "donor-manifest.json"))), "Manifest missing from static product");
  for (const [file, sha256] of Object.entries(manifest.distributedLicenseFingerprints)) assert.equal(hash(path.join(built, file)), sha256, `License missing from static product: ${file}`);
}
console.log("PASS: six donor contributions have source fingerprints, mounted host UI, retained licenses and no donor runtime/transport/palette dependency.");
