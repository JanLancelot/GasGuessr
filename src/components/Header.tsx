import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { useSimulationStore } from '../store/useSimulationStore';

export const Header = () => {
  const { fuel, setFuel } = useSimulationStore();
  const [time, setTime] = useState(
    new Date().toLocaleTimeString('en-PH', { hour12: false })
  );
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-PH', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>⛽</Text>
          </View>
          <View style={styles.logoTextWrap}>
            <Text style={styles.logoText}>
              Gas<Text style={{ color: colors.up }}>Guessr</Text>
            </Text>
          </View>
        </View>

        <View style={styles.liveBadge}>
          <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
          <Text style={styles.clockText}>{time}</Text>
        </View>
      </View>

      <View style={styles.fuelToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, fuel === 'gasoline' && styles.toggleBtnActive]}
          onPress={() => setFuel('gasoline')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleBtnText,
              fuel === 'gasoline' && styles.toggleBtnTextActive,
            ]}
          >
            ⛽  Gasoline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, fuel === 'diesel' && styles.toggleBtnActive]}
          onPress={() => setFuel('diesel')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.toggleBtnText,
              fuel === 'diesel' && styles.toggleBtnTextActive,
            ]}
          >
            🛢️  Diesel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,154,58,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 18,
  },
  logoTextWrap: {
    marginLeft: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.down,
  },
  clockText: {
    fontSize: 11,
    color: colors.text2,
    fontVariant: ['tabular-nums'],
  },
  fuelToggle: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.up,
    shadowColor: colors.up,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text3,
  },
  toggleBtnTextActive: {
    color: '#fff',
  },
});
