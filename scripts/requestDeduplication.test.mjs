import assert from "node:assert/strict";
import test from "node:test";
import { createDeduplicatedReader } from "../src/modules/listings/api/requestDeduplication.js";

test("identical concurrent catalog reads share one request regardless of parameter order", async () => {
  let calls = 0;
  const read = createDeduplicatedReader(async () => { calls++; return ["option"]; });
  const first = read("/models", { category: "car", brand: "toyota" });
  const second = read("/models", { brand: "toyota", category: "car" });
  assert.equal(first, second);
  await Promise.all([first, second]);
  assert.equal(calls, 1);
  await read("/models", { brand: "toyota", category: "car" });
  assert.equal(calls, 2, "settled catalog data must not conceal admin updates");
});

test("different categories and models never share results", async () => {
  let calls = 0;
  const read = createDeduplicatedReader(async (path, params) => { calls++; return { path, params }; });
  const result = await Promise.all([read("/models", { brand: "A" }), read("/models", { brand: "B" }), read("/variants", { brand: "A" })]);
  assert.equal(calls, 3);
  assert.equal(result[1].params.brand, "B");
});

test("a rejected read is evicted and can be retried", async () => {
  let calls = 0;
  const read = createDeduplicatedReader(async () => { if (++calls === 1) throw Error("offline"); return []; });
  await assert.rejects(read("/brands"), /offline/);
  await read("/brands");
  assert.equal(calls, 2);
});
