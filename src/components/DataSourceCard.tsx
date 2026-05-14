import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
  UIManager,
  Animated,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
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

const createEmptyRow = (offset = 0): ManualRow => {
  const dt = new Date();
  dt.setDate(dt.getDate() - offset * 7);
  return {
    label: dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    g: '',
    d: '',
    c: '',
  };
};

/* ── Tiny section header ── */
const SectionLabel = ({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) => (
  <View style={s.sectionLabel}>
    <Ionicons name={icon as any} size={15} color={colors.blue} />
    <View style={{ flex: 1 }}>
      <Text style={s.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={s.sectionSub}>{subtitle}</Text> : null}
    </View>
  </View>
);

/* ── Data preview row ── */
const PreviewRow = ({ row, index, isLast }: { row: DataRow; index: number; isLast: boolean }) => (
  <View style={[s.prevRow, isLast && { borderBottomWidth: 0 }]}>
    <Text style={[s.prevCell, { flex: 1.3, color: colors.text2 }]}>{row.label}</Text>
    <Text style={[s.prevCell, { flex: 1 }]}>₱{row.g.toFixed(1)}</Text>
    <Text style={[s.prevCell, { flex: 1 }]}>₱{row.d.toFixed(1)}</Text>
    <Text style={[s.prevCell, { flex: 1 }]}>${row.c.toFixed(1)}</Text>
  </View>
);

/* ════════════════════════════════════════════ */
export const DataSourceCard = () => {
  const { history, dataSource, setHistory, calMode, setVar, language, interactionMode } =
    useSimulationStore();
  const isFixed = interactionMode === 'fixed';

  const t = {
    step1: { en: 'Step 1 — Simulation Method', tl: 'Hakbang 1 — Paraan ng Simulation' },
    step1sub: { en: 'How should the engine compute forecasts?', tl: 'Paano mag-compute ng forecast?' },
    histGbm: { en: 'Past Trends (GBM)', tl: 'Batay sa Nakaraan' },
    histDesc: { en: 'Uses historical price patterns to model future movement', tl: 'Ginagamit ang dating pattern ng presyo' },
    formBased: { en: 'Formula-Based', tl: 'Batay sa Pormula' },
    formDesc: { en: 'Computes price from crude, FX, tax & margins directly', tl: 'Kinakalkula mula sa krudo, palitan, at buwis' },
    step2: { en: 'Step 2 — Load Price Data', tl: 'Hakbang 2 — I-load ang Data' },
    step2sub: { en: 'Historical data drives the trend analysis', tl: 'Kailangan ng historical data para sa analysis' },
    preset: { en: 'Use DOE Preset', tl: 'Gamitin ang DOE Data' },
    presetDesc: { en: '24 weeks of real Philippine fuel prices from DOE', tl: '24 na linggo ng totoong presyo mula sa DOE' },
    custom: { en: 'Enter Custom Data', tl: 'Mag-input ng Sarili' },
    customDesc: { en: 'Type your own weekly price data (min. 3 rows)', tl: 'Mag-type ng sariling datos (min. 3 rows)' },
    week: { en: 'Week', tl: 'Linggo' },
    gas: { en: 'Gas ₱', tl: 'Gas ₱' },
    diesel: { en: 'Diesel ₱', tl: 'Diesel ₱' },
    crude: { en: 'Crude $', tl: 'Krudo $' },
    addRow: { en: '+ Add Week', tl: '+ Magdagdag' },
    apply: { en: 'Apply Data', tl: 'Gamitin ang Data' },
    applied: { en: 'Data Applied ✓', tl: 'Na-apply na ✓' },
    preview: { en: 'Loaded Data Preview', tl: 'Preview ng Na-load na Data' },
    points: { en: 'data points', tl: 'datos' },
    noData: { en: 'No data loaded yet', tl: 'Wala pang data' },
    clear: { en: 'Clear All', tl: 'Burahin Lahat' },
    locked: { en: 'Data source is locked in Fixed Mode', tl: 'Naka-lock ang data sa Fixed Mode' },
    showAll: { en: 'Show all', tl: 'Ipakita lahat' },
    showLess: { en: 'Show less', tl: 'Bawasan' },
    notNeeded: { en: 'Formula mode doesn\'t need historical data — inputs are on the Variables tab.', tl: 'Hindi kailangan ng historical data sa Formula mode.' },
  };

  const [mode, setMode] = useState<'preset' | 'custom'>(dataSource === 'manual' ? 'custom' : 'preset');
  const [manualRows, setManualRows] = useState<ManualRow[]>([
    createEmptyRow(2), createEmptyRow(1), createEmptyRow(0),
  ]);
  const [showAllPreview, setShowAllPreview] = useState(false);

  const updateManualRow = (i: number, field: keyof ManualRow, value: string) => {
    setManualRows((prev) => {
      const u = [...prev];
      u[i] = { ...u[i], [field]: value };
      return u;
    });
  };
  const removeManualRow = (i: number) => {
    if (manualRows.length <= 3) return;
    setManualRows((p) => p.filter((_, idx) => idx !== i));
  };
  const addManualRow = () => setManualRows((p) => [...p, createEmptyRow()]);

  const applyManualData = () => {
    const valid: DataRow[] = [];
    for (let i = 0; i < manualRows.length; i++) {
      const r = manualRows[i];
      const g = parseFloat(r.g), d = parseFloat(r.d), c = parseFloat(r.c);
      if (isNaN(g) || isNaN(d) || isNaN(c)) {
        Alert.alert('Invalid', `Row ${i + 1} has invalid values.`);
        return;
      }
      if (g <= 0 || d <= 0 || c <= 0) {
        Alert.alert('Invalid', `Row ${i + 1} must be positive.`);
        return;
      }
      valid.push({ label: r.label || `Wk ${i + 1}`, g, d, c });
    }
    if (valid.length < 3) {
      Alert.alert('Need More Data', 'At least 3 rows required.');
      return;
    }
    setHistory(valid, 'manual');
  };

  /* ── Preview data (show last 5 or all) ── */
  const previewData = showAllPreview ? history : history.slice(-5);

  return (
    <View style={s.container}>
      {/* Fixed-mode banner */}
      {isFixed && (
        <View style={s.lockedBanner}>
          <Ionicons name="lock-closed" size={16} color={colors.blue} />
          <Text style={s.lockedText}>{t.locked[language]}</Text>
        </View>
      )}

      {/* ─── STEP 1: Simulation Method ─── */}
      <View style={[s.card, isFixed && s.dimmed]} pointerEvents={isFixed ? 'none' : 'auto'}>
        <SectionLabel icon="analytics-outline" title={t.step1[language]} subtitle={t.step1sub[language]} />
        <View style={s.optionRow}>
          <TouchableOpacity
            style={[s.optionCard, calMode === 'historical' && s.optionCardActive]}
            onPress={() => setVar('calMode', 'historical')}
            activeOpacity={0.7}
          >
            <Ionicons name="trending-up" size={22} color={calMode === 'historical' ? colors.blue : colors.text3} />
            <Text style={[s.optionTitle, calMode === 'historical' && s.optionTitleActive]}>
              {t.histGbm[language]}
            </Text>
            <Text style={s.optionDesc}>{t.histDesc[language]}</Text>
            {calMode === 'historical' && (
              <View style={s.checkBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.optionCard, calMode === 'formula' && s.optionCardActive]}
            onPress={() => setVar('calMode', 'formula')}
            activeOpacity={0.7}
          >
            <Ionicons name="flask" size={22} color={calMode === 'formula' ? colors.blue : colors.text3} />
            <Text style={[s.optionTitle, calMode === 'formula' && s.optionTitleActive]}>
              {t.formBased[language]}
            </Text>
            <Text style={s.optionDesc}>{t.formDesc[language]}</Text>
            {calMode === 'formula' && (
              <View style={s.checkBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── STEP 2: Data Source (only for historical) ─── */}
      {calMode === 'formula' ? (
        <View style={s.infoCard}>
          <Ionicons name="information-circle" size={18} color={colors.blue} />
          <Text style={s.infoText}>{t.notNeeded[language]}</Text>
        </View>
      ) : (
        <>
          <View style={[s.card, isFixed && s.dimmed]} pointerEvents={isFixed ? 'none' : 'auto'}>
            <SectionLabel icon="folder-open-outline" title={t.step2[language]} subtitle={t.step2sub[language]} />

            {/* Source selector — large cards instead of tiny tabs */}
            <View style={s.optionRow}>
              <TouchableOpacity
                style={[s.sourceCard, mode === 'preset' && s.sourceCardActive]}
                onPress={() => { setMode('preset'); }}
                activeOpacity={0.7}
              >
                <Ionicons name="cloud-download-outline" size={20} color={mode === 'preset' ? colors.down : colors.text3} />
                <Text style={[s.sourceTitle, mode === 'preset' && s.sourceTitleActive]}>{t.preset[language]}</Text>
                <Text style={s.optionDesc}>{t.presetDesc[language]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.sourceCard, mode === 'custom' && s.sourceCardActive]}
                onPress={() => { setMode('custom'); }}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={20} color={mode === 'custom' ? colors.down : colors.text3} />
                <Text style={[s.sourceTitle, mode === 'custom' && s.sourceTitleActive]}>{t.custom[language]}</Text>
                <Text style={s.optionDesc}>{t.customDesc[language]}</Text>
              </TouchableOpacity>
            </View>

            {/* Preset action */}
            {mode === 'preset' && (
              <TouchableOpacity
                style={[s.actionBtn, dataSource === 'sample' && s.actionBtnDone]}
                onPress={() => setHistory([...SAMPLE_DATA], 'sample')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={dataSource === 'sample' ? 'checkmark-circle' : 'download-outline'}
                  size={18}
                  color={dataSource === 'sample' ? colors.down : '#fff'}
                />
                <Text style={[s.actionBtnText, dataSource === 'sample' && s.actionBtnTextDone]}>
                  {dataSource === 'sample' ? t.applied[language] : t.preset[language]}
                </Text>
              </TouchableOpacity>
            )}

            {/* Custom entry */}
            {mode === 'custom' && (
              <View style={s.customPanel}>
                {/* Table header */}
                <View style={s.tableHeader}>
                  <Text style={[s.thCell, { flex: 1.2 }]}>{t.week[language]}</Text>
                  <Text style={[s.thCell, { flex: 1 }]}>{t.gas[language]}</Text>
                  <Text style={[s.thCell, { flex: 1 }]}>{t.diesel[language]}</Text>
                  <Text style={[s.thCell, { flex: 1 }]}>{t.crude[language]}</Text>
                  <View style={{ width: 32 }} />
                </View>
                {/* Rows */}
                <ScrollView style={s.customScrollWrap} nestedScrollEnabled showsVerticalScrollIndicator>
                  {manualRows.map((row, i) => (
                    <View key={i} style={s.inputRow}>
                      <View style={{ flex: 1.2 }}>
                        <TextInput
                          style={s.inputLabel}
                          value={row.label}
                          onChangeText={(v) => updateManualRow(i, 'label', v)}
                          placeholder="Label"
                          placeholderTextColor={colors.text3}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <TextInput
                          style={s.inputNum}
                          value={row.g}
                          onChangeText={(v) => updateManualRow(i, 'g', v)}
                          placeholder="0.00"
                          placeholderTextColor={colors.text3}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <TextInput
                          style={s.inputNum}
                          value={row.d}
                          onChangeText={(v) => updateManualRow(i, 'd', v)}
                          placeholder="0.00"
                          placeholderTextColor={colors.text3}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <TextInput
                          style={s.inputNum}
                          value={row.c}
                          onChangeText={(v) => updateManualRow(i, 'c', v)}
                          placeholder="0.00"
                          placeholderTextColor={colors.text3}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      <TouchableOpacity
                        style={s.deleteBtn}
                        onPress={() => removeManualRow(i)}
                        disabled={manualRows.length <= 3}
                        activeOpacity={0.6}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={manualRows.length <= 3 ? colors.border2 : colors.up}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                {/* Actions */}
                <View style={s.customActions}>
                  <TouchableOpacity style={s.addBtn} onPress={addManualRow} activeOpacity={0.7}>
                    <Text style={s.addBtnText}>{t.addRow[language]}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.actionBtn, { flex: 2 }, dataSource === 'manual' && s.actionBtnDone]}
                    onPress={applyManualData}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={dataSource === 'manual' ? 'checkmark-circle' : 'push-outline'}
                      size={16}
                      color={dataSource === 'manual' ? colors.down : '#fff'}
                    />
                    <Text style={[s.actionBtnText, dataSource === 'manual' && s.actionBtnTextDone]}>
                      {dataSource === 'manual' ? t.applied[language] : t.apply[language]}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* ─── Data Preview ─── */}
          {history.length > 0 && (
            <View style={s.card}>
              <SectionLabel icon="eye-outline" title={t.preview[language]} />
              <View style={s.previewBadgeRow}>
                <View style={s.previewBadge}>
                  <Text style={s.previewBadgeText}>{history.length} {t.points[language]}</Text>
                </View>
              </View>
              {/* Table header */}
              <View style={s.tableHeader}>
                <Text style={[s.thCell, { flex: 1.3 }]}>{t.week[language]}</Text>
                <Text style={[s.thCell, { flex: 1 }]}>{t.gas[language]}</Text>
                <Text style={[s.thCell, { flex: 1 }]}>{t.diesel[language]}</Text>
                <Text style={[s.thCell, { flex: 1 }]}>{t.crude[language]}</Text>
              </View>
              {previewData.map((row, i) => (
                <PreviewRow key={i} row={row} index={i} isLast={i === previewData.length - 1} />
              ))}
              {history.length > 5 && (
                <TouchableOpacity style={s.showToggle} onPress={() => setShowAllPreview(!showAllPreview)} activeOpacity={0.7}>
                  <Text style={s.showToggleText}>
                    {showAllPreview ? t.showLess[language] : `${t.showAll[language]} (${history.length})`}
                  </Text>
                  <Ionicons name={showAllPreview ? 'chevron-up' : 'chevron-down'} size={14} color={colors.blue} />
                </TouchableOpacity>
              )}
              {/* Clear */}
              <TouchableOpacity style={s.clearBtn} onPress={() => setHistory([], 'none')} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={14} color={colors.up} />
                <Text style={s.clearBtnText}>{t.clear[language]}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* No data state */}
          {history.length === 0 && (
            <View style={s.emptyState}>
              <Ionicons name="document-text-outline" size={32} color={colors.text3} />
              <Text style={s.emptyText}>{t.noData[language]}</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

/* ═══════════════════ STYLES ═══════════════════ */
const s = StyleSheet.create({
  container: { gap: 12, paddingHorizontal: 16 },

  /* Locked banner */
  lockedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.blueDim, borderWidth: 1, borderColor: colors.blue,
    borderRadius: 12, padding: 14,
  },
  lockedText: { color: colors.blue, fontWeight: '600', fontSize: 13, flex: 1 },

  /* Cards */
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 16,
  },
  dimmed: { opacity: 0.5 },

  /* Section labels */
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.text, letterSpacing: 0.1 },
  sectionSub: { fontSize: 11, color: colors.text2, marginTop: 2 },

  /* Option cards (Step 1 — method picker) */
  optionRow: { flexDirection: 'row', gap: 10 },
  optionCard: {
    flex: 1, padding: 14, backgroundColor: colors.bg, borderWidth: 1.5,
    borderColor: colors.border, borderRadius: 14, alignItems: 'center', gap: 6,
    position: 'relative' as const,
  },
  optionCardActive: { backgroundColor: colors.blueDim, borderColor: colors.blue },
  optionTitle: { fontSize: 12, fontWeight: '700', color: colors.text3, textAlign: 'center' },
  optionTitleActive: { color: colors.blue },
  optionDesc: { fontSize: 10, color: colors.text2, textAlign: 'center', lineHeight: 14 },
  checkBadge: {
    position: 'absolute' as const, top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center',
  },

  /* Source cards (Step 2) */
  sourceCard: {
    flex: 1, padding: 14, backgroundColor: colors.bg, borderWidth: 1.5,
    borderColor: colors.border, borderRadius: 14, alignItems: 'center', gap: 6,
  },
  sourceCardActive: { backgroundColor: colors.downDim, borderColor: colors.down },
  sourceTitle: { fontSize: 12, fontWeight: '700', color: colors.text3, textAlign: 'center' },
  sourceTitleActive: { color: colors.down },

  /* Action button */
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.blue, borderRadius: 12, paddingVertical: 14, marginTop: 14,
  },
  actionBtnDone: { backgroundColor: colors.downDim, borderWidth: 1, borderColor: colors.down },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  actionBtnTextDone: { color: colors.down },

  /* Info card */
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.blueDim, borderRadius: 12, padding: 14,
  },
  infoText: { fontSize: 12, color: colors.text2, flex: 1, lineHeight: 18 },

  /* Custom panel */
  customPanel: { marginTop: 14 },
  customScrollWrap: { maxHeight: 360 },
  tableHeader: {
    flexDirection: 'row', alignItems: 'center', paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 6,
  },
  thCell: {
    fontSize: 10, fontWeight: '800', color: colors.text3,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8,
  },
  inputLabel: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingVertical: 10, paddingHorizontal: 8,
    fontSize: 12, color: colors.text,
  },
  inputNum: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingVertical: 10, paddingHorizontal: 6,
    fontSize: 13, color: colors.text, textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  deleteBtn: { width: 32, alignItems: 'center', justifyContent: 'center' },
  customActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  addBtn: {
    flex: 1, paddingVertical: 12, borderWidth: 1.5, borderColor: colors.blue,
    borderStyle: 'dashed', borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: colors.blue },

  /* Preview */
  previewBadgeRow: {
    flexDirection: 'row', marginBottom: 10, marginTop: -6,
  },
  previewBadge: {
    backgroundColor: colors.downDim, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8, alignSelf: 'flex-start',
  },
  previewBadgeText: { fontSize: 11, fontWeight: '700', color: colors.down },
  prevRow: {
    flexDirection: 'row', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  prevCell: { fontSize: 12, color: colors.text, fontVariant: ['tabular-nums'] },
  showToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingTop: 10,
  },
  showToggleText: { fontSize: 12, color: colors.blue, fontWeight: '600' },

  /* Clear */
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginTop: 12, paddingVertical: 10,
    backgroundColor: colors.upMuted, borderRadius: 10,
  },
  clearBtnText: { fontSize: 12, color: colors.up, fontWeight: '600' },

  /* Empty state */
  emptyState: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 10,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16,
  },
  emptyText: { fontSize: 13, color: colors.text3 },
});
