# Development Rules

- Be concise in reports.
- Every bugfix requires a test if coverage does not already exist.
- Keep functions short and readable.
- Never mix test code with production code.
- Use i18n keys for all user-facing text and update `lang/*.json`.
- Do not delete debug logs until the bug is confirmed fixed.
- Do not add comments unless explicitly requested.
- Do not modify code outside the requested scope.
- Do not rename functions unless explicitly requested.
- Do not refactor code unprompted.
- Maintain clean and readable code.
- If you do not know, say you do not know.
- If an old unit test fails, do not modify the test to force it to pass.
- If `module.json` version changes, `CHANGELOG.md` must include that version and a matching GitHub tag `v<version>` must exist before release.
