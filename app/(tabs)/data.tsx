import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { DataSourceCard } from '../../src/components/DataSourceCard';
import { useSimulationStore } from '../../src/store/useSimulationStore';

export default function DataScreen() {
  const language = useSimulationStore((s) => s.language);
  const t = {
    title: { en: 'Data Source', tl: 'Pinagmulan ng Data' },
    sub: { en: 'Manage reference data & calibration', tl: 'Pamahalaan ang data at kalibrasyon' },
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <View style={styles.headerIconWrap}>
              <Ionicons name="server" size={18} color={colors.blue} />
            </View>
            <View>
              <Text style={styles.headerTitle}>{t.title[language]}</Text>
              <Text style={styles.headerSub}>{t.sub[language]}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.langSwitch} 
            onPress={() => useSimulationStore.getState().setLanguage(language === 'en' ? 'tl' : 'en')}
            activeOpacity={0.7}
          >
            <Text style={styles.langSwitchText}>
              {language === 'en' ? 'TGL' : 'ENG'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DataSourceCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.blueDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: colors.text2,
    marginTop: 2,
  },
  langSwitch: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  langSwitchText: {
    color: colors.text2,
    fontSize: 10,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
});
