import assert from "node:assert/strict";
import { chooseFormat } from "./format_convert.ts";

const now = new Date("2026-09-01T00:00:00Z");
assert.equal(chooseFormat("2026-09-03T00:00:00Z", now), "avif");
assert.equal(chooseFormat("2026-09-12T00:00:00Z", now), "webp");
console.log("format decision tests passed");
