import { readFile, access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, ".."), frontend = resolve(root, "apps/portfolio/apps/frontend");
const snapshot = JSON.parse(await readFile(resolve(root, "upstream/dither-kit.snapshot.json"), "utf8"));
const lock = JSON.parse(await readFile(resolve(frontend, "dither-kit.json"), "utf8"));
const hash = value => `sha256:${createHash("sha256").update(value, "utf8").digest("hex")}`;
const assert = (ok, message) => { if (!ok) throw Error(message); };
assert(lock.lockfileVersion === 1 && lock.mode === "source", "Dither source baseline missing");
const modified = [];
for (const file of snapshot.files) {
  const contents = await readFile(resolve(frontend, file.localPath), "utf8");
  const entries = Object.values(lock.components).flatMap(component => component.files).filter(entry => entry.path === file.localPath);
  assert(entries.length > 0 && entries.every(entry => entry.hash === file.upstreamHash), `Registry baseline mismatch: ${file.localPath}`);
  if (hash(contents) !== file.upstreamHash) modified.push(file.localPath);
}
const packageInfo = JSON.parse(await readFile(resolve(frontend, "package.json"), "utf8"));
for (const dependency of ["motion", "d3-scale", "d3-shape"]) assert(packageInfo.dependencies[dependency], `Missing donor dependency: ${dependency}`);
await access(resolve(frontend, "public/open-source/dither-kit/NOTICE.txt"));
console.log(JSON.stringify({ passed: true, installedSourceFiles: snapshot.files.length, registryItems: Object.keys(lock.components).length, hostAdaptedFiles: modified, repositoryRevision: snapshot.repositoryRevision }, null, 2));
