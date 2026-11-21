import type { Controller } from '../controller';
import { describeModDef, trustFactor } from '@hospital/sim';
import { Badge } from './Badge';

const trustColor = (v: number) => (v >= 65 ? 'var(--green)' : v >= 40 ? 'var(--amber)' : 'var(--red)');

/** Community trust, the access policy, and what past decisions are still doing to the hospital. */
export function PoliciesCard({ ctl }: { ctl: Controller }) {
  const s = ctl.sim.state, a = ctl.sim.a, f = trustFactor(s.reputation, a), limited = s.policies.medicaidAccess === 'limited';
  return (
    <section className="card">
      <h3>Trust, policies and effects</h3>
      <div className="row"><span>Community trust</span><b style={{ color: trustColor(s.reputation) }}>{Math.round(s.reputation)}/100</b></div>
      <div className="meter"><i style={{ width: `${s.reputation}%`, background: trustColor(s.reputation) }} /></div>
      <p className="note">Trust moves monthly with how well you serve people: treating patients, avoiding transfers, short and fair waits. It scales how many choose you: demand <b>×{f.toFixed(2)}</b>. <Badge kind="MODEL_ASSUMPTION" /></p>

      <h4>Access policy</h4>
      <div className="row wrap">
        <button className={!limited ? 'on' : ''} onClick={() => ctl.act({ type: 'setPolicy', medicaidAccess: 'full' })}>Open to everyone</button>
        <button className={limited ? 'on' : ''} onClick={() => ctl.act({ type: 'setPolicy', medicaidAccess: 'limited' })}>Limit elective Medicaid &amp; uninsured</button>
      </div>
      <p className="note">The ER can never refuse anyone. Limiting turns away about {Math.round(a.trust.declineShareOfLimitedAccess * 100)}% of <i>non-emergency</i> clinic and ward patients who are on Medicaid or uninsured: it saves low-paying visits but counts against access, equity and trust.</p>

      <h4>Active effects of your decisions</h4>
      {s.modifiers.length === 0 ? <p className="note">None yet. Each year’s board meeting can add some.</p> :
        <ul className="effects">{s.modifiers.map((m) => <li key={m.id}><b>{m.label}</b>: {describeModDef(m)}</li>)}</ul>}

      {s.decisionLog.length > 0 && (<>
        <h4>Recent decisions</h4>
        <ul className="effects">{s.decisionLog.slice(-4).reverse().map((d) => <li key={`${d.year}${d.cardId}`}><b>{d.year}</b> {d.title}: {d.optionLabel}{d.deferred ? ' (deferred)' : ''}{d.failed ? ' (setback)' : ''}</li>)}</ul>
      </>)}
    </section>
  );
}
