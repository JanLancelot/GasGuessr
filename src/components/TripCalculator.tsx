import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';
import Ionicons from '@expo/vector-icons/Ionicons';

export const TripCalculator = () => {
  const { vehicles, activeVehicleId, prices, fuel, simResults, language, tripProfiles, addTripProfile, deleteTripProfile } = useSimulationStore();
  const [distance, setDistance] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDist, setNewDist] = useState('');

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);
  const efficiency = activeVehicle ? activeVehicle.efficiency : 10;
  
  const currentPrice = prices[fuel].current;
  const projectedPrice = simResults ? simResults.mean : currentPrice;

  const distVal = parseFloat(distance) || 0;
  const litersNeeded = distVal / efficiency;
  const costNow = litersNeeded * currentPrice;
  const costProjected = litersNeeded * projectedPrice;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="map" size={20} color={colors.up} style={{ marginRight: 6 }} />
        <Text style={styles.title}>{language === 'en' ? 'Trip Cost Calculator' : 'Kalkulator ng Biyahe'}</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{language === 'en' ? 'Trip Distance (km)' : 'Layo ng Biyahe (km)'}</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 150"
          placeholderTextColor={colors.text3}
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
        />
      </View>

      <View style={styles.presetsHeader}>
        <Text style={styles.label}>{language === 'en' ? 'Saved Trips' : 'Naka-save na Biyahe'}</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={styles.addBtnSmall}>
          <Ionicons name={isAdding ? 'close' : 'add'} size={14} color={colors.text3} />
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={styles.addForm}>
          <TextInput 
            style={[styles.input, { marginBottom: 8, padding: 8, fontSize: 13 }]} 
            placeholder={language === 'en' ? "Trip Name" : "Pangalan ng Biyahe"} 
            placeholderTextColor={colors.text3} 
            value={newName} 
            onChangeText={setNewName} 
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput 
              style={[styles.input, { flex: 1, padding: 8, fontSize: 13 }]} 
              placeholder={language === 'en' ? "Distance (km)" : "Layo (km)"} 
              placeholderTextColor={colors.text3} 
              keyboardType="numeric" 
              value={newDist} 
              onChangeText={setNewDist} 
            />
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={() => {
                if (newName.trim() && newDist.trim()) {
                  addTripProfile({ name: newName, dist: parseFloat(newDist) || 0 });
                  setNewName('');
                  setNewDist('');
                  setIsAdding(false);
                }
              }}
            >
              <Text style={styles.submitBtnText}>{language === 'en' ? 'Save' : 'I-save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.presets}>
        {tripProfiles.map(p => (
          <TouchableOpacity 
            key={p.id} 
            style={styles.presetBtn}
            onPress={() => setDistance(p.dist.toString())}
            onLongPress={() => {
              Alert.alert(
                language === 'en' ? "Delete Trip" : "Burahin", 
                language === 'en' ? `Remove ${p.name}?` : `Burahin ang ${p.name}?`, 
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteTripProfile(p.id) }
                ]
              );
            }}
          >
            <Text style={styles.presetBtnText}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.resultsBox}>
        <View style={styles.resultRow}>
          <Text style={styles.resultLbl}>{language === 'en' ? 'Using Current Price' : 'Gamit ang Kasalukuyang Presyo'}</Text>
          <Text style={styles.resultVal}>₱{costNow.toLocaleString(undefined, {maximumFractionDigits:0})}</Text>
        </View>
        {simResults ? (
          <>
            <View style={styles.resultDivider} />
            <View style={styles.resultRow}>
              <Text style={styles.resultLbl}>{language === 'en' ? 'Using Projected Price' : 'Gamit ang Projected na Presyo'}</Text>
              <Text style={styles.resultVal}>₱{costProjected.toLocaleString(undefined, {maximumFractionDigits:0})}</Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.resultDivider} />
            <Text style={{ fontSize: 11, color: colors.text3, fontStyle: 'italic', textAlign: 'center' }}>
              {language === 'en' ? 'Run a simulation to see projected trip cost.' : 'Mag-simulate para makita ang projected na gastos.'}
            </Text>
          </>
        )}
      </View>
      
      <Text style={styles.infoText}>
        {language === 'en' 
          ? `Calculated using ${efficiency} km/L (${activeVehicle?.name || 'Default Vehicle'})`
          : `Kinakalkula gamit ang ${efficiency} km/L (${activeVehicle?.name || 'Default Vehicle'})`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  },
  inputGroup: {
    marginBottom: 12,
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
    padding: 12,
    color: colors.text,
    fontSize: 16,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  presetBtn: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  presetBtnText: {
    fontSize: 11,
    color: colors.text2,
  },
  resultsBox: {
    backgroundColor: colors.card2,
    borderRadius: 12,
    padding: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLbl: {
    fontSize: 13,
    color: colors.text2,
    fontWeight: '500',
  },
  resultVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.up,
  },
  resultDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  infoText: {
    fontSize: 10,
    color: colors.text3,
    textAlign: 'center',
    marginTop: 12,
  },
  presetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  addBtnSmall: {
    padding: 2,
    backgroundColor: colors.bg,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addForm: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: colors.card2,
    borderRadius: 8,
  },
  submitBtn: {
    backgroundColor: colors.up,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
