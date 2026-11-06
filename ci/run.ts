/** Local-only pipeline. Stops at the first failure. */
for (const [cwd, args] of [
  [".", ["install", "--frozen-lockfile"]],
  ["apps/portfolio", ["install", "--frozen-lockfile"]],
  ...["lint", "typecheck", "test", "build", "check:links", "check:assets"].map(x => [".", ["run", x]]),
] as [string, string[]][]) {
  console.log(`\nLocal CI: ${cwd} bun ${args.join(" ")}`);
  const child = Bun.spawn(["bun", ...args], { cwd, stdout: "inherit", stderr: "inherit" });
  if (await child.exited !== 0) process.exit(1);
}
