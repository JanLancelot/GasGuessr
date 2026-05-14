import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';
import Ionicons from '@expo/vector-icons/Ionicons';

export const BudgetEstimator = () => {
  const { simResults, weeklyKm, fuelEfficiency, setVar, language } = useSimulationStore();
  const [isEditing, setIsEditing] = useState(false);
  
  if (!simResults) return null;

  const { p5, p95 } = simResults;
  
  const litersPerWeek = weeklyKm / fuelEfficiency;
  const litersPerMonth = litersPerWeek * 4;
  const budgetLow = litersPerMonth * p5;
  const budgetHigh = litersPerMonth * p95;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="wallet" size={18} color={colors.text2} style={{ marginRight: 6 }} />
        <Text style={styles.title}>{language === 'en' ? 'Monthly Budget Estimator' : 'Buwanang Budget'}</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editBtn}>
          <Ionicons name={isEditing ? 'checkmark' : 'pencil'} size={14} color={colors.text3} />
        </TouchableOpacity>
      </View>
      
      {isEditing ? (
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{language === 'en' ? 'Weekly km' : 'Km kada linggo'}</Text>
            <TextInput
              style={styles.input}
              value={String(weeklyKm)}
              onChangeText={(text) => setVar('weeklyKm', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{language === 'en' ? 'km/L' : 'km/L'}</Text>
            <TextInput
              style={styles.input}
              value={String(fuelEfficiency)}
              onChangeText={(text) => setVar('fuelEfficiency', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
      ) : (
        <View style={styles.budgetDisplay}>
          <Text style={styles.budgetRange}>₱{budgetLow.toLocaleString(undefined, {maximumFractionDigits:0})} - ₱{budgetHigh.toLocaleString(undefined, {maximumFractionDigits:0})}</Text>
          <Text style={styles.budgetDesc}>
            {language === 'en' 
              ? `Based on ${weeklyKm} km/wk at ${fuelEfficiency} km/L`
              : `Batay sa ${weeklyKm} km/linggo at ${fuelEfficiency} km/L`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text2,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    flex: 1,
  },
  editBtn: {
    padding: 4,
    backgroundColor: colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  budgetDisplay: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  budgetRange: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  budgetDesc: {
    fontSize: 11,
    color: colors.text3,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.text2,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
