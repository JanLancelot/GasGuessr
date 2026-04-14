import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { BarChart, LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';

const CONTAINER_HPAD = 16;
const CARD_HPAD = 16;
const Y_AXIS_WIDTH = 50;

export const ChartsView = () => {
  const { simResults, history, fuel, language } = useSimulationStore();
  const [activeChart, setActiveChart] = useState<'dist' | 'trend'>('dist');

  const t = {
    dist: { en: 'Distribution', tl: 'Distribusyon' },
    trend: { en: 'Trend', tl: 'Takbo (Trend)' },
    priceDist: { en: 'Price Distribution', tl: 'Pamamahagi ng Presyo' },
    histProj: { en: 'Historical & Projected Trend', tl: 'Nakaraan at Forecast na Takbo' },
    meanProj: { en: 'Mean Projection', tl: 'Average Forecast' },
    ciRange: { en: '90% CI Range', tl: '90% Posibleng Sakop' },
    swipeMore: { en: 'Swipe to see more', tl: 'Mag-swipe para sa iba' },
    proj: { en: 'Proj', tl: 'FCST' },
  };

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (CONTAINER_HPAD * 2) - (CARD_HPAD * 2) - Y_AXIS_WIDTH;

  if (!simResults) return null;

  const {
    rawResults,
    mean,
    p5,
    p95,
    weeklyMeans,
  } = simResults;

  const renderTabs = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeChart === 'dist' && styles.tabActive]}
        onPress={() => setActiveChart('dist')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeChart === 'dist' && styles.tabTextActive]}>
          {t.dist[language]}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeChart === 'trend' && styles.tabActive]}
        onPress={() => setActiveChart('trend')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabText, activeChart === 'trend' && styles.tabTextActive]}>
          {t.trend[language]}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDistChart = () => {
    const prices = rawResults;
    const n = prices.length;
    if (n === 0) return null;
    const min = prices[0];
    const max = prices[n - 1];
    const bins = 10;
    const step = (max - min) / bins;

    if (step === 0) return null;

    const buckets = Array(bins).fill(0);
    const labels: string[] = [];
    for (let i = 0; i < bins; i++) {
      labels.push((min + i * step).toFixed(0));
    }

    const currentPrice = useSimulationStore.getState().prices[fuel].current;

    for (const v of prices) {
      const idx = Math.min(bins - 1, Math.floor((v - min) / step));
      buckets[idx]++;
    }

    const maxCount = Math.max(...buckets);

    const barData = buckets.map((count, i) => {
      const m = min + (i + 0.5) * step;
      let barColor = colors.neutral;
      if (m > currentPrice * 1.005) barColor = colors.up;
      if (m < currentPrice * 0.995) barColor = colors.down;

      return {
        value: count,
        label: i % 2 === 0 ? `₱${labels[i]}` : '',
        frontColor: barColor,
        gradientColor: barColor + '60',
        showGradient: true,
        topLabelComponent: () =>
          count > maxCount * 0.12 ? (
            <Text style={styles.barTopLabel}>{count}</Text>
          ) : null,
      };
    });

    const barSpacing = 4;
    const barWidth = Math.max(10, (chartWidth / bins) - barSpacing);

    return (
      <View>
        <View style={styles.chartWrap}>
          <BarChart
            data={barData}
            width={chartWidth}
            height={180}
            barWidth={barWidth}
            spacing={barSpacing}
            yAxisTextStyle={styles.yAxisText}
            xAxisLabelTextStyle={styles.xAxisText}
            yAxisLabelWidth={Y_AXIS_WIDTH}
            hideRules
            noOfSections={4}
            yAxisColor={'transparent'}
            xAxisColor={colors.border}
            barBorderTopLeftRadius={3}
            barBorderTopRightRadius={3}
            isAnimated
            animationDuration={600}
            disableScroll
            xAxisLabelTexts={barData.map(d => d.label)}
          />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₱{mean.toFixed(2)}</Text>
            <Text style={styles.statLabel}>{t.meanProj[language]}</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₱{p5.toFixed(0)}–{p95.toFixed(0)}</Text>
            <Text style={styles.statLabel}>{t.ciRange[language]}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderTrendChart = () => {
    const histPrices = history.map((r) => (fuel === 'gasoline' ? r.g : r.d));
    const histLabels = history.map((r) => r.label);

    const histData = histPrices.map((p, i) => ({
      value: p,
      label: i % 5 === 0 ? histLabels[i] : '',
      dataPointColor: colors.blue,
      dataPointRadius: 3,
    }));

    const combinedData = [...histData];
    weeklyMeans.slice(1).forEach((m, idx) => {
      combinedData.push({
        value: m,
        label: idx === 0 ? t.proj[language] : `W+${idx + 1}`,
        dataPointColor: colors.up,
        dataPointRadius: 4,
      });
    });

    const spacing = 28;
    const totalChartContentWidth = spacing * Math.max(1, combinedData.length - 1);

    return (
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chartScrollWrap}
          contentContainerStyle={styles.chartScrollContent}
        >
          <View style={styles.chartWrap}>
            <LineChart
              data={combinedData}
              width={totalChartContentWidth}
              height={180}
              color={colors.blue}
              thickness={2}
              dataPointsRadius={3}
              yAxisTextStyle={styles.yAxisText}
              xAxisLabelTextStyle={styles.xAxisTextTrend}
              yAxisLabelWidth={Y_AXIS_WIDTH}
              hideRules
              yAxisColor={'transparent'}
              xAxisColor={colors.border}
              spacing={spacing}
              curved
              curvature={0.15}
              isAnimated
              animationDuration={800}
              areaChart
              startFillColor={colors.blue}
              startOpacity={0.2}
              endFillColor={colors.blue}
              endOpacity={0.01}
              disableScroll
            />
          </View>
        </ScrollView>
        <View style={styles.scrollHint}>
          <Ionicons name="swap-horizontal" size={12} color={colors.text3} style={{ marginRight: 4 }} />
          <Text style={styles.scrollHintText}>{t.swipeMore[language]}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderTabs()}
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: activeChart === 'dist' ? colors.up : colors.blue },
            ]}
          />
          <Text style={styles.cardTitle}>
            {activeChart === 'dist'
              ? t.priceDist[language]
              : t.histProj[language]}
          </Text>
        </View>
        {activeChart === 'dist' ? renderDistChart() : renderTrendChart()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: CONTAINER_HPAD,
    marginBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
    gap: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.card2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text3,
  },
  tabTextActive: {
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: CARD_HPAD,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text2,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  chartWrap: {
    overflow: 'visible',
  },
  chartScrollWrap: {
    marginHorizontal: -4,
  },
  chartScrollContent: {
    paddingRight: 16,
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 6,
    backgroundColor: colors.card2,
    borderRadius: 8,
  },
  scrollHintText: {
    fontSize: 11,
    color: colors.text3,
  },
  yAxisText: {
    color: colors.text2,
    fontSize: 10,
    width: Y_AXIS_WIDTH,
  },
  xAxisText: {
    color: colors.text2,
    fontSize: 9,
    width: 40,
    textAlign: 'center',
  },
  xAxisTextTrend: {
    color: colors.text2,
    fontSize: 9,
    width: 44,
    textAlign: 'center',
  },
  barTopLabel: {
    fontSize: 7,
    color: colors.text3,
    marginBottom: 1,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 14,
    backgroundColor: colors.card2,
    borderRadius: 12,
    padding: 2,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
