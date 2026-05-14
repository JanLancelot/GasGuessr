import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';

import { getForecastLabels } from '../utils/dateUtils';

export const WeeklyBreakdown = () => {
  const { simResults, prices, fuel, language, history } = useSimulationStore();

  if (!simResults) return null;

  const { weeklyMeans, weeklyMedians, weeklyP5, weeklyP95, weeklyP25, weeklyP75, skewness } = simResults;
  const useMedian = Math.abs(skewness) > 0.3;
  const currentPrice = prices[fuel].current;
  
  const lastHistLabel = history.length > 0 ? history[history.length - 1].label : 'Apr 24';
  const forecastLabels = getForecastLabels(lastHistLabel, weeklyMeans.length - 1);

  const t = {
    title: { en: 'Week-by-Week Forecast', tl: 'Forecast Bawat Linggo' },
    current: { en: 'Current', tl: 'Ngayon' },
    week: { en: 'Period', tl: 'Panahon' },
    estimate: { en: 'Estimate', tl: 'Tantya' },
    range: { en: '90% Range', tl: '90% Saklaw' },
    change: { en: 'Change', tl: 'Pagbabago' },
  };

  const weeks = weeklyMeans.slice(1);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.blue} />
        <Text style={styles.title}>{t.title[language]}</Text>
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, { flex: 0.8 }]}>{t.week[language]}</Text>
        <Text style={[styles.headerCell, { flex: 1.2 }]}>{t.estimate[language]}</Text>
        <Text style={[styles.headerCell, { flex: 1.5 }]}>{t.range[language]}</Text>
        <Text style={[styles.headerCell, { flex: 1 }]}>{t.change[language]}</Text>
      </View>

      {/* Current price row */}
      <View style={[styles.weekRow, styles.currentRow]}>
        <Text style={[styles.cell, styles.weekLabel, { flex: 0.8 }]}>📍</Text>
        <Text style={[styles.cell, styles.currentVal, { flex: 1.2 }]}>₱{currentPrice.toFixed(2)}</Text>
        <Text style={[styles.cell, { flex: 1.5, color: colors.text3 }]}>—</Text>
        <Text style={[styles.cell, { flex: 1, color: colors.text3 }]}>—</Text>
      </View>

      {/* Week rows */}
      {weeks.map((mean, i) => {
        const median = weeklyMedians[i + 1];
        const estimate = useMedian ? median : mean;
        const p5 = weeklyP5[i + 1];
        const p95 = weeklyP95[i + 1];
        const delta = estimate - currentPrice;
        const deltaPct = ((delta / currentPrice) * 100);
        const isUp = delta > currentPrice * 0.005;
        const isDown = delta < -currentPrice * 0.005;
        const trendColor = isUp ? colors.up : isDown ? colors.down : colors.neutral;
        const trendIcon = isUp ? '▲' : isDown ? '▼' : '→';

        return (
          <View key={i} style={[styles.weekRow, i === weeks.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={{ flex: 0.8 }}>
              <Text style={[styles.cell, styles.weekLabel]}>{forecastLabels[i]}</Text>
            </View>
            <View style={{ flex: 1.2 }}>
              <Text style={[styles.cell, styles.meanVal]}>₱{estimate.toFixed(2)}</Text>
            </View>
            <View style={{ flex: 1.5 }}>
              <Text style={[styles.cell, styles.rangeVal]}>₱{p5.toFixed(0)}–{p95.toFixed(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cell, { color: trendColor, fontWeight: '700' }]}>
                {trendIcon} {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%
              </Text>
            </View>
          </View>
        );
      })}

      {/* Summary bar */}
      <View style={styles.summaryBar}>
        {weeks.map((mean, i) => {
          const median = weeklyMedians[i + 1];
          const estimate = useMedian ? median : mean;
          const delta = estimate - currentPrice;
          const isUp = delta > currentPrice * 0.005;
          const isDown = delta < -currentPrice * 0.005;
          const barColor = isUp ? colors.up : isDown ? colors.down : colors.neutral;
          const maxDelta = Math.max(...weeks.map(m => Math.abs(m - currentPrice)));
          const barHeight = maxDelta > 0 ? Math.max(4, (Math.abs(delta) / maxDelta) * 28) : 4;

          return (
            <View key={i} style={styles.barCol}>
              <View style={[styles.bar, { height: barHeight, backgroundColor: barColor }]} />
              <Text style={styles.barLabel}>W{i + 1}</Text>
            </View>
          );
        })}
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
    gap: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text2,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 2,
  },
  headerCell: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  currentRow: {
    backgroundColor: colors.card2,
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 0,
  },
  cell: {
    fontSize: 12,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  weekLabel: {
    fontWeight: '700',
    color: colors.blue,
    fontSize: 12,
  },
  currentVal: {
    fontWeight: '700',
    color: colors.text,
  },
  meanVal: {
    fontWeight: '700',
  },
  rangeVal: {
    fontSize: 11,
    color: colors.text2,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 56,
  },
  barCol: {
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    width: 18,
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.text3,
  },
});
