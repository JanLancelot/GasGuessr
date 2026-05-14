import { SimulationState, useSimulationStore } from '../store/useSimulationStore';

const opecMod = [+2.5, +1.0, 0, -1.0, -2.5];
const geoLabels = ['Stable (0)', 'Low Tension (1)', 'Moderate Risk (2)', 'High Conflict (3)', 'Severe Crisis (4)'];
const opecLabels = ['Aggressive Cut (0)', 'Moderate Cut (1)', 'Neutral (2)', 'Boost Supply (3)', 'Flood Market (4)'];

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

function interpolatedPercentile(sorted: number[], p: number): number {
  const n = sorted.length;
  if (n === 0) return 0;
  if (n === 1) return sorted[0];
  const idx = p * (n - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const frac = idx - lo;
  return sorted[lo] * (1 - frac) + sorted[hi] * frac;
}

export function getHistStats(
  state: SimulationState,
  lookbackWeeks?: number
): { drift: number; vol: number; nWeeks: number; ewmaVol: number } {
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
  if (n === 0) return { drift: 0, vol: 0.05, nWeeks: 0, ewmaVol: 0.05 };

  const drift = lr.reduce((s, v) => s + v, 0) / n;

  const vol = Math.sqrt(
    lr.reduce((s, v) => s + Math.pow(v - drift, 2), 0) / Math.max(n - 1, 1)
  );

  const lambda = 0.94;
  let ewmaVar = vol * vol;
  for (let i = 0; i < lr.length; i++) {
    ewmaVar = lambda * ewmaVar + (1 - lambda) * Math.pow(lr[i] - drift, 2);
  }
  const ewmaVol = Math.sqrt(ewmaVar);

  return { drift, vol, nWeeks: n, ewmaVol };
}

export function getBlendedCal(state: SimulationState): {
  drift: number;
  vol: number;
  nWeeks: number;
} {
  const m = state.lookbackMode;
  if (m === 'full') {
    const s = getHistStats(state);
    return { drift: s.drift, vol: s.ewmaVol, nWeeks: s.nWeeks };
  }
  if (m === 'recent') {
    const s = getHistStats(state, 8);
    return { drift: s.drift, vol: s.ewmaVol, nWeeks: s.nWeeks };
  }
  if (m === 'crisis') {
    const s = getHistStats(state, 4);
    return { drift: s.drift, vol: s.ewmaVol, nWeeks: s.nWeeks };
  }

  const f = getHistStats(state),
    r = getHistStats(state, 8),
    c = getHistStats(state, 4);

  const wF = Math.sqrt(Math.max(f.nWeeks, 1)) * 0.3;
  const wR = Math.sqrt(Math.max(r.nWeeks, 1)) * 0.5;
  const wC = Math.sqrt(Math.max(c.nWeeks, 1)) * 0.2;
  const totalW = wF + wR + wC;

  return {
    drift: (wF * f.drift + wR * r.drift + wC * c.drift) / totalW,
    vol: (wF * f.ewmaVol + wR * r.ewmaVol + wC * c.ewmaVol) / totalW,
    nWeeks: f.nWeeks,
  };
}

export function detectRegime(stats: { drift: number; vol: number }): {
  label: string;
  color: string;
} {
  const d = stats.drift;
  const v = stats.vol;
  if (d > 0.06 || (d > 0.03 && v > 0.08)) return { label: '🔴 CRISIS SPIKE', color: 'up' };
  if (d > 0.025) return { label: '🟠 STRONG UP', color: 'up' };
  if (d > 0.005) return { label: '🟡 MILD UP', color: 'neutral' };
  if (d > -0.005) return { label: '🟢 STABLE', color: 'down' };
  if (d > -0.025) return { label: '🟢 MILD DOWN', color: 'down' };
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

function estimateEquilibrium(state: SimulationState): number {
  const prices = state.history.map((r) =>
    state.fuel === 'gasoline' ? r.g : r.d
  );
  if (prices.length === 0) return state.prices[state.fuel].current;

  const alpha = 0.15;
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = alpha * prices[i] + (1 - alpha) * ema;
  }
  return ema;
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
    `Starting MCS: ${state.iter.toLocaleString()} iter × ${state.projWeeks
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

  const fullStats = getHistStats(state);
  state.addLog(
    'HIST',
    `Full: μ=${(fullStats.drift * 100).toFixed(3)}% σ=${(
      fullStats.vol * 100
    ).toFixed(3)}% ewma_σ=${(fullStats.ewmaVol * 100).toFixed(3)}% (${fullStats.nWeeks}wk)`
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
    `Fuel-MOPS correlation: ${corr.toFixed(3)}`
  );


  const geoVolMult = [1.0, 1.15, 1.35, 1.6, 2.0][state.geo];
  const geoDriftAdd = [0, 0.003, 0.008, 0.018, 0.035][state.geo];
  const geoTailProb = [0.01, 0.02, 0.04, 0.07, 0.10][state.geo];
  const geoTailSize = [0.005, 0.01, 0.025, 0.05, 0.08][state.geo];

  const opecDriftAdd = [0.025, 0.012, 0, -0.012, -0.025][state.opec];

  const demandDriftAdd = (state.demand - 1.0) * 0.08;

  const histCrude =
    state.history.length > 0 ? state.history[state.history.length - 1].c : state.crude;
  const crudePctChange = histCrude > 0 ? (state.crude - histCrude) / histCrude : 0;
  const crudeDriftAdd = crudePctChange * 0.15 * corr;

  const neutralFx = 58;
  const fxPctDeviation = (state.fx - neutralFx) / neutralFx;
  const fxDriftAdd = fxPctDeviation * 0.05;

  const adjDrift = calStats.drift + geoDriftAdd + opecDriftAdd + demandDriftAdd + crudeDriftAdd + fxDriftAdd;
  const adjVol = Math.max(0.005, calStats.vol * geoVolMult);

  const equilibrium = estimateEquilibrium(state);
  const kappa = 0.08;

  const regime = detectRegime({ drift: adjDrift, vol: adjVol });

  state.addLog(
    'CAL ',
    `Regime (adjusted): ${regime.label}`
  );
  state.addLog(
    'ADJ ',
    `Scenario modifiers → geo: +${(geoDriftAdd * 100).toFixed(2)}%/wk, ` +
    `opec: ${opecDriftAdd >= 0 ? '+' : ''}${(opecDriftAdd * 100).toFixed(2)}%/wk, ` +
    `demand: ${demandDriftAdd >= 0 ? '+' : ''}${(demandDriftAdd * 100).toFixed(2)}%/wk`
  );
  state.addLog(
    'ADJ ',
    `MOPS dev: ${crudeDriftAdd >= 0 ? '+' : ''}${(crudeDriftAdd * 100).toFixed(2)}%/wk, ` +
    `FX dev: ${fxDriftAdd >= 0 ? '+' : ''}${(fxDriftAdd * 100).toFixed(2)}%/wk | ` +
    `Vol ×${geoVolMult.toFixed(2)}`
  );
  state.addLog(
    'GBM ',
    `Final adjusted: μ=${(adjDrift * 100).toFixed(3)}%/wk σ=${(
      adjVol * 100
    ).toFixed(3)}%/wk`
  );
  state.addLog(
    'O-U ',
    `Mean-reversion: κ=${kappa.toFixed(3)}/wk, equilibrium=₱${equilibrium.toFixed(2)}`
  );

  for (let i = 0; i < state.iter; i += BATCH) {
    for (let j = 0; j < BATCH && i + j < state.iter; j++) {
      let price = currentPrice;
      weeklyPaths[0].push(price);
      for (let w = 0; w < state.projWeeks; w++) {
        const logP = Math.log(price);
        const logEq = Math.log(equilibrium);
        const reversionPull = kappa * (logEq - logP);
        const effectiveDrift = adjDrift + reversionPull;

        price = price * Math.exp(effectiveDrift + adjVol * randn());

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

  const crudeKappa = 0.05;
  const fxKappa = 0.08;

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
    `OPEC drift: ${opecMod[state.opec] > 0 ? '+' : ''
    }${(opecMod[state.opec] * 0.3).toFixed(2)} $/wk on MOPS`
  );
  state.addLog(
    'FORM',
    `Mean-reversion: crude κ=${crudeKappa}, FX κ=${fxKappa}`
  );

  for (let i = 0; i < state.iter; i += BATCH) {
    for (let j = 0; j < BATCH && i + j < state.iter; j++) {
      let projCrude = state.crude;
      let projFx = state.fx;
      weeklyPaths[0].push(currentPrice);

      for (let w = 0; w < state.projWeeks; w++) {
        const crudeReversion = crudeKappa * (state.crude - projCrude);
        projCrude += crudeReversion + randn() * crudeVol + opecMod[state.opec] * 0.3;

        const fxReversion = fxKappa * (state.fx - projFx);
        projFx += fxReversion + randn() * fxVol;

        projCrude = Math.max(30, projCrude);
        projFx = Math.max(40, projFx);

        const projDemand = state.demand * (1 + randn() * 0.03);
        const demandMult = Math.max(state.demand * 0.75, Math.min(state.demand * 1.25, projDemand));
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

  const p5 = interpolatedPercentile(results, 0.05);
  const p95 = interpolatedPercentile(results, 0.95);
  const median = interpolatedPercentile(results, 0.50);

  const pRise = results.filter((v) => v > currentPrice * 1.005).length / n;
  const pFall = results.filter((v) => v < currentPrice * 0.995).length / n;
  const pStable = Math.max(0, 1 - pRise - pFall);

  const skewness = sd > 0
    ? results.reduce((s, v) => s + Math.pow((v - mean) / sd, 3), 0) / n
    : 0;

  const weeklyMeans = weeklyPaths.map((a) =>
    a.length ? a.reduce((s, v) => s + v, 0) / a.length : currentPrice
  );
  const weeklyMedians = weeklyPaths.map((a) => {
    if (!a.length) return currentPrice;
    const s = [...a].sort((x, y) => x - y);
    return interpolatedPercentile(s, 0.50);
  });
  const weeklyP5 = weeklyPaths.map((a) => {
    if (!a.length) return currentPrice;
    const s = [...a].sort((x, y) => x - y);
    return interpolatedPercentile(s, 0.05);
  });
  const weeklyP95 = weeklyPaths.map((a) => {
    if (!a.length) return currentPrice;
    const s = [...a].sort((x, y) => x - y);
    return interpolatedPercentile(s, 0.95);
  });
  const weeklyP25 = weeklyPaths.map((a) => {
    if (!a.length) return currentPrice;
    const s = [...a].sort((x, y) => x - y);
    return interpolatedPercentile(s, 0.25);
  });
  const weeklyP75 = weeklyPaths.map((a) => {
    if (!a.length) return currentPrice;
    const s = [...a].sort((x, y) => x - y);
    return interpolatedPercentile(s, 0.75);
  });

  state.addLog(
    'STAT',
    `Mean: ₱${mean.toFixed(2)} | Median: ₱${median.toFixed(2)} | SD: ₱${sd.toFixed(
      3
    )} | 90% CI: [₱${p5.toFixed(2)}, ₱${p95.toFixed(2)}]`
  );
  state.addLog(
    'STAT',
    `Skewness: ${skewness.toFixed(3)} (${skewness > 0.3 ? 'right-skewed ↗' : skewness < -0.3 ? 'left-skewed ↙' : 'symmetric ↔'})`
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
    median,
    sd,
    p5,
    p95,
    pRise,
    pFall,
    pStable,
    skewness,
    rawResults: results,
    weeklyMeans,
    weeklyMedians,
    weeklyP5,
    weeklyP95,
    weeklyP25,
    weeklyP75,
  });
}
