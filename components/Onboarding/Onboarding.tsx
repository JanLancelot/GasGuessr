import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {Animated, StyleSheet, Text,TouchableOpacity, View, useWindowDimensions, Platform} from 'react-native';
import OnboardingItem from './OnboardingItem';
import Paginator from './Paginator';
import slides from './slides';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  const goTo = (index: number) => {
    if (index < 0 || index >= slides.length) return;
    setCurrentIndex(index);
    // Update scrollX manually for paginator dots
    Animated.timing(scrollX, {
      toValue: index * width,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={onComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slide content — just show current slide, no FlatList */}
      <View style={styles.slidesContainer}>
        <OnboardingItem item={slides[currentIndex]} />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => goTo(currentIndex - 1)}
          style={[styles.arrowButton, { opacity: currentIndex === 0 ? 0.2 : 1 }]}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={28} color="#F97316" />
        </TouchableOpacity>

        <Paginator data={slides} scrollX={scrollX} />

        {currentIndex === slides.length - 1 ? (
          <TouchableOpacity onPress={onComplete} style={styles.startButton}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => goTo(currentIndex + 1)}
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-forward" size={28} color="#F97316" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
  },
  skipBtn: {
    position: 'absolute',
    top: 52,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(249,115,22,0.1)',
  },
  skipText: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '600',
  },
  slidesContainer: {
    flex: 1,
    maxHeight: 500,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 32,
    paddingBottom: Platform.OS === 'web' ? 48 : 50,
  },
  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});