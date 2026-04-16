import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View, ViewToken } from 'react-native';

import OnboardingItem from './OnboardingItem';
import Paginator from './Paginator';
import slides from './slides';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  
  const scrollTo = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else if (direction === 'prev' && currentIndex > 0) {
      slidesRef.current?.scrollToIndex({ index: currentIndex - 1 });
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={slides}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false } 
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

     
      <View style={styles.footer}>
        
      
        <TouchableOpacity 
          onPress={() => scrollTo('prev')} 
          style={[styles.arrowButton, { opacity: currentIndex === 0 ? 0 : 1 }]} 
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
          <TouchableOpacity onPress={() => scrollTo('next')} style={styles.arrowButton}>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', 
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 30,
    paddingBottom: 40, 
  },
  arrowButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(249, 115, 22, 0.1)', 
  },
  startButton: {
    backgroundColor: '#F97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});