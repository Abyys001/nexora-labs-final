import assert from "node:assert/strict";
import { test } from "node:test";
import { convert } from "../dist/convert.js";

test("convert: rounds to the nearest currency step, half-up", () => {
  assert.equal(convert(1000, 1.17, 10), 1170);
  assert.equal(convert(1000, 1.175, 10), 1180); // 1175 -> nearest 10 rounds up
  assert.equal(convert(100, 1.23, 50), 100); // 123 -> nearest 50 is 100
  assert.equal(convert(100, 1.27, 50), 150); // 127 -> nearest 50 is 150 (round-half-up at 125)
});

test("convert: 'none' rounding keeps two decimal places", () => {
  assert.equal(convert(100, 1.23456, "none"), 123.46);
  assert.equal(convert(1, 0.855, "none"), 0.86);
});

test("convert: rate 1 is a no-op (GBP)", () => {
  assert.equal(convert(4250, 1, "none"), 4250);
});
