import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
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
        Alert.alert("No Data", "simResults is null — simulation may not have run.");
        return;
      }

      Alert.alert("Debug", `Mean: ${simResults.mean}, P5: ${simResults.p5}`);

      const currentPrice = prices[fuel].current;
      const { mean, sd, p5, p95, pRise, pFall, pStable } = simResults;

      const csvData = [
        "Metric,Value",
        `Fuel Type,${fuel}`,
        `Current Price,₱${currentPrice.toFixed(2)}`,
        `Mean Projection,₱${mean.toFixed(2)}`,
        `Std Deviation,${sd.toFixed(4)}`,
        `5th Percentile (P5),₱${p5.toFixed(2)}`,
        `95th Percentile (P95),₱${p95.toFixed(2)}`,
        `Probability of Rise,${(pRise * 100).toFixed(1)}%`,
        `Probability of Fall,${(pFall * 100).toFixed(1)}%`,
        `Probability of Stable,${(pStable * 100).toFixed(1)}%`,
      ].join("\n");

      const folder = (FileSystem as any).documentDirectory;
      Alert.alert("Folder", `Path: ${folder}`);

      const fileUri = folder + "GasGuessr_Results.csv";
      await (FileSystem as any).writeAsStringAsync(fileUri, csvData);

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Error", "Sharing is not available on this device.");
        return;
      }

      await Sharing.shareAsync(fileUri);
    } catch (e) {
      Alert.alert("Exception", String(e));
      console.log("Error sharing", e);
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
  },
  btnText: { color: 'white', fontWeight: 'bold' },
});