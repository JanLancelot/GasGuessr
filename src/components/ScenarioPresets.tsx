import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { useSimulationStore, SCENARIO_PRESETS, ScenarioPreset } from '../store/useSimulationStore';

const PresetCard = ({ preset, isActive, onPress, language }: {
  preset: ScenarioPreset;
  isActive: boolean;
  onPress: () => void;
  language: 'en' | 'tl';
}) => (
  <TouchableOpacity
    style={[styles.card, isActive && { borderColor: preset.color, backgroundColor: preset.color + '15' }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.icon}>{preset.icon}</Text>
    <Text style={[styles.name, isActive && { color: preset.color }]}>{preset.name[language]}</Text>
    <Text style={styles.desc}>{preset.desc[language]}</Text>
    {isActive && (
      <View style={[styles.activeDot, { backgroundColor: preset.color }]} />
    )}
  </TouchableOpacity>
);

export const ScenarioPresets = () => {
  const { crude, fx, demand, geo, opec, language, applyScenario, interactionMode } = useSimulationStore();
  const isFixed = interactionMode === 'fixed';

  const activePreset = SCENARIO_PRESETS.find(p =>
    p.values.crude === crude && p.values.fx === fx &&
    p.values.demand === demand && p.values.geo === geo && p.values.opec === opec
  );

  const handlePress = (preset: ScenarioPreset) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    applyScenario(preset);
  };

  const t = {
    title: { en: 'Quick Scenarios', tl: 'Mabilis na Senaryo' },
    sub: { en: 'Tap to apply a preset configuration', tl: 'I-tap para gamitin ang preset' },
  };

  if (!isFixed) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.title[language]}</Text>
        <Text style={styles.sub}>{t.sub[language]}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SCENARIO_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isActive={activePreset?.id === preset.id}
            onPress={() => handlePress(preset)}
            language={language}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    marginBottom: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 10,
    color: colors.text2,
    marginTop: 2,
  },
  scrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  card: {
    width: 130,
    padding: 14,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    gap: 4,
    position: 'relative' as const,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  desc: {
    fontSize: 9,
    color: colors.text2,
    lineHeight: 13,
  },
  activeDot: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
