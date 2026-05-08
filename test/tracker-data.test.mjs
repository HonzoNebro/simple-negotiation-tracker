import test from "node:test";
import assert from "node:assert/strict";

globalThis.game = {
  i18n: {
    localize: (key) => ({
      "SNT.Defaults.Interest.0.Label": "No, and...",
      "SNT.Defaults.Interest.5.Label": "Yes, and...",
      "SNT.Defaults.Patience.0.Label": "Closed",
      "SNT.Defaults.Patience.3.Label": "Steady",
      "SNT.Traits.Peace": "Peace",
      "SNT.Traits.Power": "Power",
    }[key] ?? key),
  },
};

import {
  clampTrackValue,
  createTraitId,
  createDefaultTrackerData,
  getLevelReference,
  normalizeAvailableTraitList,
  normalizeTrackerData,
  normalizeTraitEntry,
} from "../src/tracker-data.mjs";

test("default tracker data is minimal and manual", () => {
  const data = createDefaultTrackerData();

  assert.deepEqual({
    ...data,
    availableTraits: "checked separately",
  }, {
    schemaVersion: 1,
    interest: 2,
    patience: 3,
    tracks: {
      interest: {
        min: 0,
        max: 5,
        levels: [
          { value: 0, label: "No, and...", summary: "SNT.Defaults.Interest.0.Summary" },
          { value: 1, label: "SNT.Defaults.Interest.1.Label", summary: "SNT.Defaults.Interest.1.Summary" },
          { value: 2, label: "SNT.Defaults.Interest.2.Label", summary: "SNT.Defaults.Interest.2.Summary" },
          { value: 3, label: "SNT.Defaults.Interest.3.Label", summary: "SNT.Defaults.Interest.3.Summary" },
          { value: 4, label: "SNT.Defaults.Interest.4.Label", summary: "SNT.Defaults.Interest.4.Summary" },
          { value: 5, label: "Yes, and...", summary: "SNT.Defaults.Interest.5.Summary" },
        ],
      },
      patience: {
        min: 0,
        max: 5,
        levels: [
          { value: 0, label: "Closed", summary: "SNT.Defaults.Patience.0.Summary" },
          { value: 1, label: "SNT.Defaults.Patience.1.Label", summary: "SNT.Defaults.Patience.1.Summary" },
          { value: 2, label: "SNT.Defaults.Patience.2.Label", summary: "SNT.Defaults.Patience.2.Summary" },
          { value: 3, label: "Steady", summary: "SNT.Defaults.Patience.3.Summary" },
          { value: 4, label: "SNT.Defaults.Patience.4.Label", summary: "SNT.Defaults.Patience.4.Summary" },
          { value: 5, label: "SNT.Defaults.Patience.5.Label", summary: "SNT.Defaults.Patience.5.Summary" },
        ],
      },
    },
    availableTraits: "checked separately",
    motivations: [],
    pitfalls: [],
    notes: "",
  });
  assert.ok(data.availableTraits.some((trait) => trait.id === "peace" && trait.label === "Peace"));
  assert.ok(data.availableTraits.some((trait) => trait.id === "power" && trait.label === "Power"));
});

test("clampTrackValue keeps tracks in the 0-5 range", () => {
  assert.equal(clampTrackValue(-3), 0);
  assert.equal(clampTrackValue(9), 5);
  assert.equal(clampTrackValue(2.6), 3);
  assert.equal(clampTrackValue("bad", 4), 4);
});

test("reference helpers return interest and patience explanations", () => {
  const data = createDefaultTrackerData();
  assert.equal(getLevelReference(data.tracks.interest, 0).label, "No, and...");
  assert.equal(getLevelReference(data.tracks.interest, 5).label, "Yes, and...");
  assert.equal(getLevelReference(data.tracks.patience, 0).label, "Closed");
  assert.equal(getLevelReference(data.tracks.patience, 3).label, "Steady");
});

test("normalizeTraitEntry accepts known and custom traits", () => {
  assert.deepEqual(normalizeTraitEntry({ id: "peace", notes: "Ceasefire" }), {
    id: "peace",
    label: "Peace",
    notes: "Ceasefire",
  });
  assert.deepEqual(normalizeTraitEntry({ label: "Family", notes: "Sibling" }), {
    id: "",
    label: "Family",
    notes: "Sibling",
  });
  assert.equal(normalizeTraitEntry({}), null);
});

test("normalizeTrackerData produces a stable flags payload", () => {
  assert.deepEqual(normalizeTrackerData({
    interest: 8,
    patience: -1,
    motivations: [{ id: "power", notes: "Status matters" }],
    pitfalls: [{ id: "unknown", label: "Insult", notes: "Do not mock them" }],
    notes: "Keep it tense.",
  }), {
    schemaVersion: 1,
    interest: 5,
    patience: 0,
    tracks: createDefaultTrackerData().tracks,
    availableTraits: createDefaultTrackerData().availableTraits,
    motivations: [{ id: "power", label: "Power", notes: "Status matters" }],
    pitfalls: [{ id: "unknown", label: "Insult", notes: "Do not mock them" }],
    notes: "Keep it tense.",
  });
});

test("normalizeTrackerData supports custom track ranges and labels", () => {
  const data = normalizeTrackerData({
    interest: 7,
    tracks: {
      interest: {
        min: -2,
        max: 7,
        levels: [{ value: 7, label: "Devoted", summary: "All in." }],
      },
    },
  });

  assert.equal(data.interest, 7);
  assert.equal(data.tracks.interest.min, -2);
  assert.equal(data.tracks.interest.max, 7);
  assert.deepEqual(getLevelReference(data.tracks.interest, 7), {
    value: 7,
    label: "Devoted",
    summary: "All in.",
  });
});

test("normalizeTrackerData supports actor-specific trait options", () => {
  const data = normalizeTrackerData({
    availableTraits: [
      { label: "Family" },
      { id: "family", label: "Duplicate family" },
      { id: "courtly-power", label: "Courtly Power" },
    ],
    motivations: [{ id: "family", notes: "Sibling" }],
    pitfalls: [{ id: "courtly-power", notes: "Status games" }],
  });

  assert.deepEqual(data.availableTraits, [
    { id: "family", label: "Family" },
    { id: "courtly-power", label: "Courtly Power" },
  ]);
  assert.deepEqual(data.motivations, [{ id: "family", label: "Family", notes: "Sibling" }]);
  assert.deepEqual(data.pitfalls, [{ id: "courtly-power", label: "Courtly Power", notes: "Status games" }]);
});

test("available traits can be emptied and custom ids are stable", () => {
  assert.equal(createTraitId("Familia política!"), "familia-politica");
  assert.deepEqual(normalizeAvailableTraitList([]), []);
});
