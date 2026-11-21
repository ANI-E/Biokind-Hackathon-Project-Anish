import type { Controller } from '../controller';
import { PLAYABLE, type PlayableService } from '@hospital/sim';
import { usd, hrs } from '../format';
import { Badge } from './Badge';
import { CoachCard } from './CoachCard';
import { MissionCard } from './ScoreCard';

export function ManagePanel({ ctl }: { ctl: Controller }) {
  const sim = ctl.sim, s = sim.state, a = sim.a, n = s.year - 2024;
  const wage = Math.pow(1 + a.scenario.wageInflationPerYear, n), gen = Math.pow(1 + a.scenario.generalInflationPerYear, n);
  const rev = s.ledger['revenue.emergency'] + s.ledger['revenue.outpatient'];
  const ytdCost = Object.entries(s.ledger).filter(([k]) => k.startsWith('cost.')).reduce((t, [, v]) => t + v, 0);
  const payroll = PLAYABLE.reduce((t, k) => t + s.departments[k].physicians * a.costs.physicianSalaryCents + s.departments[k].nurses * a.costs.nurseSalaryCents, 0) * wage;
  const hireMsg = (svc: PlayableService, role: 'nurse' | 'physician', dir: 1 | -1) => ctl.act({ type: dir > 0 ? 'hire' : 'fire', service: svc, role, count: 1 });
  return (
    <div className="panel-body">
      <MissionCard ctl={ctl} />
      <CoachCard ctl={ctl} />
      <section className="card">
        <h3>Year to date</h3>
        <div className="kv"><span>Revenue</span><b>{usd(rev)}</b></div>
        <div className="kv"><span>Costs</span><b>{usd(ytdCost)}</b></div>
        <div className="kv"><span>Net</span><b className={rev - ytdCost < 0 ? 'neg' : 'pos'}>{usd(rev - ytdCost)}</b></div>
        <div className="kv"><span>Annual payroll (current staff)</span><b>{usd(payroll)}</b></div>
        
      </section>
      {PLAYABLE.map((svc) => {
        const d = s.departments[svc], posts = sim.postsReal(d);
        const roomCost = Math.round(a.costs.roomBuildCostCents[svc] * gen);
        const avgWait = s.yearAcc.treated[svc] ? s.yearAcc.waitSum[svc] / s.yearAcc.treated[svc] : 0;
        return (
          <section className="card" key={svc}>
            <h3>{svc === 'emergency' ? 'Emergency' : svc === 'inpatient' ? 'Inpatient ward' : 'Outpatient clinic'}</h3>
            <div className="kv"><span>Capacity (staffed posts)</span><b>{posts.toFixed(1)}</b></div>
            <div className="kv"><span>Waiting · in care · avg wait</span><b>{d.queue.length} · {d.inService.length} · {hrs(avgWait)}</b></div>
            <Stepper label="Physicians" value={d.physicians} cost={`${usd(Math.round(a.costs.physicianSalaryCents * wage))}/yr`} onMinus={() => hireMsg(svc, 'physician', -1)} onPlus={() => hireMsg(svc, 'physician', 1)} />
            <Stepper label="Nurses" value={d.nurses} cost={`${usd(Math.round(a.costs.nurseSalaryCents * wage))}/yr`} onMinus={() => hireMsg(svc, 'nurse', -1)} onPlus={() => hireMsg(svc, 'nurse', 1)} />
            <div className="row"><span>Rooms/beds: <b>{d.roomSlots}</b></span>
              <button onClick={() => ctl.act({ type: 'addRoom', service: svc })}>+ Build room ({usd(roomCost, true)})</button></div>
            <details><summary>How capacity works</summary><p className="note">Capacity = the smallest of rooms, physicians and nurses. One post needs {a.staffing[svc].fteToCoverPost} FTE per role ({svc === 'emergency' ? '24/7' : `${a.staffing[svc].openHours.join('–')}h`}) and {a.staffing[svc].nursesPerPost} nurse(s) per physician. <Badge kind="MODEL_ASSUMPTION" /></p></details>
          </section>
        );
      })}
      <section className="card">
        <h3>Faster care</h3>
        <div className="row wrap">{a.costs.processImprovementCostCents.map((c, L) => (
          <button key={L} className={s.processLevel === L ? 'on' : ''} disabled={L < s.processLevel} onClick={() => ctl.act({ type: 'setProcessLevel', level: L })}>
            {L === 0 ? 'None' : `L${L}`}{L > 0 ? ` · ${usd(c, true)}` : ''}</button>))}</div>
        <p className="note">Faster treatment (×{a.costs.processImprovementServiceTimeMultiplier[s.processLevel]}). Upkeep {usd(a.costs.processImprovementUpkeepCents[s.processLevel])}/yr.</p>
      </section>
      <section className="card">
        <h3>Patient aid fund</h3>
        <div className="row wrap">{[0, 10000000, 25000000, 50000000].map((b) => (
          <button key={b} className={s.subsidyBudgetCents === b ? 'on' : ''} onClick={() => ctl.act({ type: 'setSubsidy', budgetCents: b })}>{b === 0 ? 'Off' : `${usd(b, true)}/yr`}</button>))}</div>
        <p className="note">Pays low-income patients' out-of-pocket costs. Left this year: {usd(s.subsidyRemainingCents)}.</p>
      </section>
    </div>
  );
}
function Stepper(p: { label: string; value: number; cost: string; onMinus: () => void; onPlus: () => void }) {
  return <div className="row"><span>{p.label}: <b>{p.value}</b> <small>{p.cost}</small></span>
    <span><button aria-label={`Fire ${p.label}`} onClick={p.onMinus}>−</button><button aria-label={`Hire ${p.label}`} onClick={p.onPlus}>+</button></span></div>;
}
