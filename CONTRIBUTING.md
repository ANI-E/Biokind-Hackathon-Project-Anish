# Contributing

Anyone can help. Collaborators push branches (or `main`) directly; everyone else forks the repo and opens a pull request. This works the same whether you code by hand or with an AI coding tool.

## Run it
```
npm install
npm run dev        # http://localhost:5173
npm test           # simulation, data-asset and teaching tests
npm run typecheck
npm run build
```
CI runs the same three checks on every push and pull request.

## Ground rules (these protect what makes the project a data project)
1. **MEPS first.** Demand and payments come from the committed model asset `packages/model-assets/derived/meps_baseline.json`. Never present invented numbers as survey-derived. Every number carries a lineage label (`MEPS_OBSERVED`, `MEPS_CALIBRATED`, `MODEL_ASSUMPTION`, `SIMULATED`, `DEMO_SYNTHETIC`).
2. **Assumptions live in one place.** Game-design and scenario numbers go in `packages/model-assets/default-assumptions.json` (decision-card effects are in `packages/sim/src/cards.ts` and are also assumptions). Document new ones in `docs/MODEL_ASSUMPTIONS.md`.
3. **Deterministic simulation.** In `packages/sim`: no `Math.random()`, no wall-clock time, money in integer cents. The same seed and actions must give identical results; add or update tests when rules change.
4. **Keep the UI a view.** `apps/web` reads simulation state through `apps/web/src/controller.ts`; game rules do not belong in React or Phaser code.
5. **No raw MEPS microdata in git.** `data/raw/` is ignored. Rebuild the asset with the scripts in `scripts/` (see the README).

## Where things are
`packages/sim` simulation, decision cards, trust, scorecard, teaching layer · `packages/model-assets` MEPS asset and assumptions · `apps/web` React + Phaser app · `scripts/` Python ETL · `docs/` methods and assumptions.

## Pull requests
Keep them focused, describe what changed and why, and tick the checklist in the PR template. Commit under your own name; this repository’s history is attributed to its human contributors, so please leave out AI co-author trailers.
