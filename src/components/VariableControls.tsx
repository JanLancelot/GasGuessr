import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';

const triggerHaptic = () => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
};

const geoLabels = {
  en: [
    '0: Stable (Normal trade; no major regional conflicts)',
    '1: Low Tension (Diplomatic friction; localized strikes)',
    '2: Moderate Risk (Regional instability; threats to shipping)',
    '3: High Conflict (Active war in producer regions; sanctions)',
    '4: Severe Crisis (Total supply cutoff; energy emergency)',
  ],
  tl: [
    '0: Matatag (Walang gulo; normal ang daloy ng langis)',
    '1: Mababang Tensyon (May tensyong diplomatiko/protesta)',
    '2: Katamtamang Panganib (Banta sa mga shipping routes)',
    '3: Matinding Gulo (Digmaan sa mga producer; sanctions)',
    '4: Malalang Krisis (Pagkaputol ng supply; emergency)',
  ],
};
const opecLabels = {
  en: [
    '0: Aggressive Cut (Major supply reduction to spike prices)',
    '1: Moderate Cut (Small cuts to support price floors)',
    '2: Neutral (No change; supply matches global demand)',
    '3: Boost Supply (Increased production to lower prices)',
    '4: Flood Market (Aggressive price war for market share)',
  ],
  tl: [
    '0: Matinding Bawas (Pagbabawas para mapataas ang presyo)',
    '1: Katamtamang Bawas (Pagsuporta sa kasalukuyang presyo)',
    '2: Neutral (Walang bago; sapat ang langis sa mundo)',
    '3: Dagdag Supply (Pagpapababa sa presyo ng merkado)',
    '4: Pabaha ng Supply (Price war para sa market share)',
  ],
};

const descriptions = {
  mops: { en: "Base imported price", tl: "Presyo ng inangkat na langis" },
  fx: { en: "Exchange rate", tl: "Palitan ng Dolyar sa Piso" },
  demand: { en: "Global fuel demand", tl: "Lakas ng konsumo ng langis" },
  geo: { en: "Global tension & volatility", tl: "Banta ng gulo at gyera" },
  opec: { en: "Global oil supply controls", tl: "Kontrol sa dami ng supply" },
  horizon: { en: "Simulation timeframe", tl: "Haba ng panahon" },
  iter: { en: "Simulation cycles", tl: "Dami ng beses uulitin" },
};

interface ControlRowProps {
  icon: string;
  label: string;
  description?: string;
  valLabel?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onValueChange: (v: number) => void;
  isNumeric?: boolean;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
}

const ControlRow = ({
  icon,
  label,
  description,
  valLabel,
  min,
  max,
  step,
  value,
  onValueChange,
  isNumeric = false,
  prefix = '',
  suffix = '',
  disabled = false,
}: ControlRowProps) => {
  const [textVal, setTextVal] = useState(
    Number.isInteger(value) ? value.toString() : value.toFixed(2)
  );

  useEffect(() => {
    setTextVal(Number.isInteger(value) ? value.toString() : value.toFixed(2));
  }, [value]);

  const handleBlur = () => {
    if (disabled) return;
    let parsed = parseFloat(textVal);
    if (isNaN(parsed)) {
      setTextVal(Number.isInteger(value) ? value.toString() : value.toFixed(2));
      return;
    }
    parsed = Math.min(Math.max(parsed, min), max);
    setTextVal(Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(2));
    onValueChange(parsed);
  };

  const pct = ((value - min) / (max - min)) * 100;

  let mainValLabel = valLabel;
  let subValLabel = '';

  if (!isNumeric && valLabel && valLabel.includes('(')) {
    const parts = valLabel.split('(');
    mainValLabel = parts[0].trim();
    subValLabel = parts[1].replace(')', '').trim();
  }

  return (
    <View style={[styles.row, disabled && { opacity: 0.6 }]}>
      <View style={styles.labelRow}>
        <View style={styles.labelLeft}>
          <Text style={styles.labelIcon}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{label}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
            {subValLabel ? (
              <Text style={styles.subValText}>{subValLabel}</Text>
            ) : null}
          </View>
        </View>
        <View style={[styles.valBadge, disabled && { backgroundColor: 'transparent', borderColor: 'transparent' }]}>
          {isNumeric ? (
            <View style={styles.numericWrap}>
              {prefix ? <Text style={styles.valText}>{prefix}</Text> : null}
              <TextInput
                style={[styles.valText, styles.valInput]}
                value={textVal}
                onChangeText={setTextVal}
                onBlur={handleBlur}
                keyboardType="decimal-pad"
                returnKeyType="done"
                editable={!disabled}
              />
              {suffix ? <Text style={styles.valText}>{suffix}</Text> : null}
            </View>
          ) : (
            <Text style={styles.valText}>{mainValLabel}</Text>
          )}
        </View>
      </View>
      {!disabled && (
        <View style={styles.sliderTrackBg}>
          <View style={[styles.sliderTrackFill, { width: `${pct}%` }]} />
        </View>
      )}
      {!disabled && (
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={(v) => { triggerHaptic(); onValueChange(v); }}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor={colors.up}
          disabled={disabled}
        />
      )}
    </View>
  );
};

export const VariableControls = () => {
  const { crude, fx, demand, geo, opec, projWeeks, iter, setVar, language, interactionMode } =
    useSimulationStore();
  const isFixed = interactionMode === 'fixed';

  return (
    <View style={styles.container}>
      <ControlRow
        icon="🛢️"
        label="Regional Fuel (MOPS)"
        description={descriptions.mops[language]}
        min={60}
        max={150}
        step={1}
        value={crude}
        onValueChange={(v) => setVar('crude', v)}
        isNumeric={true}
        prefix="$"
        disabled={isFixed}
      />
      <ControlRow
        icon="💱"
        label="USD/PHP Rate"
        description={descriptions.fx[language]}
        min={45}
        max={75}
        step={0.25}
        value={fx}
        onValueChange={(v) => setVar('fx', v)}
        isNumeric={true}
        prefix="₱"
        disabled={isFixed}
      />
      <ControlRow
        icon="📊"
        label="Demand Index"
        description={descriptions.demand[language]}
        min={0.75}
        max={1.25}
        step={0.01}
        value={demand}
        onValueChange={(v) => setVar('demand', v)}
        isNumeric={true}
        suffix="×"
        disabled={isFixed}
      />
      <ControlRow
        icon="🌍"
        label="Geopolitical Risk"
        description={descriptions.geo[language]}
        valLabel={geoLabels[language][geo]}
        min={0}
        max={4}
        step={1}
        value={geo}
        onValueChange={(v) => setVar('geo', v)}
        disabled={isFixed}
      />
      <ControlRow
        icon="⚙️"
        label="OPEC Policy"
        description={descriptions.opec[language]}
        valLabel={opecLabels[language][opec]}
        min={0}
        max={4}
        step={1}
        value={opec}
        onValueChange={(v) => setVar('opec', v)}
        disabled={isFixed}
      />

      <View style={styles.divider} />

      <ControlRow
        icon="📅"
        label="Forecast Horizon"
        description={descriptions.horizon[language]}
        min={1}
        max={2}
        step={1}
        value={projWeeks}
        onValueChange={(v) => setVar('projWeeks', v)}
        isNumeric={true}
        suffix={` week${projWeeks > 1 ? 's' : ''}`}
        disabled={isFixed}
      />
      <ControlRow
        icon="🔁"
        label="Iterations"
        description={descriptions.iter[language]}
        min={1000}
        max={50000}
        step={1000}
        value={iter}
        onValueChange={(v) => setVar('iter', v)}
        isNumeric={true}
        disabled={isFixed}
      />

      <View style={styles.snapshotNote}>
        <Ionicons name="time-outline" size={12} color={colors.text3} />
        <Text style={styles.snapshotNoteText}>
          {language === 'en'
            ? "Settings represent the 'Current State' snapshot used as the baseline for the entire projection timeframe."
            : "Ang mga setting ay kumakatawan sa 'Kasalukuyang Kalagayan' na gagamiting baseline para sa buong forecast."}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  row: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
    marginBottom: 8,
    position: 'relative' as const,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  labelIcon: {
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  description: {
    fontSize: 10,
    color: colors.text + '90',
    marginTop: 2,
  },
  subValText: {
    fontSize: 10,
    color: colors.up,
    marginTop: 3,
    fontWeight: '500',
  },
  valBadge: {
    backgroundColor: colors.card2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    maxWidth: '65%',
  },
  valText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  numericWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valInput: {
    minWidth: 32,
    textAlign: 'center',
    padding: 0,
    margin: 0,
  },
  sliderTrackBg: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  sliderTrackFill: {
    height: '100%',
    backgroundColor: colors.up + '40',
    borderRadius: 2,
  },
  slider: {
    width: '100%',
    height: 36,
    marginTop: -6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
    marginHorizontal: 8,
  },
  snapshotNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.card2,
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  snapshotNoteText: {
    flex: 1,
    fontSize: 10,
    color: colors.text3,
    lineHeight: 14,
    fontStyle: 'italic',
  },
});
