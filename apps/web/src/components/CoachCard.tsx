import { coachTips } from '@hospital/sim';
import type { Controller } from '../controller';
import { Badge } from './Badge';

export function CoachCard({ ctl }: { ctl: Controller }) {
  const tips = coachTips(ctl.sim);
  return (
    <section className="card coach">
      <h3>Advice</h3>
      {tips.map((t) => (
        <div key={t.id} className={`tip tip-${t.severity}`}>
          <b>{t.severity === 'warn' ? '⚠ ' : t.severity === 'good' ? '✓ ' : 'ℹ '}{t.title}</b>
          <details><summary>Why?</summary>
            <p className="fact"><Badge kind={ctl.isDemo ? 'DEMO_SYNTHETIC' : 'MEPS_CALIBRATED'} /> {t.meps}</p>
            <p className="note">{t.advice}</p></details>
          {t.apply && <button onClick={() => { for (const a of t.apply!.actions) { if (!ctl.act(a).ok) break; } }}>{t.apply.label}</button>}
          {t.tab === 'data' && <button onClick={() => ctl.openTab('data')}>Open MEPS Lab</button>}
        </div>))}
    </section>
  );
}
