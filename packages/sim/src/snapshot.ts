import { assetProvenance, type ModelAsset } from './assets';
import type { SimState } from './simulation';
import { totalCosts, totalRevenue } from './stats';
import { PLAYABLE, type AnnualSnapshot } from './types';

/** Immutable summary of the year in progress (also used for the partial year when a hospital goes bankrupt). */
export function buildSnapshot(s: SimState, asset: ModelAsset, populationSize: number): AnnualSnapshot {
  const acc = s.yearAcc, dep = s.departments;
  const rev = totalRevenue(s.ledger), exp = totalCosts(s.ledger);
  const sum = (m: Record<string, number>) => PLAYABLE.reduce((t, k) => t + m[k], 0);
  const treatedAll = sum(acc.treated), waitAll = sum(acc.waitSum);
  const avgWait = (k: (typeof PLAYABLE)[number]) => (acc.treated[k] ? acc.waitSum[k] / acc.treated[k] : 0);
  return {
    year: s.year, seed: s.config.seed, modelVersion: asset.modelVersion, mode: asset.provenanceKind, populationSize,
    arrivals: { ...acc.arrivals }, treated: { ...acc.treated }, unmet: { ...acc.unmet },
    avgWaitTicks: treatedAll ? waitAll / treatedAll : 0,
    avgWaitTicksByService: { emergency: avgWait('emergency'), outpatient: avgWait('outpatient'), inpatient: avgWait('inpatient') },
    revenueCents: rev, expensesCents: exp, netCents: rev - exp,
    cashStartCents: s.cashStartOfYearCents, cashCents: s.cashCents, ledger: { ...s.ledger },
    staffCount: PLAYABLE.reduce((t, k) => t + dep[k].nurses + dep[k].physicians, 0),
    roomCount: PLAYABLE.reduce((t, k) => t + dep[k].roomSlots, 0),
    physicians: PLAYABLE.reduce((t, k) => t + dep[k].physicians, 0), nurses: PLAYABLE.reduce((t, k) => t + dep[k].nurses, 0),
    unmetDemand: sum(acc.unmet),
    byPayer: acc.byPayer, byIncome: acc.byIncome, patientOopCents: acc.oop, subsidizedOopCents: acc.subsidized,
    avgOopPerVisitCents: treatedAll ? Math.round(acc.oop / treatedAll) : 0,
    decisions: [...s.decisionsThisYear], event: s.yearEvent?.label ?? null, reputation: Math.round(s.reputation * 10) / 10,
    provenance: [...assetProvenance(asset),
      { kind: 'MODEL_ASSUMPTION', sourceId: 'default-assumptions.json', method: 'Hospital share, staffing, unit costs, scenario drift', assumptions: ['Not survey findings'] },
      { kind: 'SIMULATED', sourceId: 'sim', method: 'Queue/capacity outcomes after player decisions' }],
  };
}
