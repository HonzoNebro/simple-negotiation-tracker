# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-05-08

### Added
- Actor-specific editing for the trait options used by motivation and pitfall dropdowns.

### Removed
- Removed French, Portuguese, German, and Italian localization files from the module package.

## [0.3.1] - 2026-05-08

### Fixed
- Removed deprecated `SceneControlTool#onClick` usage so Foundry VTT 14 no longer reports a compatibility warning when opening the tracker from scene controls.

## [0.3.0] - 2026-05-08

### Added
- Fuzzy actor search for choosing the NPC or Actor to track.
- Settings menu entry to open the tracker without requiring an active scene.
- Rules inspiration documentation for the Draw Steel negotiation source material and creator license.

### Changed
- Scene control integration now includes the Foundry V14 object-shaped controls API.
- Compatibility metadata verified through Foundry VTT 14.

## [0.2.0] - 2026-05-08

### Added
- Interface translations for English, Spanish, Galician, French, Portuguese, German, and Italian. French, Portuguese, German, and Italian were later removed in `0.4.0`.
- Actor-specific Interest and Patience range settings.
- Actor-specific editable labels and descriptions for each Interest and Patience value.

### Changed
- Updated the tracker window with a two-tab ApplicationV2 layout for tracking and settings.
- Release metadata updated for `simple-negotiation-tracker` v0.2.0.

## [0.1.0] - 2026-05-08

### Added
- Initial manual negotiation tracker for Foundry VTT v13.
- Actor flag storage for interest, patience, motivations, pitfalls, and GM notes.
- GM-only scene control button and single-window tracker UI.
- AI disclosure and agent development rules.

### Changed
- Project identity, architecture, and license reset for the new module.
- Release metadata initialized for `simple-negotiation-tracker` v0.1.0.
