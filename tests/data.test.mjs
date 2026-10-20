import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const data = JSON.parse(
  readFileSync(new URL("../data/github.json", import.meta.url)),
);

test("published metrics are derived from one internally consistent calendar", () => {
  const days = data.calendar.days;
  assert.equal(
    data.calendar.total,
    days.reduce((sum, day) => sum + day.count, 0),
  );
  assert.equal(
    data.calendar.activeDays,
    days.filter((day) => day.count > 0).length,
  );
  assert.equal(new Set(days.map((day) => day.date)).size, days.length);
  for (let i = 1; i < days.length; i++)
    assert.equal(
      Date.parse(days[i].date) - Date.parse(days[i - 1].date),
      86400000,
    );
  assert.equal(data.profile.public_repos, data.repositories.length);
  for (const repo of data.repositories)
    assert.match(
      repo.html_url,
      /^https:\/\/github.com\/gvemmanuel3712-cyber\//,
    );
});

test("the visitor data uses public sources and contains no credentials or local paths", () => {
  const text = JSON.stringify(data);
  for (const pattern of [
    /github_pat_/,
    /ghp_[A-Za-z0-9]+/,
    /\/Users\//,
    /SERVICE_ROLE_KEY/,
  ])
    assert.doesNotMatch(text, pattern);
  assert.match(
    data.calendarSource,
    /^https:\/\/github.com\/users\/gvemmanuel3712-cyber\/contributions$/,
  );
});
