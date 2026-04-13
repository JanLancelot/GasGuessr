import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';

const CARD_WIDTH = 150;

interface MetricCardProps {
  accentColor: string;
  label: string;
  value: string;
  sub: string;
  subColor: string;
}

const MetricCard = ({ accentColor, label, value, sub, subColor }: MetricCardProps) => (
  <View style={[styles.card, { borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
    <Text style={styles.label} numberOfLines={1}>{label}</Text>
    <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
      {value}
    </Text>
    <Text style={[styles.sub, { color: subColor }]} numberOfLines={1}>{sub}</Text>
  </View>
);

export const MetricsGrid = () => {
  const { fuel, prices, crude, fx } = useSimulationStore();
  const currentPrice = prices[fuel].current;
  const weekChange = prices[fuel].weekChange;

  const [daysToDoe, setDaysToDoe] = useState(0);
  const [doeLabel, setDoeLabel] = useState('');

  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    let d = (2 - day + 7) % 7 || 7;
    setDaysToDoe(d);
    const next = new Date(now);
    next.setDate(now.getDate() + d);
    setDoeLabel(
      next
        .toLocaleDateString('en-PH', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
        .toUpperCase()
    );
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      <MetricCard
        accentColor={colors.up}
        label="Current Price/L"
        value={`₱${currentPrice.toFixed(2)}`}
        sub={`${weekChange >= 0 ? '▲ +' : '▼ '}${weekChange.toFixed(2)} this wk`}
        subColor={weekChange >= 0 ? colors.up : colors.down}
      />
      <MetricCard
        accentColor={colors.neutral}
        label="Crude Oil (WTI)"
        value={`$${crude.toFixed(2)}`}
        sub="▲ Linked to history"
        subColor={colors.up}
      />
      <MetricCard
        accentColor={colors.blue}
        label="USD / PHP"
        value={`₱${fx.toFixed(2)}`}
        sub="▲ Global base"
        subColor={colors.up}
      />
      <MetricCard
        accentColor={colors.down}
        label="Next DOE Review"
        value={doeLabel}
        sub={`${daysToDoe} day${daysToDoe !== 1 ? 's' : ''} away`}
        subColor={daysToDoe <= 2 ? colors.up : colors.text3}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    width: CARD_WIDTH,
  },
  label: {
    fontSize: 10,
    color: colors.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sub: {
    fontSize: 10,
    fontWeight: '600',
  },
});
