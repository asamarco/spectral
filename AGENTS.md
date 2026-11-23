# AGENTS

- Thin-film optics are computed client-side in src/lib/tmm.ts (Airy/transfer-matrix recursion) so stack edits update the spectrum and colour instantly without a server.
- Unit tests use the bun test runner (`bun test`); vitest is not installed.
- Conversion UI defaults live in src/lib/conversionSettings.ts so initial settings can be tested independently of rendering.
- Custom optical materials use pure model/table validation in src/lib/opticalMaterials.ts and an explicit per-designer registry passed to TMM; this keeps live updates isolated without mutating built-in materials.
- Cu and Ti use attributed Johnson–Christy data in src/lib/data/metalOpticalConstants.ts so built-in absorbing materials have traceable optical constants.
