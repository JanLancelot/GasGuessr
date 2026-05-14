import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FuelType = 'gasoline' | 'diesel';
export type CalMode = 'historical' | 'formula';
export type DataSource = 'sample' | 'manual' | 'csv' | 'none';
export type LookbackMode = 'blend' | 'full' | 'recent' | 'crisis';

export interface VehicleProfile {
  id: string;
  name: string;
  fuelType: FuelType;
  efficiency: number;
  tankSize: number;
}

export interface FillUpLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  totalCost: number;
  station: string;
  odometer: number;
}

export interface TripProfile {
  id: string;
  name: string;
  dist: number;
}

export interface DataRow {
  label: string;
  g: number;
  d: number;
  c: number;
}

export interface SimResultData {
  mean: number;
  median: number;
  sd: number;
  p5: number;
  p95: number;
  pRise: number;
  pFall: number;
  pStable: number;
  skewness: number;
  rawResults: number[];
  weeklyMeans: number[];
  weeklyMedians: number[];
  weeklyP5: number[];
  weeklyP95: number[];
  weeklyP25: number[];
  weeklyP75: number[];
}

export interface SimHistoryEntry {
  id: string;
  timestamp: Date;
  fuel: FuelType;
  calMode: CalMode;
  inputs: { crude: number; fx: number; demand: number; geo: number; opec: number; projWeeks: number; iter: number };
  results: SimResultData;
  currentPrice: number;
}

export interface ScenarioPreset {
  id: string;
  icon: string;
  name: { en: string; tl: string };
  desc: { en: string; tl: string };
  color: string;
  values: { crude: number; fx: number; demand: number; geo: number; opec: number };
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'calm', icon: '🟢',
    name: { en: 'Calm Market', tl: 'Tahimik na Merkado' },
    desc: { en: 'Stable geopolitics, balanced supply', tl: 'Walang gulo, balanseng supply' },
    color: '#00d4aa',
    values: { crude: 75, fx: 56, demand: 1.0, geo: 0, opec: 2 },
  },
  {
    id: 'current', icon: '🟡',
    name: { en: 'Current Situation', tl: 'Kasalukuyang Sitwasyon' },
    desc: { en: 'Based on latest global conditions', tl: 'Batay sa pinakabagong datos' },
    color: '#fbbf24',
    values: { crude: 85.0, fx: 59.93, demand: 1.0, geo: 4, opec: 1 },
  },
  {
    id: 'crisis', icon: '🔴',
    name: { en: 'Oil Crisis', tl: 'Krisis sa Langis' },
    desc: { en: 'War + supply cuts + weak peso', tl: 'Gyera + bawas supply + mahinang piso' },
    color: '#ff5e3a',
    values: { crude: 130, fx: 65, demand: 1.15, geo: 4, opec: 0 },
  },
  {
    id: 'flood', icon: '🌊',
    name: { en: 'OPEC Flood', tl: 'Pabaha ng OPEC' },
    desc: { en: 'Price war, excess supply', tl: 'Price war, sobrang supply' },
    color: '#5b8dee',
    values: { crude: 65, fx: 55, demand: 0.95, geo: 1, opec: 4 },
  },
];

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
  interactionMode: 'fixed' | 'playground';
  history: DataRow[];
  prices: {
    gasoline: { current: number; weekChange: number; excise: number };
    diesel: { current: number; weekChange: number; excise: number };
  };
  simLogs: { type: string; msg: string; time?: Date }[];
  simResults: SimResultData | null;
  previousResults: SimResultData | null;
  simHistory: SimHistoryEntry[];
  language: 'en' | 'tl';
  weeklyKm: number;
  fuelEfficiency: number;
  vehicles: VehicleProfile[];
  activeVehicleId: string | null;
  fillUpLogs: FillUpLog[];
  tripProfiles: TripProfile[];

  setLanguage: (lang: 'en' | 'tl') => void;
  setFuel: (val: FuelType) => void;
  setVar: (key: string, val: number | string) => void;
  setHistory: (data: DataRow[], source: DataSource) => void;
  addLog: (type: string, msg: string) => void;
  clearLog: () => void;
  setSimResults: (results: any) => void;
  setRunning: (val: boolean) => void;
  setInteractionMode: (val: 'fixed' | 'playground') => void;
  applyScenario: (preset: ScenarioPreset) => void;
  clearSimHistory: () => void;
  addVehicle: (v: Omit<VehicleProfile, 'id'>) => void;
  updateVehicle: (id: string, v: Partial<VehicleProfile>) => void;
  deleteVehicle: (id: string) => void;
  setActiveVehicle: (id: string) => void;
  addFillUpLog: (log: Omit<FillUpLog, 'id'>) => void;
  deleteFillUpLog: (id: string) => void;
  addTripProfile: (trip: Omit<TripProfile, 'id'>) => void;
  deleteTripProfile: (id: string) => void;
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
    [79.29, 104.05, 85.0],
    [89.17, 121.03, 95.0],
    [90.93, 133.19, 105.0],
    [95.59, 152.00, 115.0],
    [94.45, 134.13, 100.0],
    [87.24, 101.78, 85.0],
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

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
  fuel: 'gasoline',
  crude: 85.0,
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
  interactionMode: 'playground',
  history: [...SAMPLE_DATA],
  prices: {
    gasoline: { current: 87.24, weekChange: -7.21, excise: 10.0 },
    diesel: { current: 101.78, weekChange: -32.35, excise: 6.0 },
  },
  simLogs: [
    { type: 'BOOT', msg: 'GasGuessr v3.1 initialized — mobile engine ready.' },
    { type: 'DATA', msg: 'Sample data loaded.' },
    { type: 'WAIT', msg: 'Awaiting simulation trigger…' },
  ],
  simResults: null,
  previousResults: null,
  simHistory: [],
  language: 'en',
  weeklyKm: 200,
  fuelEfficiency: 10,
  vehicles: [],
  activeVehicleId: null,
  fillUpLogs: [],
  tripProfiles: [
    { id: '1', name: 'Manila to Baguio', dist: 250 },
    { id: '2', name: 'Manila to Tagaytay', dist: 65 },
    { id: '3', name: 'EDSA Commute', dist: 25 },
  ],

  setLanguage: (val) => set({ language: val }),
  setFuel: (val) => set({ fuel: val, simResults: null }),
  setVar: (key, val) =>
    set((state) => ({
      ...state,
      [key]: key === 'projWeeks' ? Math.min(2, Math.max(1, Number(val))) : val,
      simResults: null,
    })),
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
  setSimResults: (results) =>
    set((state) => {
      const entry: SimHistoryEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        timestamp: new Date(),
        fuel: state.fuel,
        calMode: state.calMode,
        inputs: { crude: state.crude, fx: state.fx, demand: state.demand, geo: state.geo, opec: state.opec, projWeeks: state.projWeeks, iter: state.iter },
        results,
        currentPrice: state.prices[state.fuel].current,
      };
      const prevResult = state.simResults ?? state.previousResults;
      return {
        previousResults: prevResult,
        simResults: results,
        simHistory: [entry, ...state.simHistory].slice(0, 20),
      };
    }),
  setRunning: (val) => set({ running: val }),
  setInteractionMode: (val) => set({ interactionMode: val }),
  applyScenario: (preset) =>
    set((state) => ({
      crude: preset.values.crude,
      fx: preset.values.fx,
      demand: preset.values.demand,
      geo: preset.values.geo,
      opec: preset.values.opec,
      simResults: null,
      previousResults: state.simResults ?? state.previousResults,
    })),
  clearSimHistory: () => set({ simHistory: [] }),
  addVehicle: (v) => set((state) => {
    const newVehicle = { ...v, id: Date.now().toString() };
    return {
      vehicles: [...state.vehicles, newVehicle],
      activeVehicleId: state.vehicles.length === 0 ? newVehicle.id : state.activeVehicleId,
    };
  }),
  updateVehicle: (id, v) => set((state) => ({
    vehicles: state.vehicles.map(vh => vh.id === id ? { ...vh, ...v } : vh),
    fuelEfficiency: state.activeVehicleId === id && v.efficiency ? v.efficiency : state.fuelEfficiency,
  })),
  deleteVehicle: (id) => set((state) => {
    const remaining = state.vehicles.filter(vh => vh.id !== id);
    return {
      vehicles: remaining,
      activeVehicleId: state.activeVehicleId === id 
        ? (remaining.length > 0 ? remaining[0].id : null) 
        : state.activeVehicleId,
    };
  }),
  setActiveVehicle: (id) => set((state) => {
    const v = state.vehicles.find(vh => vh.id === id);
    if (v) {
      return { 
        activeVehicleId: id, 
        fuel: v.fuelType, 
        fuelEfficiency: v.efficiency,
        simResults: state.fuel === v.fuelType ? state.simResults : null, 
      };
    }
    return {};
  }),
  addFillUpLog: (log) => set((state) => ({
    fillUpLogs: [{ ...log, id: Date.now().toString() }, ...state.fillUpLogs],
  })),
  deleteFillUpLog: (id) => set((state) => ({
    fillUpLogs: state.fillUpLogs.filter(l => l.id !== id),
  })),
  addTripProfile: (trip) => set((state) => ({
    tripProfiles: [...state.tripProfiles, { ...trip, id: Date.now().toString() }],
  })),
  deleteTripProfile: (id) => set((state) => ({
    tripProfiles: state.tripProfiles.filter(t => t.id !== id),
  })),
}),
    {
      name: 'gasguessr-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        ...state,
        running: false,
        simLogs: [
          { type: 'BOOT', msg: 'GasGuessr initialized — mobile engine ready.' },
          { type: 'WAIT', msg: 'Awaiting simulation trigger…' },
        ],
      }),
    }
  )
);
