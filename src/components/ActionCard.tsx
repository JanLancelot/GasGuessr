import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';
import { runSimulation } from '../engine/simulator';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export const ActionCard = () => {
  const { running, simResults, prices, fuel, language } = useSimulationStore();

  const t = {
    runSimBox: { en: 'Run a Simulation', tl: 'Simulan ang Simulation' },
    descBox: { en: 'Load data and run the Monte Carlo engine to get price forecasts.', tl: 'Magkasa ng data at simulan ang engine para makita ang forecast.' },
    refuelNow: { en: 'Refuel Now — Increase Likely', tl: 'Magpakarga Na — Malamang Tumaas' },
    probIncrease: { en: 'probability of increase', tl: 'na tsansang tumaas' },
    mean: { en: 'Mean', tl: 'Average' },
    waitDrop: { en: 'Wait — Price Drop Expected', tl: 'Maghintay — Inaasahang Bababa' },
    probDrop: { en: 'probability of drop', tl: 'na tsansang bumaba' },
    monitorUncertain: { en: 'Monitor — Uncertain', tl: 'Obserbahan — Walang Kasiguraduhan' },
    rise: { en: 'Rise:', tl: 'Taas:' },
    fall: { en: 'Fall:', tl: 'Baba:' },
    simulating: { en: 'Simulating…', tl: 'Nagko-compute…' },
    runSimBtn: { en: 'Run Simulation', tl: 'Patakbuhin (Simulate)' },
  };
  const [progress, setProgress] = useState(0);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleRun = async () => {
    if (running) return;
    setProgress(0);
    await runSimulation((pct) => setProgress(pct));
  };

  const currentPrice = prices[fuel].current;

  const renderRecommendation = () => {
    if (!simResults) {
      return (
        <View style={[styles.recCard, styles.recNeutral]}>
          <View style={styles.recIconWrap}>
            <Ionicons name="flash" size={20} color={colors.neutral} />
          </View>
          <View style={styles.recContent}>
            <Text style={[styles.recTitle, { color: colors.neutral }]}>
              {t.runSimBox[language]}
            </Text>
            <Text style={styles.recDesc}>
              {t.descBox[language]}
            </Text>
          </View>
        </View>
      );
    }

    const { pRise, pFall, mean, p5, p95 } = simResults;
    const delta = (((mean - currentPrice) / currentPrice) * 100).toFixed(2);

    if (pRise > 0.6) {
      return (
        <View style={[styles.recCard, styles.recUp]}>
          <View style={[styles.recIconWrap, { backgroundColor: colors.upDim }]}>
            <Ionicons name="trending-up" size={20} color={colors.up} />
          </View>
          <View style={styles.recContent}>
            <Text style={[styles.recTitle, { color: colors.up }]}>
              {t.refuelNow[language]}
            </Text>
            <Text style={styles.recDesc}>
              <Text style={styles.recHighlight}>
                {(pRise * 100).toFixed(1)}%
              </Text>{' '}
              {t.probIncrease[language]}. {t.mean[language]}:{' '}
              <Text style={styles.recHighlight}>₱{mean.toFixed(2)}</Text> (
              {Number(delta) > 0 ? '+' : ''}
              {delta}%).{'\n'}90% CI: ₱{p5.toFixed(2)}–₱{p95.toFixed(2)}.
            </Text>
          </View>
        </View>
      );
    } else if (pFall > 0.5) {
      return (
        <View style={[styles.recCard, styles.recDown]}>
          <View style={[styles.recIconWrap, { backgroundColor: colors.downDim }]}>
            <Ionicons name="trending-down" size={20} color={colors.down} />
          </View>
          <View style={styles.recContent}>
            <Text style={[styles.recTitle, { color: colors.down }]}>
              {t.waitDrop[language]}
            </Text>
            <Text style={styles.recDesc}>
              <Text style={styles.recHighlight}>
                {(pFall * 100).toFixed(1)}%
              </Text>{' '}
              {t.probDrop[language]}. {t.mean[language]}:{' '}
              <Text style={styles.recHighlight}>₱{mean.toFixed(2)}</Text> (
              {delta}%).{'\n'}90% CI: ₱{p5.toFixed(2)}–₱{p95.toFixed(2)}.
            </Text>
          </View>
        </View>
      );
    } else {
      return (
        <View style={[styles.recCard, styles.recNeutral]}>
          <View style={[styles.recIconWrap, { backgroundColor: colors.neutralDim }]}>
            <Ionicons name="remove-circle-outline" size={20} color={colors.neutral} />
          </View>
          <View style={styles.recContent}>
            <Text style={[styles.recTitle, { color: colors.neutral }]}>
              {t.monitorUncertain[language]}
            </Text>
            <Text style={styles.recDesc}>
              {t.rise[language]}{' '}
              <Text style={styles.recHighlight}>
                {(pRise * 100).toFixed(1)}%
              </Text>
              . {t.fall[language]}{' '}
              <Text style={styles.recHighlight}>
                {(pFall * 100).toFixed(1)}%
              </Text>
              .{'\n'}{t.mean[language]}: ₱{mean.toFixed(2)}. CI: ₱{p5.toFixed(2)}–₱{p95.toFixed(2)}.
            </Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {renderRecommendation()}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.runBtnWrap}
          onPress={handleRun}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          disabled={running}
        >
          <LinearGradient
            colors={
              running
                ? ['#3a4a6b', '#2e3a5a']
                : [colors.gradientOrangeStart, colors.gradientOrangeEnd]
            }
            start={[0, 0]}
            end={[1, 1]}
            style={styles.runBtn}
          >
            {running ? (
              <View style={styles.runBtnContent}>
                <ActivityIndicator
                  color="#fff"
                  size="small"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.runBtnText}>{t.simulating[language]}</Text>
              </View>
            ) : (
              <View style={styles.runBtnContent}>
                <Ionicons
                  name="flash"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.runBtnText}>{t.runSimBtn[language]}</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {progress > 0 && (
        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 12,
  },
  recNeutral: {
    backgroundColor: colors.neutralDim,
    borderColor: 'rgba(251,191,36,0.2)',
  },
  recUp: {
    backgroundColor: colors.upDim,
    borderColor: 'rgba(255,94,58,0.25)',
  },
  recDown: {
    backgroundColor: colors.downDim,
    borderColor: 'rgba(0,212,170,0.2)',
  },
  recIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.neutralDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  recDesc: {
    fontSize: 12,
    color: colors.text2,
    lineHeight: 17,
  },
  recHighlight: {
    fontWeight: '700',
    color: colors.text,
  },
  runBtnWrap: {
    borderRadius: 14,
    shadowColor: colors.up,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  runBtn: {
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  runBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  runBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  progressBg: {
    flex: 1,
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.up,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: colors.text3,
    fontVariant: ['tabular-nums'],
    width: 30,
    textAlign: 'right',
  },
});
