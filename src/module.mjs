import { MODULE_ID } from "./config.mjs";
import { NegotiationTrackerApp } from "./tracker-app.mjs";

const log = (...args) => console.log(`${MODULE_ID} |`, ...args);

let trackerApp = null;

function localize(key) {
  return game.i18n.localize(key);
}

function getControlledActor() {
  const controlled = globalThis.canvas?.tokens?.controlled ?? [];
  return controlled[0]?.actor ?? null;
}

function openNegotiationTracker(actor = null) {
  if (!game.user?.isGM) {
    ui.notifications?.warn?.(localize("SNT.Notifications.OnlyGM"));
    return null;
  }

  const selectedActor = actor ?? getControlledActor();
  if (!trackerApp) trackerApp = new NegotiationTrackerApp({ actor: selectedActor });
  else {
    trackerApp.actor = selectedActor;
  }
  trackerApp.render({ force: true });
  return trackerApp;
}

function addTrackerButtonToTools(tools) {
  const button = {
    name: "simpleNegotiationTracker",
    title: localize("SNT.Title"),
    icon: "fas fa-comments",
    button: true,
    visible: game.user?.isGM,
    order: Object.keys(tools ?? {}).length,
    onChange: () => openNegotiationTracker(),
  };

  if (Array.isArray(tools)) {
    if (!tools.some((tool) => tool.name === button.name)) tools.push(button);
  } else if (tools && typeof tools === "object") {
    tools[button.name] = button;
  }
}

Hooks.once("init", () => {
  foundry.applications.handlebars.loadTemplates([
    `modules/${MODULE_ID}/templates/tracker.hbs`,
  ]);

  game.settings.registerMenu(MODULE_ID, "openTracker", {
    name: "SNT.Settings.Open.Name",
    label: "SNT.Settings.Open.Label",
    hint: "SNT.Settings.Open.Hint",
    icon: "fas fa-comments",
    type: NegotiationTrackerApp,
    restricted: true,
  });

  game.modules.get(MODULE_ID).api = { open: openNegotiationTracker };
  log("Initialized");
});

Hooks.once("ready", () => {
  log("Ready");
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user?.isGM) return;

  if (Array.isArray(controls)) {
    const tokenControl = controls.find((control) => control.name === "token" || control.name === "tokens");
    if (tokenControl?.tools) addTrackerButtonToTools(tokenControl.tools);
    else {
      controls.push({
        name: "negotiation",
        title: localize("SNT.Title"),
        icon: "fas fa-comments",
        layer: "TokenLayer",
        tools: [{
          name: "simpleNegotiationTracker",
          title: localize("SNT.Title"),
          icon: "fas fa-comments",
          button: true,
          onChange: () => openNegotiationTracker(),
        }],
      });
    }
    return;
  }

  const tokenControl = controls?.token ?? controls?.tokens;
  if (tokenControl?.tools) addTrackerButtonToTools(tokenControl.tools);
});
