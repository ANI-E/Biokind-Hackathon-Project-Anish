import type { Controller } from '../controller';
import { describeOption, getCard } from '@hospital/sim';
import { usd } from '../format';
import { Badge } from './Badge';

/** Yearly board meeting: one dilemma, each option with its price, lasting effects and risk. Choosing is the only way to avoid the default. */
export function DecisionModal({ ctl }: { ctl: Controller }) {
  const st = ctl.sim.state, res = ctl.decisionResult;
  if (res) {
    return (
      <div className="overlay" role="dialog" aria-modal="true" aria-label="Decision result">
        <div className="modal board">
          <p className="eyebrow">{res.failed ? 'Setback' : 'Decision made'}</p>
          <h2>{res.title}</h2>
          <p>You chose: <b>{res.optionLabel}</b></p>
          <div className={`reveal ${res.failed ? 'no' : 'ok'}`}><p>{res.text}</p></div>
          <div className="chips">
            {res.cashCents !== 0 && <span className={`chip ${res.cashCents < 0 ? 'neg' : 'pos'}`}>Cash {res.cashCents < 0 ? '−' : '+'}{usd(Math.abs(res.cashCents))}</span>}
            {res.trustDelta !== 0 && <span className={`chip ${res.trustDelta < 0 ? 'neg' : 'pos'}`}>Trust {res.trustDelta > 0 ? '+' : '−'}{Math.abs(res.trustDelta).toFixed(1)}</span>}
          </div>
          <p className="note">Lasting effects are listed under “Active effects” in the Manage tab.</p>
          <div className="row"><button className="primary" onClick={() => ctl.closeDecisionResult()}>Continue</button></div>
        </div>
      </div>
    );
  }
  const pc = st.pendingCard, card = pc && getCard(pc.cardId); if (!pc || !card) return null;
  const fact = card.fact?.(ctl.asset, { last: st.snapshots.at(-1) });
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Board meeting">
      <div className="modal wide board">
        <p className="eyebrow">Board meeting · {pc.year}</p>
        <h2>{card.title}</h2>
        <p>{card.story}</p>
        {fact && <div className="fact"><Badge kind={ctl.isDemo ? 'DEMO_SYNTHETIC' : 'MEPS_CALIBRATED'} /> {fact}</div>}
        <p className="note">Cash on hand {usd(st.cashCents)}. Every option has consequences. Effect sizes are scenario assumptions <Badge kind="MODEL_ASSUMPTION" />.</p>
        <div className="options">
          {card.options.map((o) => {
            const d = describeOption(o), afford = st.cashCents >= o.upfrontCents;
            return (
              <div className={`option ${o.id === card.defaultOptionId ? 'default' : ''}`} key={o.id}>
                <h3>{o.label}{o.id === card.defaultOptionId && <small> (what happens if you do nothing)</small>}</h3>
                <p className="note">{o.detail}</p>
                <ul>
                  <li className={d.cost ? 'cost' : 'free'}>{d.cost ? `Costs ${d.cost} now` : 'No upfront cost'}</li>
                  {d.effects.map((e) => <li key={e}>{e}</li>)}
                  {d.risk && <li className="risk">⚠ {d.risk}</li>}
                </ul>
                <button disabled={!afford} onClick={() => ctl.decide(o.id)}>{afford ? 'Choose this' : `Need ${usd(o.upfrontCents)}`}</button>
              </div>);
          })}
        </div>
      </div>
    </div>
  );
}
