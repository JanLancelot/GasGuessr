import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';

const CARD_WIDTH = 150;

interface MetricCardProps {
  accentColor: string;
  label: string;
  value: string;
  sub: string;
  subColor: string;
  children?: React.ReactNode;
}

const MetricCard = ({ accentColor, label, value, sub, subColor, children }: MetricCardProps) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      Animated.parallel([
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0.4, duration: 80, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.08, duration: 100, useNativeDriver: true }),
          Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [value]);

  return (
    <View style={[styles.card, { borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <Animated.Text
        style={[styles.value, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {value}
      </Animated.Text>
      <Text style={[styles.sub, { color: subColor }]} numberOfLines={1}>{sub}</Text>
      {children}
    </View>
  );
};

export const MetricsGrid = () => {
  const { fuel, prices, crude, fx, language, history } = useSimulationStore();
  const currentPrice = prices[fuel].current;
  const weekChange = prices[fuel].weekChange;
  
  const recentHistory = history.slice(-10);
  const maxPrice = Math.max(...recentHistory.map(r => fuel === 'gasoline' ? r.g : r.d), currentPrice);
  const minPrice = Math.min(...recentHistory.map(r => fuel === 'gasoline' ? r.g : r.d), currentPrice);
  
  const renderSparkline = () => {
    if (recentHistory.length < 2) return null;
    const width = CARD_WIDTH - 28;
    const height = 24;
    const range = maxPrice - minPrice || 1;
    
    let pathStr = '';
    recentHistory.forEach((r, i) => {
      const p = fuel === 'gasoline' ? r.g : r.d;
      const x = (i / (recentHistory.length - 1)) * width;
      const y = height - ((p - minPrice) / range) * height;
      pathStr += i === 0 ? `M ${x} ${y} ` : `L ${x} ${y} `;
    });
    
    return (
      <View style={styles.sparklineWrap}>
        <Svg width={width} height={height}>
          <Path d={pathStr} stroke={colors.blue} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    );
  };

  const t = {
    currentPrice: { en: 'Current Price/L', tl: 'Kasalukuyang Presyo/L' },
    thisWk: { en: 'this wk', tl: 'ngayong linggo' },
    crudeWti: { en: 'Crude Oil (MOPS)', tl: 'Crude Oil (MOPS)' },
    linkedHist: { en: '▲ Linked to history', tl: '▲ Batay sa nakaraan' },
    usdPhp: { en: 'USD / PHP', tl: 'USD / PHP' },
    globalBase: { en: '▲ Global base', tl: '▲ Global na basehan' },
    nextDoe: { en: 'Next DOE Review', tl: 'Susunod na DOE Review' },
    dayAwayText: (d: number, lang: string) => {
      if (lang === 'tl') return `${d} araw na lang`;
      return `${d} day${d !== 1 ? 's' : ''} away`;
    }
  };

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
        label={t.currentPrice[language]}
        value={`₱${currentPrice.toFixed(2)}`}
        sub={`${weekChange >= 0 ? '▲ +' : '▼ '}${weekChange.toFixed(2)} ${t.thisWk[language]}`}
        subColor={weekChange >= 0 ? colors.up : colors.down}
      >
        {renderSparkline()}
      </MetricCard>
      <MetricCard
        accentColor={colors.neutral}
        label={t.crudeWti[language]}
        value={`$${crude.toFixed(2)}`}
        sub={t.linkedHist[language]}
        subColor={colors.up}
      />
      <MetricCard
        accentColor={colors.blue}
        label={t.usdPhp[language]}
        value={`₱${fx.toFixed(2)}`}
        sub={t.globalBase[language]}
        subColor={colors.up}
      />
      <MetricCard
        accentColor={colors.down}
        label={t.nextDoe[language]}
        value={doeLabel}
        sub={t.dayAwayText(daysToDoe, language)}
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
  sparklineWrap: {
    marginTop: 8,
    height: 24,
  },
});
