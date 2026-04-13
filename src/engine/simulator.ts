import { useSimulationStore, DataRow, SimulationState } from '../store/useSimulationStore';

const opecMod = [+2.5, +1.0, 0, -1.0, -2.5];
const geoLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
const opecLabels = ['Cut Hard', 'Cut', 'Neutral', 'Boost', 'Boost Hard'];

function randn(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function uniform(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

export function getHistStats(
  state: SimulationState,
  lookbackWeeks?: number
): { drift: number; vol: number; nWeeks: number } {
  const prices = state.history.map((r) =>
    state.fuel === 'gasoline' ? r.g : r.d
  );
  const start = lookbackWeeks
    ? Math.max(0, prices.length - lookbackWeeks - 1)
    : 0;
  const slice = prices.slice(start);
  const lr: number[] = [];
  for (let i = 1; i < slice.length; i++) {
    if (slice[i - 1] > 0) lr.push(Math.log(slice[i] / slice[i - 1]));
  }
  const n = lr.length;
  if (n === 0) return { drift: 0, vol: 0.05, nWeeks: 0 };
  const drift = lr.reduce((s, v) => s + v, 0) / n;
  const vol = Math.sqrt(
    lr.reduce((s, v) => s + Math.pow(v - drift, 2), 0) / Math.max(n - 1, 1)
  );
  return { drift, vol, nWeeks: n };
}

export function getBlendedCal(state: SimulationState): {
  drift: number;
  vol: number;
  nWeeks: number;
} {
  const m = state.lookbackMode;
  if (m === 'full') return getHistStats(state);
  if (m === 'recent') return getHistStats(state, 8);
  if (m === 'crisis') return getHistStats(state, 4);
  const f = getHistStats(state),
    r = getHistStats(state, 8),
    c = getHistStats(state, 4);
  return {
    drift: 0.45 * c.drift + 0.35 * r.drift + 0.2 * f.drift,
    vol: 0.45 * c.vol + 0.35 * r.vol + 0.2 * f.vol,
    nWeeks: f.nWeeks,
  };
}

export function detectRegime(stats: { drift: number; vol: number }): {
  label: string;
  color: string;
} {
  const d = stats.drift;
  if (d > 0.08) return { label: '🔴 CRISIS SPIKE', color: 'up' };
  if (d > 0.03) return { label: '🟠 STRONG UP', color: 'up' };
  if (d > 0.005) return { label: '🟡 MILD UP', color: 'neutral' };
  if (d > -0.005) return { label: '🟢 STABLE', color: 'down' };
  if (d > -0.03) return { label: '🟢 MILD DOWN', color: 'down' };
  return { label: '🟢 STRONG DOWN', color: 'down' };
}

function getCrudeCorrelation(state: SimulationState): number {
  const fp = state.history.map((r) => (state.fuel === 'gasoline' ? r.g : r.d));
  const cp = state.history.map((r) => r.c);
  const fR: number[] = [],
    cR: number[] = [];
  for (let i = 1; i < fp.length; i++) {
    if (fp[i - 1] > 0 && cp[i - 1] > 0) {
      fR.push(Math.log(fp[i] / fp[i - 1]));
      cR.push(Math.log(cp[i] / cp[i - 1]));
    }
  }
  const n = fR.length;
  if (n < 3) return 0.7;
  const mf = fR.reduce((s, v) => s + v, 0) / n,
    mc = cR.reduce((s, v) => s + v, 0) / n;
  let cov = 0,
    vf = 0,
    vc = 0;
  for (let i = 0; i < n; i++) {
    cov += (fR[i] - mf) * (cR[i] - mc);
    vf += Math.pow(fR[i] - mf, 2);
    vc += Math.pow(cR[i] - mc, 2);
  }
  return vf === 0 || vc === 0 ? 0.7 : cov / Math.sqrt(vf * vc);
}

export async function runSimulation(progressCallback?: (pct: number) => void) {
  const state = useSimulationStore.getState();
  if (state.running) return;

  if (state.calMode === 'historical' && state.history.length < 3) {
    state.addLog('ERR', 'Historical mode requires at least 3 data points.');
    return;
  }

  state.setRunning(true);
  state.clearLog();

  const currentPrice = state.prices[state.fuel].current;
  if (!currentPrice || currentPrice <= 0) {
    state.addLog('ERR', 'No valid current price. Load data first.');
    state.setRunning(false);
    return;
  }

  state.addLog(
    'INFO',
    `Starting MCS: ${state.iter.toLocaleString()} iter × ${
      state.projWeeks
    } wk | Mode: ${state.calMode.toUpperCase()}`
  );
  state.addLog(
    'INIT',
    `Fuel: ${state.fuel.toUpperCase()} | Price: ₱${currentPrice.toFixed(
      2
    )} | MOPS: $${state.crude} | FX: ₱${state.fx}`
  );
  state.addLog(
    'INIT',
    `Geo: ${geoLabels[state.geo]} | OPEC: ${opecLabels[state.opec]} | Demand: ${state.demand.toFixed(
      2
    )}x`
  );

  const results: number[] = [];
  const weeklyPaths: number[][] = [];
  for (let w = 0; w <= state.projWeeks; w++) weeklyPaths.push([]);
  const BATCH = 500;

  if (state.calMode === 'historical') {
    await runHistoricalSim(
      state,
      currentPrice,
      results,
      weeklyPaths,
      BATCH,
      progressCallback
    );
  } else {
    await runFormulaSim(
      state,
      currentPrice,
      results,
      weeklyPaths,
      BATCH,
      progressCallback
    );
  }

  state.addLog('DONE', `Processing ${results.length.toLocaleString()} outcomes…`);
  processResults(state, results, currentPrice, weeklyPaths);

  state.setRunning(false);
  if (progressCallback) progressCallback(100);
}

async function runHistoricalSim(
  state: SimulationState,
  currentPrice: number,
  results: number[],
  weeklyPaths: number[][],
  BATCH: number,
  progressCallback?: (pct: number) => void
) {
  const calStats = getBlendedCal(state);
  const corr = getCrudeCorrelation(state);
  const regime = detectRegime(calStats);

  const fullStats = getHistStats(state);
  state.addLog(
    'HIST',
    `Full: μ=${(fullStats.drift * 100).toFixed(3)}% σ=${(
      fullStats.vol * 100
    ).toFixed(3)}% (${fullStats.nWeeks}wk)`
  );
  if (state.history.length >= 10) {
    const rStats = getHistStats(state, 8);
    state.addLog(
      'HIST',
      `Recent 8wk: μ=${(rStats.drift * 100).toFixed(3)}% σ=${(
        rStats.vol * 100
      ).toFixed(3)}%`
    );
  }
  if (state.history.length >= 6) {
    const cStats = getHistStats(state, 4);
    state.addLog(
      'HIST',
      `Crisis 4wk: μ=${(cStats.drift * 100).toFixed(3)}% σ=${(
        cStats.vol * 100
      ).toFixed(3)}%`
    );
  }
  state.addLog(
    'CAL ',
    `Blended (${state.lookbackMode}): μ=${(calStats.drift * 100).toFixed(
      3
    )}% σ=${(calStats.vol * 100).toFixed(3)}%`
  );
  state.addLog(
    'CAL ',
    `Fuel-MOPS correlation: ${corr.toFixed(3)} | Regime: ${regime.label}`
  );

  const baseCrude =
    state.history.length > 0 ? state.history[state.history.length - 1].c : state.crude;
  const crudeDeviation =
    baseCrude > 0 ? (state.crude - baseCrude) / baseCrude : 0;
  const fxDeviation = (state.fx - 60.19) / 60.19;
  const geoVolScale = 1 + state.geo * 0.1;
  const opecDriftAdj = (opecMod[state.opec] / Math.max(baseCrude, 60)) * 0.12;
  const demandDriftAdj = (state.demand - 1.0) * 0.06;

  const adjDrift =
    calStats.drift +
    crudeDeviation * 0.2 * Math.abs(corr) +
    fxDeviation * 0.12 +
    opecDriftAdj +
    demandDriftAdj;
  const adjVol = calStats.vol * geoVolScale;
  const geoTailProb = 0.015 * (state.geo + 1);
  const geoTailSize = [0.005, 0.01, 0.02, 0.04, 0.07][state.geo];

  state.addLog(
    'GBM ',
    `Adjusted: μ=${(adjDrift * 100).toFixed(3)}%/wk σ=${(
      adjVol * 100
    ).toFixed(3)}%/wk`
  );

  for (let i = 0; i < state.iter; i += BATCH) {
    for (let j = 0; j < BATCH && i + j < state.iter; j++) {
      let price = currentPrice;
      weeklyPaths[0].push(price);
      for (let w = 0; w < state.projWeeks; w++) {
        price *= Math.exp(
          adjDrift - 0.5 * adjVol * adjVol + adjVol * randn()
        );
        if (Math.random() < geoTailProb) {
          price *= 1 + (Math.random() < 0.8 ? 1 : -1) * uniform(0.002, geoTailSize);
        }
        price = Math.max(price, 1);
        weeklyPaths[w + 1].push(price);
      }
      results.push(price);
    }
    const pct = Math.min(100, ((i + BATCH) / state.iter) * 100);
    if (progressCallback) progressCallback(pct);
    await new Promise((r) => setTimeout(r, 0));
  }
}

async function runFormulaSim(
  state: SimulationState,
  currentPrice: number,
  results: number[],
  weeklyPaths: number[][],
  BATCH: number,
  progressCallback?: (pct: number) => void
) {
  const excise = state.prices[state.fuel].excise;
  const freightUsd = state.fuel === 'gasoline' ? 2.50 : 3.00;
  const margin = state.fuel === 'gasoline' ? 5.0 : 8.0;
  const vat = 0.12;

  const theoreticalBase =
    (((state.crude + freightUsd) / 158.98) * state.fx * state.demand + excise + margin) *
    (1 + vat);
  const calFactor = theoreticalBase > 0 ? currentPrice / theoreticalBase : 1;

  const crudeBaseVol = 3.0;
  const fxBaseVol = 0.5;
  const geoVolMult = [1.0, 1.2, 1.5, 1.8, 2.2][state.geo];
  const geoTailProb = [0.01, 0.02, 0.04, 0.06, 0.08][state.geo];
  const geoTailSize = [0.005, 0.01, 0.02, 0.04, 0.07][state.geo];
  const crudeVol = crudeBaseVol * geoVolMult;
  const fxVol = fxBaseVol * geoVolMult;

  state.addLog(
    'FORM',
    `Formula: (((MOPS+$${freightUsd.toFixed(2)})/158.98)×FX×demand + ₱${excise} + ₱${margin}) × ${(1 + vat).toFixed(2)}`
  );
  state.addLog(
    'FORM',
    `Calibration factor: ${calFactor.toFixed(
      4
    )} (anchors formula to current ₱${currentPrice.toFixed(2)})`
  );
  state.addLog(
    'FORM',
    `MOPS σ: $${crudeVol.toFixed(1)}/wk | FX σ: ₱${fxVol.toFixed(
      2
    )}/wk | Geo vol ×${geoVolMult.toFixed(1)}`
  );
  state.addLog(
    'FORM',
    `OPEC drift: ${
      opecMod[state.opec] > 0 ? '+' : ''
    }${(opecMod[state.opec] * 0.3).toFixed(2)} $/wk on MOPS`
  );

  for (let i = 0; i < state.iter; i += BATCH) {
    for (let j = 0; j < BATCH && i + j < state.iter; j++) {
      let projCrude = state.crude;
      let projFx = state.fx;
      weeklyPaths[0].push(currentPrice);

      for (let w = 0; w < state.projWeeks; w++) {
        projCrude += randn() * crudeVol + opecMod[state.opec] * 0.3;
        projFx += randn() * fxVol;
        projCrude = Math.max(30, projCrude);
        projFx = Math.max(40, projFx);

        const projDemand = state.demand * (1 + randn() * 0.03);
        const demandMult = Math.max(0.8, Math.min(1.2, projDemand));
        let price =
          (((projCrude + freightUsd) / 158.98) * projFx * demandMult + excise + margin) *
          (1 + vat) *
          calFactor;

        if (Math.random() < geoTailProb) {
          price *= 1 + (Math.random() < 0.8 ? 1 : -1) * uniform(0.002, geoTailSize);
        }
        price = Math.max(price, 1);
        weeklyPaths[w + 1].push(price);
      }
      results.push(
        weeklyPaths[state.projWeeks][weeklyPaths[state.projWeeks].length - 1]
      );
    }
    const pct = Math.min(100, ((i + BATCH) / state.iter) * 100);
    if (progressCallback) progressCallback(pct);
    await new Promise((r) => setTimeout(r, 0));
  }
}

function processResults(
  state: SimulationState,
  results: number[],
  currentPrice: number,
  weeklyPaths: number[][]
) {
  results.sort((a, b) => a - b);
  const n = results.length;
  const mean = results.reduce((s, v) => s + v, 0) / n;
  const sd = Math.sqrt(
    results.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / n
  );
  const p5 = results[Math.floor(n * 0.05)];
  const p95 = results[Math.floor(n * 0.95)];
  const pRise = results.filter((v) => v > currentPrice * 1.005).length / n;
  const pFall = results.filter((v) => v < currentPrice * 0.995).length / n;
  const pStable = 1 - pRise - pFall;

  const weeklyMeans = weeklyPaths.map((a) =>
    a.length ? a.reduce((s, v) => s + v, 0) / a.length : currentPrice
  );
  const weeklyP5 = weeklyPaths.map((a) => {
    if (!a.length) return currentPrice;
    const s = [...a].sort((x, y) => x - y);
    return s[Math.floor(s.length * 0.05)];
  });
  const weeklyP95 = weeklyPaths.map((a) => {
    if (!a.length) return currentPrice;
    const s = [...a].sort((x, y) => x - y);
    return s[Math.floor(s.length * 0.95)];
  });

  state.addLog(
    'STAT',
    `Mean: ₱${mean.toFixed(2)} | SD: ₱${sd.toFixed(
      3
    )} | 90% CI: [₱${p5.toFixed(2)}, ₱${p95.toFixed(2)}]`
  );
  state.addLog(
    'PROB',
    `P(↑)=${(pRise * 100).toFixed(1)}% P(→)=${(pStable * 100).toFixed(
      1
    )}% P(↓)=${(pFall * 100).toFixed(1)}%`
  );

  state.addLog('OK', `Forecast complete — ${state.calMode} mode.`);

  useSimulationStore.getState().setSimResults({
    mean,
    sd,
    p5,
    p95,
    pRise,
    pFall,
    pStable,
    rawResults: results,
    weeklyMeans,
    weeklyP5,
    weeklyP95,
  });
}
