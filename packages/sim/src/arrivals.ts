import type { Assumptions } from './assumptions';
import type { ServiceMap } from './types';

// Diurnal ER arrival shape (relative weight per hour of day). Illustrative MODEL_ASSUMPTION.
const ER_SHAPE = [2, 1.6, 1.4, 1.2, 1.2, 1.4, 1.8, 2.6, 3.6, 4.4, 4.8, 5, 5, 4.8, 4.6, 4.6, 4.8, 5, 5, 4.8, 4.2, 3.6, 3, 2.4];
const norm = (xs: number[]) => { const t = xs.reduce((x, y) => x + y, 0); return xs.map((v) => v / t); };
const cache = new WeakMap<Assumptions, ServiceMap<number[]>>();

/** Hourly arrival fractions per service (each sums to 1). Cached per assumptions object: it is read every simulated hour. */
export function arrivalProfiles(a: Assumptions): ServiceMap<number[]> {
  let p = cache.get(a);
  if (!p) {
    const [open, close] = a.staffing.outpatient.openHours;
    p = {
      emergency: norm(ER_SHAPE),
      inpatient: norm(Array(24).fill(1)),
      outpatient: norm(Array.from({ length: 24 }, (_, h) => (h >= open && h < close ? 1 : 0))),
    };
    cache.set(a, p);
  }
  return p;
}
