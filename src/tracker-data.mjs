import { MODULE_ID, TRACKER_FLAG } from "./config.mjs";
import { DEFAULT_INTEREST_LEVELS, DEFAULT_PATIENCE_LEVELS, NEGOTIATION_TRAITS, localizeReferenceLevel, localizeTrait } from "./draw-steel-reference.mjs";

const TRAIT_ID_PATTERN = /^[A-Za-z0-9-]+$/;

export function clampTrackValue(value, fallback = 0) {
  return clampValue(value, 0, 5, fallback);
}

export function clampValue(value, min, max, fallback = min) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? Math.round(n) : fallback;
  return Math.max(min, Math.min(max, safe));
}

export function localizeLevelDefaults(levels) {
  return levels.map(localizeReferenceLevel);
}

export function createDefaultTrackerData() {
  const interestLevels = localizeLevelDefaults(DEFAULT_INTEREST_LEVELS);
  const patienceLevels = localizeLevelDefaults(DEFAULT_PATIENCE_LEVELS);
  const availableTraits = NEGOTIATION_TRAITS.map(localizeTrait);
  return {
    schemaVersion: 1,
    interest: 2,
    patience: 3,
    tracks: {
      interest: {
        min: 0,
        max: 5,
        levels: interestLevels,
      },
      patience: {
        min: 0,
        max: 5,
        levels: patienceLevels,
      },
    },
    availableTraits,
    motivations: [],
    pitfalls: [],
    notes: "",
  };
}

export function normalizeTraitEntry(entry, availableTraits = createDefaultTrackerData().availableTraits) {
  const id = String(entry?.id ?? "").trim();
  const customLabel = String(entry?.label ?? "").trim();
  const reference = availableTraits.find((trait) => trait.id === id);
  const label = reference?.label ?? customLabel;

  if (!id && !label) return null;

  return {
    id: TRAIT_ID_PATTERN.test(id) ? id : "",
    label: label || id,
    notes: String(entry?.notes ?? "").trim(),
  };
}

export function normalizeAvailableTraitEntry(entry) {
  const label = String(entry?.label ?? "").trim();
  const sourceId = String(entry?.id ?? "").trim();
  const id = TRAIT_ID_PATTERN.test(sourceId) ? sourceId : createTraitId(sourceId || label);
  if (!id || !label) return null;
  return { id, label };
}

export function normalizeAvailableTraitList(value, defaults = createDefaultTrackerData().availableTraits) {
  const source = Array.isArray(value) ? value : defaults;
  const seen = new Set();
  const traits = [];

  for (const entry of source) {
    const trait = normalizeAvailableTraitEntry(entry);
    if (!trait || seen.has(trait.id)) continue;
    seen.add(trait.id);
    traits.push(trait);
  }

  return traits;
}

export function createTraitId(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeTraitList(value, availableTraits) {
  const source = Array.isArray(value) ? value : [];
  return source.map((entry) => normalizeTraitEntry(entry, availableTraits)).filter(Boolean);
}

export function normalizeTrackerData(value) {
  const defaults = createDefaultTrackerData();
  const source = value && typeof value === "object" ? value : {};
  const interestTrack = normalizeTrackConfig(source.tracks?.interest, defaults.tracks.interest);
  const patienceTrack = normalizeTrackConfig(source.tracks?.patience, defaults.tracks.patience);
  const availableTraits = normalizeAvailableTraitList(source.availableTraits, defaults.availableTraits);
  return {
    schemaVersion: 1,
    interest: clampValue(source.interest, interestTrack.min, interestTrack.max, defaults.interest),
    patience: clampValue(source.patience, patienceTrack.min, patienceTrack.max, defaults.patience),
    tracks: {
      interest: interestTrack,
      patience: patienceTrack,
    },
    availableTraits,
    motivations: normalizeTraitList(source.motivations, availableTraits),
    pitfalls: normalizeTraitList(source.pitfalls, availableTraits),
    notes: String(source.notes ?? ""),
  };
}

export function normalizeTrackConfig(source, defaults) {
  const rawMin = Number(source?.min ?? defaults.min);
  const rawMax = Number(source?.max ?? defaults.max);
  const min = Number.isFinite(rawMin) ? Math.round(rawMin) : defaults.min;
  const max = Math.max(min, Number.isFinite(rawMax) ? Math.round(rawMax) : defaults.max);
  const rawLevels = Array.isArray(source?.levels) ? source.levels : [];
  const levels = [];

  for (let value = min; value <= max; value += 1) {
    const current = rawLevels.find((level) => Number(level?.value) === value)
      ?? defaults.levels.find((level) => Number(level?.value) === value)
      ?? { value, label: String(value), summary: "" };
    levels.push({
      value,
      label: String(current.label ?? value),
      summary: String(current.summary ?? ""),
    });
  }

  return { min, max, levels };
}

export function getLevelReference(track, value) {
  const n = Number(value);
  return track?.levels?.find((level) => Number(level.value) === n)
    ?? { value: n, label: String(n), summary: "" };
}

export function readTrackerData(actor) {
  return normalizeTrackerData(actor?.getFlag?.(MODULE_ID, TRACKER_FLAG));
}

export async function writeTrackerData(actor, data) {
  if (!actor) throw new Error("An Actor is required to save negotiation tracker data.");
  return actor.setFlag(MODULE_ID, TRACKER_FLAG, normalizeTrackerData(data));
}
