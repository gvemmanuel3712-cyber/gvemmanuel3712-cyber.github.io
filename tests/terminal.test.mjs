import test from "node:test";
import assert from "node:assert/strict";
import { runCommand, periodSummary } from "../src/lib/terminal.mjs";

test("only the intended commands return real portfolio content", () => {
  for (const command of [
    "help",
    "about",
    "skills",
    "projects",
    "github",
    "contact",
  ]) {
    assert.ok(runCommand(command).lines.length > 0);
    assert.ok(runCommand(command, "es").lines.length > 0);
  }
  assert.equal(runCommand("clear").action, "clear");
  assert.deepEqual(runCommand(" ").lines, []);
});

test("case and whitespace normalize, while arbitrary input remains inert text", () => {
  assert.deepEqual(runCommand("  HeLP  "), runCommand("help"));
  for (const input of [
    "rm -rf /",
    "help;alert(1)",
    "<img src=x onerror=alert(1)>",
    "$(whoami)",
    "__proto__",
    "constructor",
  ]) {
    const result = runCommand(input);
    assert.ok(Array.isArray(result.lines));
    assert.match(result.lines[0].text, /Unknown command/);
    assert.equal(result.lines[0].href, undefined);
  }
});

test("terminal links are limited to the real profile and the actual local build-notes page", () => {
  for (const command of [
    "help",
    "about",
    "skills",
    "projects",
    "github",
    "contact",
  ]) {
    for (const line of runCommand(command).lines) {
      if (line.href)
        assert.ok(
          line.href === "/projects/portfolio/" ||
            line.href.startsWith("https://github.com/gvemmanuel3712-cyber"),
        );
    }
  }
});

test("period totals use inclusive UTC dates, without inventing daily activity", () => {
  const days = [
    { date: "2026-04-03", count: 1 },
    { date: "2026-09-20", count: 9 },
    { date: "2026-09-21", count: 4 },
    { date: "2026-10-20", count: 2 },
  ];
  assert.deepEqual(periodSummary(days, "2026-10-20", "30"), {
    total: 6,
    activeDays: 2,
    start: Date.parse("2026-09-21T00:00:00Z"),
  });
  assert.equal(periodSummary(days, "2026-10-20", "year").total, 16);
});
