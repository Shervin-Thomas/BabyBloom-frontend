import React from 'react';
import { Pressable, Text, View, StyleSheet, Image } from 'react-native';

interface FeatureButtonProps {
  icon: string | number; // `number` type for image sources (e.g., require('./path'))
  title: string;
  onPress: () => void;
  color: string;
  size?: 'small' | 'medium' | 'large'; // Add size prop
}

export default function FeatureButton({ icon, title, onPress, color, size = 'medium' }: FeatureButtonProps) {
  const buttonSize = size === 'small' ? 70 : size === 'large' ? 110 : 90;
  const iconSize = size === 'small' ? 25 : size === 'large' ? 60 : 40;
  const titleSize = size === 'small' ? 11 : size === 'large' ? 16 : 14;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{
      backgroundColor: color,
      opacity: pressed ? 0.8 : 1,
      width: buttonSize,
      height: buttonSize,
    }, styles.buttonContainer]}>
      <View style={[styles.iconContainer, { width: iconSize * 1.5, height: iconSize * 1.5, borderRadius: iconSize * 0.75 }]}>
        {typeof icon === 'string' ? (
          <Text style={[styles.icon, { fontSize: iconSize, color: '#333' }]}>{icon}</Text>
        ) : (
          <Image source={icon} style={[styles.imageIcon, { width: iconSize, height: iconSize }]} />
        )}
      </View>
      <Text style={[styles.title, { fontSize: titleSize, color: '#333' }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
  },
  imageIcon: {
    resizeMode: 'contain',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
