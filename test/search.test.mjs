import test from "node:test";
import assert from "node:assert/strict";

import { filterSearchResults, fuzzyScore, normalizeSearchText } from "../src/search.mjs";

test("normalizeSearchText ignores case and accents", () => {
  assert.equal(normalizeSearchText("  Marqués Áureo  "), "marques aureo");
});

test("fuzzyScore matches contiguous and non-contiguous actor names", () => {
  assert.ok(fuzzyScore("marq", "Marqués Áureo") > fuzzyScore("mq", "Marqués Áureo"));
  assert.equal(fuzzyScore("zzz", "Marqués Áureo"), -1);
});

test("filterSearchResults ranks close actor matches first", () => {
  const actors = [
    { name: "Captain Runa" },
    { name: "Marqués Áureo" },
    { name: "Mara the Red" },
  ];

  assert.deepEqual(filterSearchResults(actors, "marq").map((actor) => actor.name), [
    "Marqués Áureo",
  ]);
});
