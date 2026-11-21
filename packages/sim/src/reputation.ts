/** Community trust: a slow-moving 0-100 score of how well the hospital serves people, which scales future demand. */
import type { Assumptions } from './assumptions';
import type { YearAcc } from './stats';
import { PLAYABLE, type ServiceMap } from './types';

export interface MonthBase { arrivals: ServiceMap<number>; unmet: ServiceMap<number>; treated: ServiceMap<number>; waitSum: ServiceMap<number>; payer: Record<string, { w: number; t: number }> }

export function takeMonthBase(acc: YearAcc): MonthBase {
  return { arrivals: { ...acc.arrivals }, unmet: { ...acc.unmet }, treated: { ...acc.treated }, waitSum: { ...acc.waitSum },
    payer: Object.fromEntries(Object.entries(acc.byPayer).map(([k, g]) => [k, { w: g.waitTicksSum, t: g.treated }])) };
}
const delta = (a: ServiceMap<number>, b: ServiceMap<number>) => PLAYABLE.reduce((t, k) => t + a[k] - b[k], 0);

/** Service-quality target (0-100) for the month just ended, or null when there was too little activity to judge. */
export function trustTarget(base: MonthBase, acc: YearAcc): number | null {
  const arr = delta(acc.arrivals, base.arrivals); if (arr < 20) return null;
  const unmet = delta(acc.unmet, base.unmet), access = 1 - unmet / arr;
  const sArr = acc.arrivals.emergency + acc.arrivals.inpatient - base.arrivals.emergency - base.arrivals.inpatient;
  const sUn = acc.unmet.emergency + acc.unmet.inpatient - base.unmet.emergency - base.unmet.inpatient;
  const safety = sArr > 0 ? 1 - Math.min(1, sUn / sArr / 0.08) : 1;
  const treated = delta(acc.treated, base.treated), wait = treated ? delta(acc.waitSum, base.waitSum) / treated : 0;
  const speed = 1 - Math.min(1, wait / 6);
  const waits = Object.entries(acc.byPayer).map(([k, g]) => { const b = base.payer[k] ?? { w: 0, t: 0 }; return { t: g.treated - b.t, w: g.waitTicksSum - b.w }; }).filter((x) => x.t >= 15).map((x) => x.w / x.t);
  const fair = waits.length > 1 ? 1 - Math.min(1, (Math.max(...waits) - Math.min(...waits)) / 4) : 1;
  return 100 * (0.3 * access + 0.3 * safety + 0.2 * speed + 0.2 * fair);
}
export const nextTrust = (rep: number, target: number, a: Assumptions) => Math.max(0, Math.min(100, rep + a.trust.monthlyRate * (target - rep)));
export const trustFactor = (rep: number, a: Assumptions) => a.trust.minFactor + (a.trust.spanFactor * rep) / 100;
