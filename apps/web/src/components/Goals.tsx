import { coachTips, END_YEAR } from '@hospital/sim';
import type { Controller } from '../controller';
import { usd } from '../format';

const sum = (m: Record<string, number>) => Object.values(m).reduce((t, x) => t + x, 0);

/** Always-visible goals for the current year, plus the single next thing to do. */
export function Goals({ ctl }: { ctl: Controller }) {
  const s = ctl.sim.state, acc = s.yearAcc;
  const arrivals = sum(acc.arrivals), unmet = sum(acc.unmet), turned = acc.unmet.emergency + acc.unmet.inpatient;
  const seen = arrivals ? 1 - unmet / arrivals : 1;
  const goals = [
    { ok: s.cashCents >= s.cashStartOfYearCents, label: 'Cash', now: usd(s.cashCents, true), want: `beat ${usd(s.cashStartOfYearCents, true)}`, bad: s.cashCents < 0 },
    { ok: seen >= 0.99, label: 'Patients seen', now: `${(seen * 100).toFixed(1)}%`, want: '99%+', bad: seen < 0.9 },
    { ok: turned === 0, label: 'ER/ward turned away', now: String(turned), want: '0', bad: turned > 5 },
  ];
  const next = coachTips(ctl.sim).find((t) => t.severity === 'warn');
  return (
    <section className="goals" aria-label="Goals this year">
      <b className="goals-h">{s.year} goals <small>→ {END_YEAR}</small></b>
      {goals.map((g) => (
        <span key={g.label} className={`goal ${g.ok ? 'ok' : g.bad ? 'bad' : 'mid'}`} title={`Goal: ${g.want}`}>
          {g.ok ? '✓' : g.bad ? '✗' : '•'} {g.label}: <b>{g.now}</b> <small>/ {g.want}</small>
        </span>))}
      {next && !ctl.gameOver && (
        <span className="next">Next: <b>{next.title}</b>
          {next.apply ? <button className="primary sm" onClick={() => { for (const a of next.apply!.actions) { if (!ctl.act(a).ok) break; } }}>{next.apply.label}</button>
            : <button className="sm" onClick={() => ctl.openTab('manage')}>Open Manage</button>}
        </span>)}
    </section>
  );
}
