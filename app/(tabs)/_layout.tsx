import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Onboarding from '../../components/Onboarding/Onboarding';
import { useSimulationStore } from '../../src/store/useSimulationStore';
import { colors } from '../../src/theme/colors';

const ONBOARDING_KEY = 'gasguessr_onboarding_done';

export default function TabLayout() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [checked, setChecked] = useState(false);
  const language = useSimulationStore((s) => s.language);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        const done = localStorage.getItem(ONBOARDING_KEY);
        if (!done) setShowTutorial(true);
        setChecked(true);
      } else {
        // Use AsyncStorage on mobile
        const done = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!done) setShowTutorial(true);
        setChecked(true);
      }
    };
    checkOnboarding();
  }, []);

  const handleOnboardingComplete = async () => {
    if (Platform.OS === 'web') {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } else {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    }
    setShowTutorial(false);
  };

  // Prevent flicker while checking storage
  if (!checked) return null;

  if (showTutorial) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 100 : 102,
          paddingBottom: Platform.OS === 'ios' ? 38 : 40,
          paddingTop: 8,
          elevation: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: colors.up,
        tabBarInactiveTintColor: colors.text3,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarIconStyle: { marginBottom: -2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: language === 'en' ? 'Forecast' : 'Pagtaya',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bar-chart' : 'bar-chart-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inputs"
        options={{
          title: language === 'en' ? 'Inputs' : 'Inputs',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'options' : 'options-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          title: language === 'en' ? 'Data' : 'Data',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'server' : 'server-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}