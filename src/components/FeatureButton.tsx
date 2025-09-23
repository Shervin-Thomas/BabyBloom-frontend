import React from 'react';
import { Pressable, Text, View, StyleSheet, Image, ImageStyle, TextStyle } from 'react-native';

interface FeatureButtonProps {
  icon: string | number; // `number` type for image sources (e.g., require('./path'))
  title: string;
  onPress: () => void;
  color: string;
  size?: 'small' | 'medium' | 'large'; // Add size prop
  textColor?: string; // Optional label color (defaults to white)
  iconTintColor?: string; // Optional tint for mono glyph icons only (strings)
}

export default function FeatureButton({ icon, title, onPress, color, size = 'medium', textColor = '#FFFFFF', iconTintColor = '#FFFFFF' }: FeatureButtonProps) {
  const buttonSize = size === 'small' ? 70 : size === 'large' ? 110 : 90;
  const iconSize = size === 'small' ? 25 : size === 'large' ? 60 : 40;
  const titleSize = size === 'small' ? 11 : size === 'large' ? 16 : 14;

  const titleStyle: TextStyle = { fontSize: titleSize, color: textColor, textAlign: 'center', width: '100%', alignSelf: 'center' };
  const monoIconStyle: TextStyle = { fontSize: iconSize, color: iconTintColor };
  // Keep image icons as-is (no tint) to preserve original colors
  const imageIconStyle: ImageStyle = { width: iconSize, height: iconSize };

  // Square container size slightly larger than icon
  const containerSide = iconSize * 1.6;

  // Force two-line labels for multi-word titles by inserting a line break at the first space
  const displayTitle = title.includes(' ') ? title.replace(' ', '\n') : title;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{
      backgroundColor: color,
      opacity: pressed ? 0.8 : 1,
      width: buttonSize,
      height: buttonSize,
    }, styles.buttonContainer]}>
      <View style={[
        styles.iconContainer,
        {
          width: containerSide,
          height: containerSide,
          borderRadius: 10,
        }
      ]}>
        {typeof icon === 'string' ? (
          <Text style={[styles.icon, monoIconStyle]}>{icon}</Text>
        ) : (
          <Image source={icon} style={[styles.imageIcon, imageIconStyle]} />
        )}
      </View>
      <Text style={[styles.title, titleStyle]} numberOfLines={2} ellipsizeMode="tail">{displayTitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 8,
  },
  iconContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
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
