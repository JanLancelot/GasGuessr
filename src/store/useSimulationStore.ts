import { create } from 'zustand';

export type FuelType = 'gasoline' | 'diesel';
export type CalMode = 'historical' | 'formula';
export type DataSource = 'sample' | 'manual' | 'csv' | 'none';
export type LookbackMode = 'blend' | 'full' | 'recent' | 'crisis';

export interface DataRow {
  label: string;
  g: number;
  d: number;
  c: number;
}

export interface SimulationState {
  fuel: FuelType;
  crude: number;
  fx: number;
  demand: number;
  geo: number;
  opec: number;
  iter: number;
  projWeeks: number;
  lookbackMode: LookbackMode;
  calMode: CalMode;
  dataSource: DataSource;
  running: boolean;
  history: DataRow[];
  prices: {
    gasoline: { current: number; weekChange: number; excise: number };
    diesel: { current: number; weekChange: number; excise: number };
  };
  simLogs: { type: string; msg: string; time?: Date }[];
  simResults: {
    mean: number;
    sd: number;
    p5: number;
    p95: number;
    pRise: number;
    pFall: number;
    pStable: number;
    rawResults: number[];
    weeklyMeans: number[];
    weeklyP5: number[];
    weeklyP95: number[];
  } | null;
  language: 'en' | 'tl';

  setLanguage: (lang: 'en' | 'tl') => void;
  setFuel: (val: FuelType) => void;
  setVar: (key: string, val: number | string) => void;
  setHistory: (data: DataRow[], source: DataSource) => void;
  addLog: (type: string, msg: string) => void;
  clearLog: () => void;
  setSimResults: (results: any) => void;
  setRunning: (val: boolean) => void;
}

export const SAMPLE_DATA: DataRow[] = [
  ...[
    [60.1, 54.2, 72.5],
    [59.8, 54.0, 71.8],
    [60.5, 54.5, 72.2],
    [60.2, 54.1, 71.5],
    [61.0, 55.0, 73.0],
    [60.8, 54.8, 72.6],
    [61.5, 56.5, 74.5],
    [62.2, 58.0, 76.0],
    [63.0, 59.5, 77.2],
    [62.5, 58.8, 76.5],
    [63.8, 61.0, 78.5],
    [64.5, 62.5, 79.8],
    [64.0, 61.8, 79.0],
    [63.5, 60.5, 78.2],
    [64.2, 62.0, 79.5],
    [65.0, 64.0, 81.0],
    [65.5, 65.5, 82.5],
    [68.0, 72.0, 85.0],
    [72.5, 82.5, 88.5],
    [78.0, 95.0, 91.0],
    [85.5, 110.5, 93.5],
    [92.0, 128.0, 95.0],
    [98.5, 142.0, 96.5],
    [100.2, 145.0, 95.2],
  ].map(([g, d, c], i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - (23 - i) * 7);
    return {
      label: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      g,
      d,
      c,
    };
  }),
];

export const useSimulationStore = create<SimulationState>((set, get) => ({
  fuel: 'gasoline',
  crude: 95.20,
  fx: 59.93,
  demand: 1.0,
  geo: 4,
  opec: 1,
  iter: 10000,
  projWeeks: 2,
  lookbackMode: 'blend',
  calMode: 'historical',
  dataSource: 'sample',
  running: false,
  history: [...SAMPLE_DATA],
  prices: {
    gasoline: { current: 100.2, weekChange: +1.7, excise: 10.0 },
    diesel: { current: 145.0, weekChange: +3.0, excise: 6.0 },
  },
  simLogs: [
    { type: 'BOOT', msg: 'GasGuessr v3.1 initialized — mobile engine ready.' },
    { type: 'DATA', msg: 'Sample data loaded.' },
    { type: 'WAIT', msg: 'Awaiting simulation trigger…' },
  ],
  simResults: null,
  language: 'en',

  setLanguage: (val) => set({ language: val }),
  setFuel: (val) => set({ fuel: val, simResults: null }),
  setVar: (key, val) =>
    set((state) => ({ ...state, [key]: val, simResults: null })),
  setHistory: (data, source) => {
    if (data.length === 0) {
      set({ history: [], dataSource: 'none', simResults: null });
      return;
    }
    const last = data[data.length - 1];
    set((state) => {
      const pData = { ...state.prices };
      pData.gasoline.current = last.g;
      pData.diesel.current = last.d;
      if (data.length >= 2) {
        const prev = data[data.length - 2];
        pData.gasoline.weekChange = last.g - prev.g;
        pData.diesel.weekChange = last.d - prev.d;
      } else {
        pData.gasoline.weekChange = 0;
        pData.diesel.weekChange = 0;
      }

      return {
        history: data,
        dataSource: source,
        crude: last.c > 0 ? Math.round(last.c * 100) / 100 : state.crude,
        prices: pData,
        simResults: null,
      };
    });
  },
  addLog: (type, msg) =>
    set((state) => ({
      simLogs: [...state.simLogs, { type, msg, time: new Date() }],
    })),
  clearLog: () => set({ simLogs: [] }),
  setSimResults: (results) => set({ simResults: results }),
  setRunning: (val) => set({ running: val }),
}));
