import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';

export const DeltaView = () => {
  const { simResults, previousResults, prices, fuel, language } = useSimulationStore();

  if (!simResults || !previousResults) return null;

  const currentPrice = prices[fuel].current;
  const prev = previousResults;
  const curr = simResults;

  const t = {
    title: { en: 'What Changed', tl: 'Ano ang Nagbago' },
    sub: { en: 'Compared to previous simulation run', tl: 'Kumpara sa nakaraang simulation' },
    mean: { en: 'Mean', tl: 'Average' },
    ci: { en: '90% CI', tl: '90% CI' },
    pRise: { en: 'P(Rise)', tl: 'P(Taas)' },
    pFall: { en: 'P(Fall)', tl: 'P(Baba)' },
  };

  const deltas = [
    {
      label: t.mean[language],
      prevVal: `₱${prev.mean.toFixed(2)}`,
      currVal: `₱${curr.mean.toFixed(2)}`,
      delta: curr.mean - prev.mean,
      format: (d: number) => `${d >= 0 ? '+' : ''}₱${d.toFixed(2)}`,
    },
    {
      label: t.ci[language],
      prevVal: `₱${prev.p5.toFixed(0)}–${prev.p95.toFixed(0)}`,
      currVal: `₱${curr.p5.toFixed(0)}–${curr.p95.toFixed(0)}`,
      delta: (curr.p95 - curr.p5) - (prev.p95 - prev.p5),
      format: (d: number) => `${d >= 0 ? 'Wider' : 'Tighter'} ${Math.abs(d).toFixed(1)}`,
    },
    {
      label: t.pRise[language],
      prevVal: `${(prev.pRise * 100).toFixed(1)}%`,
      currVal: `${(curr.pRise * 100).toFixed(1)}%`,
      delta: (curr.pRise - prev.pRise) * 100,
      format: (d: number) => `${d >= 0 ? '+' : ''}${d.toFixed(1)}pp`,
    },
    {
      label: t.pFall[language],
      prevVal: `${(prev.pFall * 100).toFixed(1)}%`,
      currVal: `${(curr.pFall * 100).toFixed(1)}%`,
      delta: (curr.pFall - prev.pFall) * 100,
      format: (d: number) => `${d >= 0 ? '+' : ''}${d.toFixed(1)}pp`,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="git-compare-outline" size={16} color={colors.purple} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t.title[language]}</Text>
          <Text style={styles.sub}>{t.sub[language]}</Text>
        </View>
      </View>

      {deltas.map((d, i) => {
        const isPositive = d.delta > 0;
        const isNeutral = Math.abs(d.delta) < 0.01;
        const deltaColor = isNeutral ? colors.text3 : (i <= 1 ? (isPositive ? colors.up : colors.down) : (isPositive ? colors.up : colors.down));

        return (
          <View key={i} style={[styles.deltaRow, i === deltas.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={styles.deltaLabel}>{d.label}</Text>
            <View style={styles.deltaVals}>
              <Text style={styles.prevVal}>{d.prevVal}</Text>
              <Ionicons name="arrow-forward" size={10} color={colors.text3} />
              <Text style={styles.currVal}>{d.currVal}</Text>
            </View>
            <View style={[styles.deltaBadge, { backgroundColor: deltaColor + '18' }]}>
              <Text style={[styles.deltaText, { color: deltaColor }]}>{d.format(d.delta)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.purple + '30',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.purpleDim,
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
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  deltaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text2,
    width: 55,
  },
  deltaVals: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prevVal: {
    fontSize: 11,
    color: colors.text3,
    fontVariant: ['tabular-nums'],
    textDecorationLine: 'line-through',
  },
  currVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  deltaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deltaText: {
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
