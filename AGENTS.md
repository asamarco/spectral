# AGENTS

- Thin-film optics are computed client-side in src/lib/tmm.ts (Airy/transfer-matrix recursion) so stack edits update the spectrum and colour instantly without a server.
- Unit tests use the bun test runner (`bun test`); vitest is not installed.
