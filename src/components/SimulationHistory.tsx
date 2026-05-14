import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useSimulationStore, SimHistoryEntry } from '../store/useSimulationStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HistoryRow = ({ entry, language }: { entry: SimHistoryEntry; language: 'en' | 'tl' }) => {
  const [expanded, setExpanded] = useState(false);
  const delta = entry.results.mean - entry.currentPrice;
  const deltaPct = (delta / entry.currentPrice) * 100;
  const isUp = delta > entry.currentPrice * 0.005;
  const isDown = delta < -entry.currentPrice * 0.005;
  const trendColor = isUp ? colors.up : isDown ? colors.down : colors.neutral;
  const trendIcon = isUp ? 'trending-up' : isDown ? 'trending-down' : 'remove-outline';

  const timeStr = entry.timestamp instanceof Date
    ? entry.timestamp.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })
    : new Date(entry.timestamp).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });

  const t = {
    mean: { en: 'Mean', tl: 'Average' },
    ci: { en: '90% CI', tl: '90% CI' },
    rise: { en: 'Rise', tl: 'Taas' },
    fall: { en: 'Fall', tl: 'Baba' },
    crude: { en: 'MOPS', tl: 'MOPS' },
    fx: { en: 'FX', tl: 'FX' },
    geo: { en: 'Geo', tl: 'Geo' },
    opec: { en: 'OPEC', tl: 'OPEC' },
  };

  return (
    <TouchableOpacity
      style={[styles.histRow, expanded && styles.histRowExpanded]}
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.histRowTop}>
        <View style={styles.histRowLeft}>
          <Ionicons name={trendIcon as any} size={16} color={trendColor} />
          <View>
            <Text style={styles.histFuel}>{entry.fuel.toUpperCase()}</Text>
            <Text style={styles.histTime}>{timeStr} · {entry.calMode}</Text>
          </View>
        </View>
        <View style={styles.histRowRight}>
          <Text style={[styles.histMean, { color: trendColor }]}>₱{entry.results.mean.toFixed(2)}</Text>
          <Text style={[styles.histDelta, { color: trendColor }]}>
            {deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%
          </Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.histDetail}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t.mean[language]}</Text>
              <Text style={styles.detailValue}>₱{entry.results.mean.toFixed(2)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t.ci[language]}</Text>
              <Text style={styles.detailValue}>₱{entry.results.p5.toFixed(0)}–{entry.results.p95.toFixed(0)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t.rise[language]}</Text>
              <Text style={[styles.detailValue, { color: colors.up }]}>{(entry.results.pRise * 100).toFixed(1)}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>{t.fall[language]}</Text>
              <Text style={[styles.detailValue, { color: colors.down }]}>{(entry.results.pFall * 100).toFixed(1)}%</Text>
            </View>
          </View>
          <View style={styles.inputsRow}>
            <Text style={styles.inputTag}>{t.crude[language]}: ${entry.inputs.crude}</Text>
            <Text style={styles.inputTag}>{t.fx[language]}: ₱{entry.inputs.fx}</Text>
            <Text style={styles.inputTag}>{t.geo[language]}: {entry.inputs.geo}</Text>
            <Text style={styles.inputTag}>{t.opec[language]}: {entry.inputs.opec}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const SimulationHistory = () => {
  const { simHistory, clearSimHistory, language } = useSimulationStore();
  const [expanded, setExpanded] = useState(false);

  const t = {
    title: { en: 'Run History', tl: 'Kasaysayan ng Simulation' },
    runs: { en: 'runs', tl: 'beses' },
    clear: { en: 'Clear', tl: 'Burahin' },
    noHistory: { en: 'No simulation runs yet', tl: 'Wala pang simulation' },
  };

  if (simHistory.length === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(!expanded);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="time-outline" size={14} color={colors.text2} />
          <Text style={styles.headerTitle}>{t.title[language]}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{simHistory.length} {t.runs[language]}</Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={colors.text3} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          {simHistory.map((entry) => (
            <HistoryRow key={entry.id} entry={entry} language={language} />
          ))}
          <TouchableOpacity style={styles.clearBtn} onPress={clearSimHistory} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={12} color={colors.up} />
            <Text style={styles.clearText}>{t.clear[language]}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text2,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  countBadge: {
    backgroundColor: colors.card2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.text3,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 10,
    gap: 6,
  },
  histRow: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  histRowExpanded: {
    borderColor: colors.border2,
  },
  histRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  histRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  histFuel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  histTime: {
    fontSize: 9,
    color: colors.text3,
    marginTop: 1,
  },
  histRowRight: {
    alignItems: 'flex-end',
  },
  histMean: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  histDelta: {
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  histDetail: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  inputsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  inputTag: {
    fontSize: 9,
    color: colors.text3,
    backgroundColor: colors.card2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: colors.upMuted,
    borderRadius: 10,
    marginTop: 4,
  },
  clearText: {
    fontSize: 11,
    color: colors.up,
    fontWeight: '600',
  },
});
