import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionCard } from '../../src/components/ActionCard';
import { ChartsView } from '../../src/components/ChartsView';
import { Header } from '../../src/components/Header';
import { MetricsGrid } from '../../src/components/MetricsGrid';
import { SimulationLog } from '../../src/components/SimulationLog';
import { useSimulationStore } from '../../src/store/useSimulationStore';
import { colors } from '../../src/theme/colors';

export default function ForecastScreen() {
  const { simResults, fuel, prices } = useSimulationStore();

  const handleExport = async () => {
    try {
      if (!simResults) {
        if (Platform.OS === 'web') {
          alert("No Data: Simulation may not have run.");
        } else {
          Alert.alert("No Data", "Run a simulation first.");
        }
        return;
      }

      const currentPrice = prices[fuel].current;
      const { mean, sd, p5, p95, pRise, pFall, pStable } = simResults;

      const csvContent = [
        "Metric,Value",
        `Fuel Type,${fuel}`,
        `Current Price,${currentPrice.toFixed(2)}`,
        `Mean Projection,${mean.toFixed(2)}`,
        `Std Deviation,${sd.toFixed(4)}`,
        `5th Percentile (P5),${p5.toFixed(2)}`,
        `95th Percentile (P95),${p95.toFixed(2)}`,
        `Probability of Rise,${(pRise * 100).toFixed(1)}%`,
        `Probability of Fall,${(pFall * 100).toFixed(1)}%`,
        `Probability of Stable,${(pStable * 100).toFixed(1)}%`,
      ].join("\n");

      if (Platform.OS === 'web') {
        // --- WEB EXPORT ---
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `GasGuessr_${fuel}_Results.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
  const fileUri = `${FileSystem.cacheDirectory}GasGuessr_${fuel}_Results.csv`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: 'utf8',
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert("Error", "Sharing is not available on this device.");
    return;
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export GasGuessr Results',
    UTI: 'public.comma-separated-values-text',
  });
}
    } catch (e) {
      Alert.alert("Export Failed", String(e));
    }
  };

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

        {simResults && (
          <TouchableOpacity
            style={styles.btn}
            onPress={handleExport}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>EXPORT RESULTS TO CSV</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 40 },
  btn: {
    backgroundColor: '#ff5722',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
    ...Platform.select({
      web: {
        maxWidth: 400,
        alignSelf: 'center',
        width: '90%',
      }
    })
  },
  btnText: { color: 'white', fontWeight: 'bold' },
});