import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions, Platform } from 'react-native';
import OnboardingItem from './OnboardingItem';
import Paginator from './Paginator';
import { getSlides } from './slides';
import { useSimulationStore } from '../../src/store/useSimulationStore';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'language' | 'mode' | 'tutorial'>('language');
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  const { language, setLanguage, interactionMode, setInteractionMode } = useSimulationStore();
  const slides = getSlides(language);

  const goTo = (index: number) => {
    if (index < 0 || index >= slides.length) return;
    setCurrentIndex(index);
    Animated.timing(scrollX, {
      toValue: index * width,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  if (step === 'language') {
    return (
      <View style={styles.container}>
        <View style={styles.choiceContainer}>
          <Text style={styles.choiceTitle}>Choose your Language</Text>
          <Text style={styles.choiceSub}>Pumili ng Wika</Text>
          <TouchableOpacity
            style={[styles.choiceBtn, language === 'en' && styles.choiceBtnActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.choiceBtnText, language === 'en' && styles.choiceBtnTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.choiceBtn, language === 'tl' && styles.choiceBtnActive]}
            onPress={() => setLanguage('tl')}
          >
            <Text style={[styles.choiceBtnText, language === 'tl' && styles.choiceBtnTextActive]}>Tagalog</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.startButton} onPress={() => setStep('mode')}>
            <Text style={styles.startButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'mode') {
    return (
      <View style={styles.container}>
        <View style={styles.choiceContainer}>
          <Text style={styles.choiceTitle}>{language === 'en' ? 'Choose App Mode' : 'Pumili ng App Mode'}</Text>
          <Text style={styles.choiceSub}>{language === 'en' ? 'How do you want to use the app?' : 'Paano mo gustong gamitin ang app?'}</Text>
          
          <TouchableOpacity
            style={[styles.choiceBtn, interactionMode === 'fixed' && styles.choiceBtnActive]}
            onPress={() => setInteractionMode('fixed')}
          >
            <Text style={[styles.choiceBtnText, interactionMode === 'fixed' && styles.choiceBtnTextActive]}>
              {language === 'en' ? 'Fixed Output (View Predictions Only)' : 'Fixed Output (Tingnan lang ang Resulta)'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.choiceBtn, interactionMode === 'playground' && styles.choiceBtnActive]}
            onPress={() => setInteractionMode('playground')}
          >
            <Text style={[styles.choiceBtnText, interactionMode === 'playground' && styles.choiceBtnTextActive]}>
              {language === 'en' ? 'Playground (Adjust Variables)' : 'Playground (I-adjust ang Variables)'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.startButton} onPress={() => setStep('tutorial')}>
            <Text style={styles.startButtonText}>{language === 'en' ? 'Start Tutorial' : 'Umpisahan ang Tutorial'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={onComplete}>
        <Text style={styles.skipText}>{language === 'en' ? 'Skip' : 'Laktawan'}</Text>
      </TouchableOpacity>

      <View style={styles.slidesContainer}>
        <OnboardingItem item={slides[currentIndex]} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => goTo(currentIndex - 1)}
          style={[styles.arrowButton, { opacity: currentIndex === 0 ? 0.2 : 1 }]}
          disabled={currentIndex === 0}
        >
          <Ionicons name="chevron-back" size={28} color="#ff5722" />
        </TouchableOpacity>

        <Paginator data={slides} scrollX={scrollX} />

        {currentIndex === slides.length - 1 ? (
          <TouchableOpacity onPress={onComplete} style={styles.startButton}>
            <Text style={styles.startButtonText}>{language === 'en' ? 'Finish' : 'Tapusin'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => goTo(currentIndex + 1)}
            style={styles.arrowButton}
          >
            <Ionicons name="chevron-forward" size={28} color="#ff5722" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
    justifyContent: 'center',
  },
  choiceContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
  },
  choiceTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  choiceSub: {
    fontSize: 16,
    color: '#a0a0b0',
    marginBottom: 24,
    textAlign: 'center',
  },
  choiceBtn: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  choiceBtnActive: {
    backgroundColor: 'rgba(255, 87, 34, 0.15)',
    borderColor: '#ff5722',
  },
  choiceBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a0a0b0',
  },
  choiceBtnTextActive: {
    color: '#ff5722',
  },
  skipBtn: {
    position: 'absolute',
    top: 52,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 87, 34, 0.15)', 
  },
  skipText: {
    color: '#ff5722',  
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
    backgroundColor: 'rgba(255, 87, 34, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#ff5722',  
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
    marginTop: 16,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});