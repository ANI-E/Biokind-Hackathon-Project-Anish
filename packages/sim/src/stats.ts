import { LEDGER_CATEGORIES, type GroupStats, type LedgerTotals, type ServiceMap, type Visit } from './types';

/** Counters for the year in progress; copied into the annual snapshot when the year closes. */
export interface YearAcc {
  arrivals: ServiceMap<number>; treated: ServiceMap<number>; unmet: ServiceMap<number>; waitSum: ServiceMap<number>;
  byPayer: Record<string, GroupStats>; byIncome: Record<string, GroupStats>; oop: number; subsidized: number;
}
const newGroup = (): GroupStats => ({ arrivals: 0, treated: 0, unmet: 0, waitTicksSum: 0, oopCents: 0, subsidizedOopCents: 0 });
const perService = (): ServiceMap<number> => ({ emergency: 0, outpatient: 0, inpatient: 0 });

export const freshAcc = (): YearAcc => ({ arrivals: perService(), treated: perService(), unmet: perService(), waitSum: perService(), byPayer: {}, byIncome: {}, oop: 0, subsidized: 0 });
export const zeroLedger = (): LedgerTotals => Object.fromEntries(LEDGER_CATEGORIES.map((c) => [c, 0])) as LedgerTotals;

/** The payer-group and income-group counters a visit contributes to. */
export function groupsOf(acc: YearAcc, v: Visit): [GroupStats, GroupStats] {
  return [(acc.byPayer[v.patient.payer] ??= newGroup()), (acc.byIncome[v.patient.incomeBand] ??= newGroup())];
}

const sumWhere = (l: LedgerTotals, prefix: string) => LEDGER_CATEGORIES.filter((k) => k.startsWith(prefix)).reduce((t, k) => t + l[k], 0);
export const totalRevenue = (l: LedgerTotals) => sumWhere(l, 'revenue.');
export const totalCosts = (l: LedgerTotals) => sumWhere(l, 'cost.');
