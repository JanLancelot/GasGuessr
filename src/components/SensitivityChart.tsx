import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';

function computeSensitivities(state: {
  calMode: string;
  geo: number;
  opec: number;
  demand: number;
  crude: number;
  fx: number;
  history: { c: number }[];
}) {
  if (state.calMode === 'historical') {
    const geoDrift = [0, 0.003, 0.008, 0.018, 0.035][state.geo];
    const geoVol = ([1.0, 1.15, 1.35, 1.6, 2.0][state.geo] - 1.0) * 0.03;
    const geoImpact = geoDrift + geoVol;

    const opecImpact = Math.abs([0.025, 0.012, 0, -0.012, -0.025][state.opec]);

    const demandImpact = Math.abs((state.demand - 1.0) * 0.08);

    const histCrude = state.history.length > 0
      ? state.history[state.history.length - 1].c : state.crude;
    const crudeImpact = histCrude > 0
      ? Math.abs((state.crude - histCrude) / histCrude * 0.15) : 0;

    const neutralFx = 58;
    const fxImpact = Math.abs((state.fx - neutralFx) / neutralFx * 0.05);

    const raw = [
      { key: 'geo', impact: geoImpact + 0.002 },
      { key: 'opec', impact: opecImpact + 0.002 },
      { key: 'crude', impact: crudeImpact + 0.002 },
      { key: 'fx', impact: fxImpact + 0.002 },
      { key: 'demand', impact: demandImpact + 0.002 },
    ];
    const total = raw.reduce((s, r) => s + r.impact, 0);
    return raw.map(r => ({ key: r.key, weight: r.impact / total }));
  } else {
    return [
      { key: 'crude', weight: 0.38 },
      { key: 'fx', weight: 0.24 },
      { key: 'geo', weight: 0.18 },
      { key: 'opec', weight: 0.12 },
      { key: 'demand', weight: 0.08 },
    ];
  }
}

const META: Record<string, { icon: string; labelEn: string; labelTl: string }> = {
  crude: { icon: '🛢️', labelEn: 'Crude Oil (MOPS)', labelTl: 'Presyo ng Langis (MOPS)' },
  fx: { icon: '💱', labelEn: 'USD/PHP Rate', labelTl: 'Palitan ng Dolyar' },
  geo: { icon: '🌍', labelEn: 'Geopolitical Risk', labelTl: 'Geopolitical Risk' },
  opec: { icon: '⚙️', labelEn: 'OPEC Policy', labelTl: 'Polisiya ng OPEC' },
  demand: { icon: '📊', labelEn: 'Demand Index', labelTl: 'Demand Index' },
};

export const SensitivityChart = () => {
  const { simResults, language, calMode, geo, opec, demand, crude, fx, history } =
    useSimulationStore();

  if (!simResults) return null;

  const sensitivities = computeSensitivities({ calMode, geo, opec, demand, crude, fx, history });
  const sorted = [...sensitivities].sort((a, b) => b.weight - a.weight);

  const t = {
    title: { en: 'Sensitivity Analysis', tl: 'Pagsusuri ng Impluwensya' },
    sub: { en: 'Which variables impact the forecast most', tl: 'Aling input ang pinakamalaki ang epekto' },
    impact: { en: 'Impact', tl: 'Epekto' },
  };

  const maxWeight = Math.max(...sorted.map(s => s.weight));

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="analytics-outline" size={16} color={colors.neutral} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t.title[language]}</Text>
          <Text style={styles.sub}>{t.sub[language]}</Text>
        </View>
      </View>

      {sorted.map((item, i) => {
        const meta = META[item.key];
        if (!meta) return null;
        const barWidthPct = (item.weight / maxWeight) * 100;
        const barColor = i === 0 ? colors.up : i === 1 ? colors.neutral : i === 2 ? colors.up + 'AA' : colors.blue;

        return (
          <View key={item.key} style={styles.row}>
            <View style={styles.rowLeft}>
              <Text style={styles.rowIcon}>{meta.icon}</Text>
              <Text style={styles.rowLabel}>{language === 'en' ? meta.labelEn : meta.labelTl}</Text>
            </View>
            <View style={styles.barWrap}>
              <View style={[styles.barBg]}>
                <View style={[styles.barFill, { width: `${barWidthPct}%`, backgroundColor: barColor }]} />
              </View>
              <Text style={[styles.weightText, { color: barColor }]}>{(item.weight * 100).toFixed(0)}%</Text>
            </View>
          </View>
        );
      })}

      <View style={styles.footnote}>
        <Ionicons name="information-circle-outline" size={12} color={colors.text3} />
        <Text style={styles.footnoteText}>
          {language === 'en'
            ? `Dynamic weights based on ${calMode} mode coefficients`
            : `Batay sa ${calMode} mode coefficients`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.neutralDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 10,
    color: colors.text2,
    marginTop: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 130,
  },
  rowIcon: {
    fontSize: 12,
  },
  rowLabel: {
    fontSize: 11,
    color: colors.text2,
    fontWeight: '500',
  },
  barWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.card2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  weightText: {
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    width: 30,
    textAlign: 'right',
  },
  footnote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footnoteText: {
    fontSize: 9,
    color: colors.text3,
  },
});

