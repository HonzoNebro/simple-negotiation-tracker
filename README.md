# Simple Negotiation Tracker

A small Foundry VTT v13/v14 module for manually tracking social negotiations in any game system.

The module is inspired by the negotiation framing in Draw Steel, but it does not implement or automate Draw Steel rules. It gives the GM a compact window for one Actor at a time:

- Interest from 0 to 5
- Patience from 0 to 5
- Actor-specific custom ranges and text for Interest and Patience
- Motivations
- Pitfalls
- Actor-specific trait options for the motivation and pitfall dropdowns
- Freeform GM notes

Data is stored on the selected Actor using module flags, so the tracker stays system agnostic and does not require custom Item types, Actor schema changes, chat automation, or rule integration.

The interface includes English, Spanish, and Galician localization.

## Rules Inspiration

The tracker is inspired by the Draw Steel negotiation rules published in Steel Compendium:

- https://steelcompendium.io/compendium/main/Rules/Chapters/Negotiation/
- https://steelcompendium.io/compendium/main/

This module is a new manual tracker focused on table notes rather than rules automation. See `docs/RULES_INSPIRATION.md` for source links and creator license notes.

## Use

1. Enable the module in a Foundry v13 or v14 world.
2. Select a token and click the Negotiation Tracker scene control, or open the tracker from module settings.
3. Search by actor name and choose an Actor.
4. Adjust Interest and Patience manually during play.
5. Record motivations, pitfalls, and notes as the conversation develops.
6. Use the Settings tab to customize Interest, Patience, and the available trait dropdown options for that Actor.

Only GMs can open and edit the tracker.

## Interest

Interest represents the current offer or attitude of the NPC:

| Value | Meaning |
|---|---|
| 0 | No, and... |
| 1 | No. |
| 2 | No, but... |
| 3 | Yes, but... |
| 4 | Yes. |
| 5 | Yes, and... |

## Patience

Patience represents how much more pressure, repetition, or negotiation the NPC will tolerate before the conversation closes. At 0, use the current Interest as the final offer.

## Development

```bash
npm test
```

See `AGENTS.md` and `docs/DEVELOPMENT_RULES.md` for development and release rules.

## AI Disclosure

This project contains AI-assisted code generation. See `docs/AI_DISCLOSURE.md`.

## License

Copyright (C) 2026 HonzoNebro.

This module is released under the GNU General Public License v3.0 or later. See `LICENSE` and `NOTICE`.

**Draw Steel** is a trademark of MCDM Productions, LLC. This module is an independent community tool and is not affiliated with or endorsed by MCDM Productions, LLC.
