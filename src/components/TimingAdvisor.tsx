import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';
import Ionicons from '@expo/vector-icons/Ionicons';

export const TimingAdvisor = () => {
  const { simResults, language } = useSimulationStore();
  if (!simResults) return null;

  const { pRise, pFall, weeklyMeans } = simResults;
  
  let verdict = 'STABLE';
  let message = 'Price expected to remain steady.';
  let icon = 'remove-circle';
  let color = colors.neutral;

  if (weeklyMeans.length > 1) {
    if (pRise > 0.55 && weeklyMeans[1] > weeklyMeans[0]) {
      verdict = 'FILL NOW';
      message = 'Price is projected to spike next week.';
      icon = 'alert-circle';
      color = colors.up;
    } else if (pFall > 0.55 && weeklyMeans[1] < weeklyMeans[0]) {
      verdict = 'WAIT 3 DAYS';
      message = 'Price is projected to drop next week.';
      icon = 'time';
      color = colors.down;
    }
  }

  if (language === 'tl') {
    if (verdict === 'FILL NOW') {
      verdict = 'MAGPAKASHA NGAYON';
      message = 'Tataas ang presyo sa susunod na linggo.';
    } else if (verdict === 'WAIT 3 DAYS') {
      verdict = 'MAGHINTAY';
      message = 'Bababa ang presyo sa susunod na linggo.';
    } else {
      verdict = 'STABLE';
      message = 'Hindi gaano magbabago ang presyo.';
    }
  }

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={28} color={color} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.verdict, { color }]}>{verdict}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  verdict: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 12,
    color: colors.text2,
    marginTop: 2,
    fontWeight: '500',
  },
});
