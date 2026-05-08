import { MODULE_ID } from "./config.mjs";
import { filterSearchResults } from "./search.mjs";
import { clampValue, createTraitId, getLevelReference, readTrackerData, writeTrackerData } from "./tracker-data.mjs";

function sortActors(a, b) {
  return String(a.name ?? "").localeCompare(String(b.name ?? ""), game.i18n?.lang ?? "en");
}

export class NegotiationTrackerApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "simple-negotiation-tracker",
    classes: ["simple-negotiation-tracker"],
    position: { width: 520, height: 640 },
    window: {
      title: "",
      resizable: true,
    },
  };

  static PARTS = {
    form: {
      template: `modules/${MODULE_ID}/templates/tracker.hbs`,
    },
  };

  constructor(options = {}) {
    super(options);
    this.actor = options.actor ?? null;
    this.actorQuery = "";
  }

  get title() {
    return game.i18n.localize("SNT.Title");
  }

  async _prepareContext(options) {
    const actors = game.actors?.contents?.slice().sort(sortActors) ?? [];
    const selectedActor = this.actor?.id ? this.actor : null;
    const actorResults = filterSearchResults(actors, this.actorQuery, { limit: 24 });
    const data = selectedActor ? readTrackerData(selectedActor) : null;
    const interest = data ? getLevelReference(data.tracks.interest, data.interest) : null;
    const patience = data ? getLevelReference(data.tracks.patience, data.patience) : null;

    return {
      labels: this.#labels(),
      actors: actorResults.map((actor) => ({
        id: actor.id,
        name: actor.name,
        selected: actor.id === selectedActor?.id,
      })),
      actorQuery: this.actorQuery,
      hasActor: !!selectedActor,
      actorName: selectedActor?.name ?? "",
      data,
      interest,
      patience,
      traits: data?.availableTraits ?? [],
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const root = this.element;

    root.querySelector('[data-action="actor-search"]')?.addEventListener("input", this.#onActorSearch.bind(this));
    for (const actorButton of root.querySelectorAll("[data-actor-id]")) {
      actorButton.addEventListener("click", this.#onSelectActor.bind(this));
    }
    for (const button of root.querySelectorAll("button[data-action]")) {
      button.addEventListener("click", this.#onButtonAction.bind(this));
    }
    for (const input of root.querySelectorAll("[data-save-field]")) {
      input.addEventListener("change", this.#onFieldChange.bind(this));
    }
    for (const tab of root.querySelectorAll("[data-tab]")) {
      tab.addEventListener("click", this.#onTabClick.bind(this));
    }

    const search = root.querySelector('[data-action="actor-search"]');
    if (search && this.actorQuery) {
      search.focus();
      search.selectionStart = search.selectionEnd = search.value.length;
    }
  }

  async #onSelectActor(event) {
    event.preventDefault();
    const actorId = event.currentTarget?.dataset?.actorId ?? "";
    this.actor = actorId ? game.actors.get(actorId) : null;
    this.actorQuery = "";
    this.render();
  }

  #onActorSearch(event) {
    this.actorQuery = event.currentTarget?.value ?? "";
    this.render();
  }

  async #onButtonAction(event) {
    event.preventDefault();
    const action = event.currentTarget?.dataset?.action;
    if (!this.actor || !action) return;

    const data = readTrackerData(this.actor);

    if (action === "interest-dec") data.interest = clampValue(data.interest - 1, data.tracks.interest.min, data.tracks.interest.max, data.interest);
    if (action === "interest-inc") data.interest = clampValue(data.interest + 1, data.tracks.interest.min, data.tracks.interest.max, data.interest);
    if (action === "patience-dec") data.patience = clampValue(data.patience - 1, data.tracks.patience.min, data.tracks.patience.max, data.patience);
    if (action === "patience-inc") data.patience = clampValue(data.patience + 1, data.tracks.patience.min, data.tracks.patience.max, data.patience);
    if (action === "add-motivation") this.#addTraitFromSelect(data, "motivations", "motivation");
    if (action === "add-pitfall") this.#addTraitFromSelect(data, "pitfalls", "pitfall");
    if (action === "remove-motivation") this.#removeTrait(data, "motivations", event.currentTarget.dataset.index);
    if (action === "remove-pitfall") this.#removeTrait(data, "pitfalls", event.currentTarget.dataset.index);
    if (action === "add-available-trait") this.#addAvailableTrait(data);
    if (action === "remove-available-trait") this.#removeTrait(data, "availableTraits", event.currentTarget.dataset.index);

    await writeTrackerData(this.actor, data);
    this.render();
  }

  #onTabClick(event) {
    event.preventDefault();
    const tab = event.currentTarget.dataset.tab;
    const root = this.element;
    for (const item of root.querySelectorAll("[data-tab]")) {
      item.classList.toggle("active", item.dataset.tab === tab);
    }
    for (const panel of root.querySelectorAll("[data-tab-panel]")) {
      panel.classList.toggle("active", panel.dataset.tabPanel === tab);
    }
  }

  async #onFieldChange(event) {
    if (!this.actor) return;
    const field = event.currentTarget?.dataset?.saveField;
    const data = readTrackerData(this.actor);

    if (field === "notes") data.notes = event.currentTarget.value ?? "";
    if (field === "interest") data.interest = clampValue(event.currentTarget.value, data.tracks.interest.min, data.tracks.interest.max, data.interest);
    if (field === "patience") data.patience = clampValue(event.currentTarget.value, data.tracks.patience.min, data.tracks.patience.max, data.patience);
    if (field === "interest-min") data.tracks.interest.min = Number(event.currentTarget.value);
    if (field === "interest-max") data.tracks.interest.max = Number(event.currentTarget.value);
    if (field === "patience-min") data.tracks.patience.min = Number(event.currentTarget.value);
    if (field === "patience-max") data.tracks.patience.max = Number(event.currentTarget.value);
    this.#updateLevelField(data, field, event.currentTarget.value);
    if (field?.startsWith("motivation-notes-")) {
      const index = Number(field.slice("motivation-notes-".length));
      if (data.motivations[index]) data.motivations[index].notes = event.currentTarget.value ?? "";
    }
    if (field?.startsWith("pitfall-notes-")) {
      const index = Number(field.slice("pitfall-notes-".length));
      if (data.pitfalls[index]) data.pitfalls[index].notes = event.currentTarget.value ?? "";
    }

    await writeTrackerData(this.actor, data);
    this.render();
  }

  #addTraitFromSelect(data, listKey, selectKey) {
    const select = this.element.querySelector(`[data-${selectKey}-select]`);
    const id = select?.value ?? "";
    const reference = data.availableTraits.find((trait) => trait.id === id);
    if (!reference) return;
    data[listKey] ??= [];
    if (data[listKey].some((entry) => entry.id === reference.id)) return;
    data[listKey].push({ id: reference.id, label: reference.label, notes: "" });
  }

  #addAvailableTrait(data) {
    const input = this.element.querySelector("[data-available-trait-input]");
    const label = String(input?.value ?? "").trim();
    if (!label) return;
    const id = this.#uniqueTraitId(data.availableTraits, label);
    data.availableTraits.push({ id, label });
  }

  #removeTrait(data, listKey, indexValue) {
    const index = Number(indexValue);
    if (!Number.isInteger(index)) return;
    data[listKey] ??= [];
    data[listKey].splice(index, 1);
  }

  #uniqueTraitId(traits, label) {
    const base = createTraitId(label) || "trait";
    const ids = new Set((traits ?? []).map((trait) => trait.id));
    if (!ids.has(base)) return base;

    for (let suffix = 2; suffix < 1000; suffix += 1) {
      const id = `${base}-${suffix}`;
      if (!ids.has(id)) return id;
    }

    return `${base}-${Date.now()}`;
  }

  #updateLevelField(data, field, value) {
    const match = /^(interest|patience)-level-(label|summary)-(-?\d+)$/.exec(field ?? "");
    if (!match) return;
    const [, trackKey, property, rawValue] = match;
    const levelValue = Number(rawValue);
    const level = data.tracks?.[trackKey]?.levels?.find((entry) => Number(entry.value) === levelValue);
    if (level) level[property] = value ?? "";
  }

  #labels() {
    const localize = (key) => game.i18n.localize(key);
    return {
      actor: localize("SNT.Fields.Actor"),
      searchActor: localize("SNT.Placeholders.SearchActor"),
      noActorResults: localize("SNT.Empty.NoActorResults"),
      interest: localize("SNT.Fields.Interest"),
      patience: localize("SNT.Fields.Patience"),
      motivations: localize("SNT.Fields.Motivations"),
      pitfalls: localize("SNT.Fields.Pitfalls"),
      notes: localize("SNT.Fields.Notes"),
      notesPlaceholder: localize("SNT.Placeholders.Notes"),
      motivationHelp: localize("SNT.Help.Motivations"),
      pitfallHelp: localize("SNT.Help.Pitfalls"),
      noMotivations: localize("SNT.Empty.Motivations"),
      noPitfalls: localize("SNT.Empty.Pitfalls"),
      noActor: localize("SNT.Empty.NoActor"),
      add: localize("SNT.Actions.Add"),
      remove: localize("SNT.Actions.Remove"),
      trackerTab: localize("SNT.Tabs.Tracker"),
      settingsTab: localize("SNT.Tabs.Settings"),
      sections: localize("SNT.Aria.Sections"),
      min: localize("SNT.Fields.Min"),
      max: localize("SNT.Fields.Max"),
      label: localize("SNT.Fields.Label"),
      description: localize("SNT.Fields.Description"),
      availableTraits: localize("SNT.Fields.AvailableTraits"),
      traitName: localize("SNT.Fields.TraitName"),
      traitNamePlaceholder: localize("SNT.Placeholders.TraitName"),
      noAvailableTraits: localize("SNT.Empty.AvailableTraits"),
    };
  }
}
