import React from 'react';
import {Image, ImageSourcePropType, StyleSheet,Text, useWindowDimensions, View, Platform} from 'react-native';

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
  const imageHeight = Platform.OS === 'web' ? 260 : height * 0.32;

  return (
    <View style={[styles.container, { width }]}>

      {/* Wrapper gives the rounded corners */}
      <View style={[styles.imageWrapper, { width: width * 0.55, height: imageHeight }]}>
        <Image
          source={item.image}
          style={styles.image}
        />
      </View>

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
  justifyContent: 'center',
  paddingHorizontal: 24,
  backgroundColor: '#0f0f1a',  
},
  imageWrapper: {
    borderRadius: 24,       
    overflow: 'hidden',     
    marginBottom: 28,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  textWrap: {
    alignItems: 'center',
    maxWidth: 520,
  },
  title: {
  fontWeight: '800',
  fontSize: 28,
  marginBottom: 12,
  color: '#ffffff',      
  textAlign: 'center',
},
  description: {
  fontWeight: '300',
  color: '#a0a0b0',       
  textAlign: 'center',
  fontSize: 15,
  lineHeight: 22,
  paddingHorizontal: 16,
},
});