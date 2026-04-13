import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSimulationStore, SAMPLE_DATA, DataRow } from '../store/useSimulationStore';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ManualRow {
  label: string;
  g: string;
  d: string;
  c: string;
}

const createEmptyRow = (): ManualRow => {
  const dt = new Date();
  return {
    label: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    g: '',
    d: '',
    c: '',
  };
};

export const DataSourceCard = () => {
  const { history, dataSource, setHistory, calMode, setVar } =
    useSimulationStore();
  const [tab, setTab] = useState<'sample' | 'manual'>('sample');
  const [manualRows, setManualRows] = useState<ManualRow[]>([
    createEmptyRow(),
    createEmptyRow(),
    createEmptyRow(),
  ]);

  const updateManualRow = (index: number, field: keyof ManualRow, value: string) => {
    setManualRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addManualRow = () => {
    setManualRows((prev) => [...prev, createEmptyRow()]);
  };

  const removeManualRow = (index: number) => {
    if (manualRows.length <= 1) return;
    setManualRows((prev) => prev.filter((_, i) => i !== index));
  };

  const applyManualData = () => {
    const validRows: DataRow[] = [];
    for (let i = 0; i < manualRows.length; i++) {
      const row = manualRows[i];
      const g = parseFloat(row.g);
      const d = parseFloat(row.d);
      const c = parseFloat(row.c);
      if (isNaN(g) || isNaN(d) || isNaN(c)) {
        Alert.alert(
          'Invalid Entry',
          `Row ${i + 1} has invalid values. All fields must be numbers.`,
          [{ text: 'OK' }]
        );
        return;
      }
      if (g <= 0 || d <= 0 || c <= 0) {
        Alert.alert(
          'Invalid Entry',
          `Row ${i + 1} must have positive values.`,
          [{ text: 'OK' }]
        );
        return;
      }
      validRows.push({ label: row.label || `Wk ${i + 1}`, g, d, c });
    }

    if (validRows.length < 2) {
      Alert.alert(
        'Not Enough Data',
        'At least 2 data points are required for simulation.',
        [{ text: 'OK' }]
      );
      return;
    }

    setHistory(validRows, 'manual');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="analytics-outline" size={16} color={colors.blue} />
          <Text style={styles.cardTitle}>Calibration Mode</Text>
        </View>
        <View style={styles.modeSwitch}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              calMode === 'historical' && styles.modeBtnActive,
            ]}
            onPress={() => setVar('calMode', 'historical')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trending-up"
              size={16}
              color={calMode === 'historical' ? colors.blue : colors.text3}
              style={{ marginBottom: 4 }}
            />
            <Text
              style={[
                styles.modeBtnText,
                calMode === 'historical' && styles.modeBtnTextActive,
              ]}
            >
              Historical (GBM)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              calMode === 'formula' && styles.modeBtnActive,
            ]}
            onPress={() => setVar('calMode', 'formula')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="flask"
              size={16}
              color={calMode === 'formula' ? colors.blue : colors.text3}
              style={{ marginBottom: 4 }}
            />
            <Text
              style={[
                styles.modeBtnText,
                calMode === 'formula' && styles.modeBtnTextActive,
              ]}
            >
              Formula-Based
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {calMode !== 'formula' && (
        <>
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="folder-open-outline" size={16} color={colors.blue} />
              <Text style={styles.cardTitle}>Data Source</Text>
            </View>

            <View style={styles.tabsWrap}>
              <TouchableOpacity
                style={[styles.tab, tab === 'sample' && styles.tabActive]}
                onPress={() => setTab('sample')}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabText, tab === 'sample' && styles.tabTextActive]}
                >
                  Sample
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, tab === 'manual' && styles.tabActive]}
                onPress={() => setTab('manual')}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabText, tab === 'manual' && styles.tabTextActive]}
                >
                  Manual
                </Text>
              </TouchableOpacity>
            </View>

            {tab === 'sample' && (
              <View style={styles.panel}>
                <Text style={styles.desc}>
                  24 weeks of actual DOE price adjustments including the crisis
                  period.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.loadBtn,
                    dataSource === 'sample' && styles.loadBtnActive,
                  ]}
                  onPress={() => setHistory([...SAMPLE_DATA], 'sample')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      dataSource === 'sample'
                        ? 'checkmark-circle'
                        : 'cloud-download-outline'
                    }
                    size={16}
                    color={dataSource === 'sample' ? colors.down : colors.text2}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.loadBtnText,
                      dataSource === 'sample' && styles.loadBtnTextActive,
                    ]}
                  >
                    {dataSource === 'sample'
                      ? 'Sample Data Active'
                      : 'Load Sample Data'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {tab === 'manual' && (
              <View style={styles.panel}>
                <Text style={styles.desc}>
                  Enter weekly price data points. At least 2 rows are required.
                </Text>

                <View style={styles.manualHeaderRow}>
                  <View style={styles.manualLabelCol}>
                    <Text style={styles.manualHeaderText}>Week</Text>
                  </View>
                  <View style={styles.manualInputCol}>
                    <Text style={styles.manualHeaderText}>Gas ₱</Text>
                  </View>
                  <View style={styles.manualInputCol}>
                    <Text style={styles.manualHeaderText}>Diesel ₱</Text>
                  </View>
                  <View style={styles.manualInputCol}>
                    <Text style={styles.manualHeaderText}>Crude $</Text>
                  </View>
                  <View style={styles.manualDeleteCol} />
                </View>

                <ScrollView
                  style={styles.manualScrollWrap}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {manualRows.map((row, index) => (
                    <View key={index} style={styles.manualRow}>
                      <View style={styles.manualLabelCol}>
                        <TextInput
                          style={styles.manualLabelInput}
                          value={row.label}
                          onChangeText={(v) => updateManualRow(index, 'label', v)}
                          placeholder="Label"
                          placeholderTextColor={colors.text3}
                        />
                      </View>
                      <View style={styles.manualInputCol}>
                        <TextInput
                          style={styles.manualInput}
                          value={row.g}
                          onChangeText={(v) => updateManualRow(index, 'g', v)}
                          placeholder="0.00"
                          placeholderTextColor={colors.text3}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={styles.manualInputCol}>
                        <TextInput
                          style={styles.manualInput}
                          value={row.d}
                          onChangeText={(v) => updateManualRow(index, 'd', v)}
                          placeholder="0.00"
                          placeholderTextColor={colors.text3}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={styles.manualInputCol}>
                        <TextInput
                          style={styles.manualInput}
                          value={row.c}
                          onChangeText={(v) => updateManualRow(index, 'c', v)}
                          placeholder="0.00"
                          placeholderTextColor={colors.text3}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.manualDeleteCol}
                        onPress={() => removeManualRow(index)}
                        activeOpacity={0.6}
                        disabled={manualRows.length <= 1}
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color={
                            manualRows.length <= 1
                              ? colors.border2
                              : colors.up
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.manualActions}>
                  <TouchableOpacity
                    style={styles.addRowBtn}
                    onPress={addManualRow}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={16}
                      color={colors.blue}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.addRowText}>Add Row</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.applyBtn,
                      dataSource === 'manual' && styles.applyBtnActive,
                    ]}
                    onPress={applyManualData}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={
                        dataSource === 'manual'
                          ? 'checkmark-circle'
                          : 'push-outline'
                      }
                      size={16}
                      color={dataSource === 'manual' ? colors.down : '#fff'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.applyBtnText,
                        dataSource === 'manual' && styles.applyBtnTextActive,
                      ]}
                    >
                      {dataSource === 'manual'
                        ? 'Manual Data Active'
                        : 'Apply Manual Data'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.statusBar}>
            <View style={styles.statusLeft}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      dataSource !== 'none' ? colors.down : colors.text3,
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {dataSource !== 'none'
                  ? `${history.length} data points · ${dataSource}`
                  : 'No data loaded'}
              </Text>
            </View>
            {history.length > 0 && (
              <TouchableOpacity
                onPress={() => setHistory([], 'none')}
                activeOpacity={0.7}
                style={styles.clearBtnWrap}
              >
                <Ionicons name="trash-outline" size={14} color={colors.up} />
                <Text style={styles.clearBtn}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.2,
  },
  modeSwitch: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnActive: {
    backgroundColor: colors.blueDim,
    borderColor: colors.blue,
  },
  modeBtnText: {
    fontSize: 11,
    color: colors.text3,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: colors.blue,
  },
  tabsWrap: {
    flexDirection: 'row',
    backgroundColor: colors.card2,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
    gap: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.blue,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text3,
  },
  tabTextActive: {
    color: '#fff',
  },
  panel: {},
  desc: {
    fontSize: 12,
    color: colors.text2,
    lineHeight: 18,
    marginBottom: 12,
  },
  loadBtn: {
    flexDirection: 'row',
    paddingVertical: 13,
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadBtnActive: {
    backgroundColor: colors.downDim,
    borderColor: colors.down,
  },
  loadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text2,
  },
  loadBtnTextActive: {
    color: colors.down,
  },
  manualHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  manualHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  manualScrollWrap: {
    maxHeight: 220,
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 4,
  },
  manualLabelCol: {
    flex: 1.2,
  },
  manualInputCol: {
    flex: 1,
  },
  manualDeleteCol: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualLabelInput: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 11,
    color: colors.text,
  },
  manualInput: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  manualActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  addRowBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.blue,
    borderStyle: 'dashed',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRowText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.blue,
  },
  applyBtn: {
    flex: 1.5,
    flexDirection: 'row',
    paddingVertical: 11,
    backgroundColor: colors.blue,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnActive: {
    backgroundColor: colors.downDim,
    borderWidth: 1,
    borderColor: colors.down,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  applyBtnTextActive: {
    color: colors.down,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: colors.text2,
  },
  clearBtnWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearBtn: {
    fontSize: 12,
    color: colors.up,
    fontWeight: '600',
  },
});
