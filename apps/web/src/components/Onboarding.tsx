import type { Controller } from '../controller';
export function Onboarding({ ctl, onClose }: { ctl: Controller; onClose: () => void }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="modal">
        <h2>Hospital Tycoon: 2044</h2>
        <p>Run a hospital from 2024 to 2044. Stay open, see everyone, keep the ER safe.</p>
        {ctl.isDemo && <div className="banner demo">DEMO MODE: SYNTHETIC PLACEHOLDER DATA. MEPS CALIBRATION NOT YET LOADED.</div>}
        <ol className="steps">
          <li><b>Check the goals bar</b> at the top. Aim for all green.</li>
          <li><b>Hit "Next:"</b> to follow the advice, or open <b>Manage</b> to hire staff and build rooms.</li>
          <li><b>Press Play.</b> Each year starts with a 2-question data quiz for bonus cash.</li>
        </ol>
        <p className="note">WASD move · E use desk · Space pause · M mute</p>
        <label className="chk"><input type="checkbox" checked={ctl.challenge} onChange={(e) => ctl.setChallenge(e.target.checked)} /> Challenge mode: random yearly events (flu, recession)</label>
                <div className="row">
          <button className="primary" onClick={() => { onClose(); ctl.openBriefing(true); }}>Start 2024</button>
          <button onClick={() => ctl.setHelp(true)}>How to play</button>
          {ctl.hasSave() && <button onClick={() => { ctl.load(); onClose(); }}>Continue saved game</button>}
        </div>
      </div>
    </div>
  );
}
