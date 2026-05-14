import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';
import Ionicons from '@expo/vector-icons/Ionicons';

export const FillUpTracker = () => {
  const { fillUpLogs, activeVehicleId, addFillUpLog, deleteFillUpLog, language } = useSimulationStore();
  const [isAdding, setIsAdding] = useState(false);
  
  const [liters, setLiters] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [odometer, setOdometer] = useState('');
  const [station, setStation] = useState('');

  const vehicleLogs = fillUpLogs.filter(l => l.vehicleId === activeVehicleId);

  const handleAdd = () => {
    if (!activeVehicleId) return;
    addFillUpLog({
      vehicleId: activeVehicleId,
      date: new Date().toISOString(),
      liters: parseFloat(liters) || 0,
      totalCost: parseFloat(totalCost) || 0,
      odometer: parseFloat(odometer) || 0,
      station: station || 'Unknown Station'
    });
    setIsAdding(false);
    setLiters('');
    setTotalCost('');
    setOdometer('');
    setStation('');
  };

  const totalSpent = vehicleLogs.reduce((sum, log) => sum + log.totalCost, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="receipt" size={20} color={colors.up} style={{ marginRight: 6 }} />
        <Text style={styles.title}>{language === 'en' ? 'Fill-Up Log' : 'Tala ng Pagkakarga'}</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={styles.addBtn}>
          <Ionicons name={isAdding ? 'close' : 'add'} size={18} color={colors.text3} />
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={styles.addForm}>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Liters" placeholderTextColor={colors.text3} keyboardType="numeric" value={liters} onChangeText={setLiters} />
            <View style={{ width: 8 }} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Total ₱" placeholderTextColor={colors.text3} keyboardType="numeric" value={totalCost} onChangeText={setTotalCost} />
          </View>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Odometer" placeholderTextColor={colors.text3} keyboardType="numeric" value={odometer} onChangeText={setOdometer} />
            <View style={{ width: 8 }} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Station Name" placeholderTextColor={colors.text3} value={station} onChangeText={setStation} />
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
            <Text style={styles.submitBtnText}>{language === 'en' ? 'Save Log' : 'I-save'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {vehicleLogs.length > 0 && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLbl}>{language === 'en' ? 'Total Logged Spend' : 'Kabuuang Gastos'}</Text>
          <Text style={styles.summaryVal}>₱{totalSpent.toLocaleString()}</Text>
        </View>
      )}

      {vehicleLogs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{language === 'en' ? 'No logs yet for this vehicle.' : 'Wala pang tala para sa sasakyang ito.'}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {vehicleLogs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logMain}>
                <Text style={styles.logStation}>{log.station}</Text>
                <Text style={styles.logDate}>{new Date(log.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.logStats}>
                <Text style={styles.logCost}>₱{log.totalCost.toFixed(2)}</Text>
                <Text style={styles.logLiters}>{log.liters} L • {log.odometer} km</Text>
              </View>
              <TouchableOpacity onPress={() => deleteFillUpLog(log.id)} style={styles.delBtn}>
                <Ionicons name="trash" size={16} color={colors.down} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 40,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  addBtn: {
    padding: 4,
    backgroundColor: colors.bg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addForm: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.card2,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
  },
  submitBtn: {
    backgroundColor: colors.up,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryBox: {
    backgroundColor: colors.card2,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLbl: {
    fontSize: 11,
    color: colors.text3,
    marginBottom: 2,
  },
  summaryVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.text3,
    fontSize: 13,
  },
  list: {
    gap: 12,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logMain: {
    flex: 1,
  },
  logStation: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  logDate: {
    fontSize: 11,
    color: colors.text3,
    marginTop: 2,
  },
  logStats: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  logCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.up,
  },
  logLiters: {
    fontSize: 11,
    color: colors.text2,
    marginTop: 2,
  },
  delBtn: {
    padding: 8,
  },
});
