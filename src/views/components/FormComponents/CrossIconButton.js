// components/CrossIconButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../ImageComponent/IconComponent'; // 👈 Adjust path if needed

const CrossIconButton = ({
  onPress,
  size = 16, // Smaller icon
  color = '#000',
  style,
  iconName = 'close',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Keep it easily tappable
    >
      <Icon name={iconName} size={size} color={color} isFocused />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 4, // Less padding for smaller button
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CrossIconButton;
