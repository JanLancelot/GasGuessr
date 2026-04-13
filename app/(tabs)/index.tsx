import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { Header } from '../../src/components/Header';
import { MetricsGrid } from '../../src/components/MetricsGrid';
import { ActionCard } from '../../src/components/ActionCard';
import { ChartsView } from '../../src/components/ChartsView';
import { SimulationLog } from '../../src/components/SimulationLog';

export default function ForecastScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <MetricsGrid />
        <ChartsView />
        <ActionCard />
        <SimulationLog />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: 24,
  },
});
