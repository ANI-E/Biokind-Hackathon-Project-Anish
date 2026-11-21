import type { Controller } from '../controller';
import { END_YEAR } from '@hospital/sim';
import { Badge } from './Badge';

export function HowToPlay({ ctl }: { ctl: Controller }) {
  const w = ctl.sim.a.scoring.weights, pc = (x: number) => `${Math.round(x * 100)}%`;
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="How to play" style={{ zIndex: 60 }}>
      <div className="modal wide how">
        <h2>How to play</h2>
        <h3>Goal</h3>
        <p>Keep the hospital open and fair from 2024 to {END_YEAR}. Cash alone does not win.</p>
        <h3>Each year</h3>
        <ol>
          <li>Answer the data quiz (correct = bonus cash).</li>
          <li>Press Play. Hire staff, build rooms and open the ward any time.</li>
          <li>Read the year-end report, then continue.</li>
        </ol>
        <h3>Controls</h3>
        <p><b>WASD</b> move · <b>E</b> use desk or console · <b>Space</b> pause · <b>M</b> mute · <b>wheel</b> zoom · <b>click</b> a patient</p>
        <h3>Grade</h3>
        <table className="tbl"><thead><tr><th>Objective</th><th>Weight</th><th>Goal</th></tr></thead><tbody>
          <tr><td>Finance</td><td>{pc(w.finance)}</td><td>Stay solvent, end with more cash</td></tr>
          <tr><td>Access</td><td>{pc(w.access)}</td><td>See 99%+ of patients</td></tr>
          <tr><td>ER safety</td><td>{pc(w.safety)}</td><td>Turn away no ER or ward patients</td></tr>
          <tr><td>Equity</td><td>{pc(w.equity)}</td><td>Similar waits for every insurance group</td></tr>
          <tr><td>Affordability</td><td>{pc(w.affordability)}</td><td>Cover low-income out-of-pocket costs</td></tr>
          <tr><td>Data IQ</td><td>{pc(w.dataIq)}</td><td>Get quiz answers right</td></tr>
        </tbody></table>
        <p className="note">Weights are game design <Badge kind="MODEL_ASSUMPTION" />. Cash below zero for 60 days = bankrupt.</p>
        <h3>Tips</h3>
        <ul><li>Doing nothing bankrupts you. Open the ward and staff the ER first.</li><li>Challenge mode (intro screen) adds random yearly events.</li></ul>
        <div className="row"><button className="primary" onClick={() => ctl.setHelp(false)}>Got it</button></div>
      </div>
    </div>
  );
}
