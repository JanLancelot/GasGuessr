import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

interface OnboardingItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    image: ImageSourcePropType;
  };
}

export default function OnboardingItem({ item }: OnboardingItemProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, { width }]}>
      <Image source={item.image} style={[styles.image, { width }]} />
      
      <View style={styles.textWrap}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 120,    
  },
  image: {
    height: 300,               
    resizeMode: 'contain',
    marginBottom: 30,
  },
  textWrap: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 10,
    color: '#493d8a',
    textAlign: 'center',
  },
  description: {
    fontWeight: '300',
    color: '#62656b',
    textAlign: 'center',
    paddingHorizontal: 64,
  },
});