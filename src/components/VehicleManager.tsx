import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { useSimulationStore, VehicleProfile } from '../store/useSimulationStore';
import Ionicons from '@expo/vector-icons/Ionicons';

export const VehicleManager = () => {
  const { vehicles, activeVehicleId, setActiveVehicle, addVehicle, updateVehicle, deleteVehicle, language } = useSimulationStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFuelType, setNewFuelType] = useState<'gasoline' | 'diesel'>('gasoline');
  const [newEfficiency, setNewEfficiency] = useState('10');
  const [newTankSize, setNewTankSize] = useState('45');

  const handleAdd = () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'Please enter a vehicle name.');
      return;
    }
    addVehicle({
      name: newName,
      fuelType: newFuelType,
      efficiency: parseFloat(newEfficiency) || 10,
      tankSize: parseFloat(newTankSize) || 45,
    });
    setIsAdding(false);
    setNewName('');
  };

  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="car" size={20} color={colors.blue} style={{ marginRight: 6 }} />
        <Text style={styles.title}>{language === 'en' ? 'My Garage' : 'Aking Garahe'}</Text>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)} style={styles.addBtn}>
          <Ionicons name={isAdding ? 'close' : 'add'} size={18} color={colors.text3} />
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={styles.addForm}>
          <TextInput 
            style={styles.input} 
            placeholder={language === 'en' ? "Vehicle Name" : "Pangalan ng Sasakyan"} 
            placeholderTextColor={colors.text3}
            value={newName} 
            onChangeText={setNewName} 
          />
          <View style={styles.row}>
            <TouchableOpacity 
              style={[styles.fuelBtn, newFuelType === 'gasoline' && styles.fuelBtnActive]} 
              onPress={() => setNewFuelType('gasoline')}
            >
              <Text style={[styles.fuelBtnText, newFuelType === 'gasoline' && styles.fuelBtnTextActive]}>Gasoline</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fuelBtn, newFuelType === 'diesel' && styles.fuelBtnActive]} 
              onPress={() => setNewFuelType('diesel')}
            >
              <Text style={[styles.fuelBtnText, newFuelType === 'diesel' && styles.fuelBtnTextActive]}>Diesel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>km/L</Text>
              <TextInput style={styles.input} value={newEfficiency} onChangeText={setNewEfficiency} keyboardType="numeric" />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Tank (L)</Text>
              <TextInput style={styles.input} value={newTankSize} onChangeText={setNewTankSize} keyboardType="numeric" />
            </View>
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
            <Text style={styles.submitBtnText}>{language === 'en' ? 'Add Vehicle' : 'Idagdag'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
        {vehicles.map(v => (
          <TouchableOpacity 
            key={v.id} 
            style={[styles.vehiclePill, activeVehicleId === v.id && styles.vehiclePillActive]}
            onPress={() => setActiveVehicle(v.id)}
            onLongPress={() => {
              Alert.alert(
                language === 'en' ? "Delete Vehicle" : "Burahin", 
                language === 'en' ? `Remove ${v.name}?` : `Burahin ang ${v.name}?`, 
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteVehicle(v.id) }
                ]
              );
            }}
          >
            <Text style={[styles.vehiclePillText, activeVehicleId === v.id && styles.vehiclePillTextActive]}>{v.name}</Text>
            {activeVehicleId === v.id && (
              <View style={styles.activeDot} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {activeVehicle && (
        <View style={styles.vehicleStats}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{activeVehicle.fuelType === 'gasoline' ? '⛽ Gas' : '🛢️ Diesel'}</Text>
            <Text style={styles.statLbl}>{language === 'en' ? 'Fuel Type' : 'Klaseng Langis'}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{activeVehicle.efficiency} km/L</Text>
            <Text style={styles.statLbl}>Efficiency</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{activeVehicle.tankSize} L</Text>
            <Text style={styles.statLbl}>Tank Size</Text>
          </View>
          <TouchableOpacity 
            style={styles.delActiveBtn}
            onPress={() => {
              Alert.alert(
                language === 'en' ? "Delete Vehicle" : "Burahin", 
                language === 'en' ? `Remove ${activeVehicle.name}?` : `Burahin ang ${activeVehicle.name}?`, 
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => deleteVehicle(activeVehicle.id) }
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.down} />
          </TouchableOpacity>
        </View>
      )}
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
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    color: colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: colors.text2,
    marginBottom: 4,
    marginLeft: 2,
  },
  fuelBtn: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  fuelBtnActive: {
    backgroundColor: colors.upDim,
    borderColor: colors.up,
  },
  fuelBtnText: {
    color: colors.text3,
    fontWeight: 'bold',
  },
  fuelBtnTextActive: {
    color: colors.up,
  },
  submitBtn: {
    backgroundColor: colors.blue,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  vehicleScroll: {
    flexGrow: 0,
    marginBottom: 12,
  },
  vehiclePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehiclePillActive: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  vehiclePillText: {
    color: colors.text2,
    fontWeight: '600',
  },
  vehiclePillTextActive: {
    color: 'white',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginLeft: 6,
  },
  vehicleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card2,
    padding: 12,
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLbl: {
    fontSize: 10,
    color: colors.text3,
    marginTop: 2,
  },
  delActiveBtn: {
    justifyContent: 'center',
    padding: 8,
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
