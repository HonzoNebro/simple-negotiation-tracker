export const DEFAULT_INTEREST_LEVELS = [
  {
    value: 0,
    labelKey: "SNT.Defaults.Interest.0.Label",
    summaryKey: "SNT.Defaults.Interest.0.Summary",
  },
  {
    value: 1,
    labelKey: "SNT.Defaults.Interest.1.Label",
    summaryKey: "SNT.Defaults.Interest.1.Summary",
  },
  {
    value: 2,
    labelKey: "SNT.Defaults.Interest.2.Label",
    summaryKey: "SNT.Defaults.Interest.2.Summary",
  },
  {
    value: 3,
    labelKey: "SNT.Defaults.Interest.3.Label",
    summaryKey: "SNT.Defaults.Interest.3.Summary",
  },
  {
    value: 4,
    labelKey: "SNT.Defaults.Interest.4.Label",
    summaryKey: "SNT.Defaults.Interest.4.Summary",
  },
  {
    value: 5,
    labelKey: "SNT.Defaults.Interest.5.Label",
    summaryKey: "SNT.Defaults.Interest.5.Summary",
  },
];

export const DEFAULT_PATIENCE_LEVELS = [
  { value: 0, labelKey: "SNT.Defaults.Patience.0.Label", summaryKey: "SNT.Defaults.Patience.0.Summary" },
  { value: 1, labelKey: "SNT.Defaults.Patience.1.Label", summaryKey: "SNT.Defaults.Patience.1.Summary" },
  { value: 2, labelKey: "SNT.Defaults.Patience.2.Label", summaryKey: "SNT.Defaults.Patience.2.Summary" },
  { value: 3, labelKey: "SNT.Defaults.Patience.3.Label", summaryKey: "SNT.Defaults.Patience.3.Summary" },
  { value: 4, labelKey: "SNT.Defaults.Patience.4.Label", summaryKey: "SNT.Defaults.Patience.4.Summary" },
  { value: 5, labelKey: "SNT.Defaults.Patience.5.Label", summaryKey: "SNT.Defaults.Patience.5.Summary" },
];

export const NEGOTIATION_TRAITS = [
  { id: "benevolence", labelKey: "SNT.Traits.Benevolence" },
  { id: "discovery", labelKey: "SNT.Traits.Discovery" },
  { id: "freedom", labelKey: "SNT.Traits.Freedom" },
  { id: "greed", labelKey: "SNT.Traits.Greed" },
  { id: "higherAuthority", labelKey: "SNT.Traits.HigherAuthority" },
  { id: "justice", labelKey: "SNT.Traits.Justice" },
  { id: "legacy", labelKey: "SNT.Traits.Legacy" },
  { id: "peace", labelKey: "SNT.Traits.Peace" },
  { id: "power", labelKey: "SNT.Traits.Power" },
  { id: "protection", labelKey: "SNT.Traits.Protection" },
  { id: "revelry", labelKey: "SNT.Traits.Revelry" },
  { id: "vengeance", labelKey: "SNT.Traits.Vengeance" },
];

export function localizeReferenceLevel(level) {
  return {
    value: level.value,
    label: globalThis.game?.i18n?.localize?.(level.labelKey) ?? level.labelKey,
    summary: globalThis.game?.i18n?.localize?.(level.summaryKey) ?? level.summaryKey,
  };
}

export function localizeTrait(trait) {
  return {
    id: trait.id,
    label: globalThis.game?.i18n?.localize?.(trait.labelKey) ?? trait.labelKey,
  };
}
