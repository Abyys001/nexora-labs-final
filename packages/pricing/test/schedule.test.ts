import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSchedule, isSecondDueDateValid, secondInstalmentWindow } from "../dist/schedule.js";

const ACCEPTANCE = "2026-01-01";

test("buildSchedule: full plan — one item, 100%, due acceptance + 7 days", () => {
  const items = buildSchedule({ plan: "full", totalGbp: 60000, acceptanceDate: ACCEPTANCE, timelineWeeks: 8 });
  assert.equal(items.length, 1);
  assert.equal(items[0].amountGbp, 60000);
  assert.equal(items[0].dueDate, "2026-01-08");
});

test("buildSchedule: odd totals give the first instalment the remainder", () => {
  const items = buildSchedule({
    plan: "split-completion",
    totalGbp: 60001,
    acceptanceDate: ACCEPTANCE,
    timelineWeeks: 8,
    secondDueDate: "2026-02-20", // within [completion-14, completion+30]
  });
  assert.equal(items[0].amountGbp, 30001);
  assert.equal(items[1].amountGbp, 30000);
  assert.equal(items[0].amountGbp + items[1].amountGbp, 60001);
});

test("buildSchedule: split-completion date window is [completion-14, completion+30]", () => {
  // acceptance 2026-01-01 + 8 weeks (56 days) = 2026-02-26 completion
  const window = secondInstalmentWindow("split-completion", ACCEPTANCE, 8);
  assert.equal(window.min, "2026-02-12");
  assert.equal(window.max, "2026-03-28");
  assert.equal(isSecondDueDateValid("split-completion", ACCEPTANCE, 8, "2026-02-11"), false);
  assert.equal(isSecondDueDateValid("split-completion", ACCEPTANCE, 8, "2026-02-12"), true);
  assert.equal(isSecondDueDateValid("split-completion", ACCEPTANCE, 8, "2026-03-28"), true);
  assert.equal(isSecondDueDateValid("split-completion", ACCEPTANCE, 8, "2026-03-29"), false);
});

test("buildSchedule: split-development date window is [acceptance+14, completion-7]", () => {
  const window = secondInstalmentWindow("split-development", ACCEPTANCE, 8);
  assert.equal(window.min, "2026-01-15");
  assert.equal(window.max, "2026-02-19");
  assert.equal(isSecondDueDateValid("split-development", ACCEPTANCE, 8, "2026-01-14"), false);
  assert.equal(isSecondDueDateValid("split-development", ACCEPTANCE, 8, "2026-02-19"), true);
  assert.equal(isSecondDueDateValid("split-development", ACCEPTANCE, 8, "2026-02-20"), false);
});

test("buildSchedule: throws when the second date is outside the allowed window", () => {
  assert.throws(() =>
    buildSchedule({ plan: "split-completion", totalGbp: 60000, acceptanceDate: ACCEPTANCE, timelineWeeks: 8, secondDueDate: "2026-01-01" }),
  );
});

test("buildSchedule: throws when a split plan has no second date", () => {
  assert.throws(() => buildSchedule({ plan: "split-development", totalGbp: 60000, acceptanceDate: ACCEPTANCE, timelineWeeks: 8 }));
});

test("buildSchedule: converts amounts into the proposal currency when given a rate", () => {
  const items = buildSchedule({
    plan: "full",
    totalGbp: 10000,
    acceptanceDate: ACCEPTANCE,
    timelineWeeks: 8,
    currency: { rate: 1.17, rounding: 10 },
  });
  assert.equal(items[0].amountInCurrency, 11700);
});
