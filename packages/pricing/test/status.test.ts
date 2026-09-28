import assert from "node:assert/strict";
import { test } from "node:test";
import { deriveRequestPaymentStatus, deriveScheduleItemStatus } from "../dist/status.js";

const NOW = new Date("2026-06-01T00:00:00.000Z");

test("deriveScheduleItemStatus: paid when paid >= amount", () => {
  assert.equal(deriveScheduleItemStatus({ amountGbp: 1000, paidGbp: 1000, dueDate: "2026-01-01", now: NOW }), "paid");
  assert.equal(deriveScheduleItemStatus({ amountGbp: 1000, paidGbp: 1200, dueDate: "2026-01-01", now: NOW }), "paid");
});

test("deriveScheduleItemStatus: partially-paid when 0 < paid < amount", () => {
  assert.equal(deriveScheduleItemStatus({ amountGbp: 1000, paidGbp: 400, dueDate: "2026-01-01", now: NOW }), "partially-paid");
});

test("deriveScheduleItemStatus: overdue when unpaid and past due", () => {
  assert.equal(deriveScheduleItemStatus({ amountGbp: 1000, paidGbp: 0, dueDate: "2026-01-01", now: NOW }), "overdue");
});

test("deriveScheduleItemStatus: awaiting when unpaid and not yet due", () => {
  assert.equal(deriveScheduleItemStatus({ amountGbp: 1000, paidGbp: 0, dueDate: "2026-12-01", now: NOW }), "awaiting");
});

test("deriveScheduleItemStatus: manualStatus overrides ledger-derived status", () => {
  assert.equal(deriveScheduleItemStatus({ amountGbp: 1000, paidGbp: 1000, dueDate: "2026-01-01", now: NOW, manualStatus: "refunded" }), "refunded");
  assert.equal(deriveScheduleItemStatus({ amountGbp: 1000, paidGbp: 0, dueDate: "2026-01-01", now: NOW, manualStatus: "cancelled" }), "cancelled");
});

test("deriveRequestPaymentStatus: not-started with no plan", () => {
  assert.equal(deriveRequestPaymentStatus({ planExists: false, itemStatuses: [] }), "not-started");
});

test("deriveRequestPaymentStatus: awaiting-payment when plan exists and nothing paid", () => {
  assert.equal(deriveRequestPaymentStatus({ planExists: true, itemStatuses: ["awaiting", "awaiting"] }), "awaiting-payment");
});

test("deriveRequestPaymentStatus: partially-paid when some but not all items are paid", () => {
  assert.equal(deriveRequestPaymentStatus({ planExists: true, itemStatuses: ["paid", "awaiting"] }), "partially-paid");
  assert.equal(deriveRequestPaymentStatus({ planExists: true, itemStatuses: ["partially-paid", "awaiting"] }), "partially-paid");
});

test("deriveRequestPaymentStatus: paid when every item is paid", () => {
  assert.equal(deriveRequestPaymentStatus({ planExists: true, itemStatuses: ["paid", "paid"] }), "paid");
});

test("deriveRequestPaymentStatus: overdue wins when any item is overdue", () => {
  assert.equal(deriveRequestPaymentStatus({ planExists: true, itemStatuses: ["paid", "overdue"] }), "overdue");
});

test("deriveRequestPaymentStatus: cancelled/refunded from plan state", () => {
  assert.equal(deriveRequestPaymentStatus({ planExists: true, planCancelled: true, itemStatuses: ["awaiting"] }), "cancelled");
  assert.equal(deriveRequestPaymentStatus({ planExists: true, itemStatuses: ["refunded", "refunded"] }), "refunded");
});
