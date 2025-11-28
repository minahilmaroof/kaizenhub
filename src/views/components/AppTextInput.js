
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Icon from './ImageComponent/IconComponent';
import defaultStyles from '../../constants/styles';
import colors from '../../constants/colors';

function AppTextInput({
  icon,
  width = '100%',
  height,
  borderRadius = 10,
  textAreaWidth = '90%',
  borderWidth = 0,
  borderColor = colors.primary,
  alignItems = 'center',
  justifyContent = 'flex-start',
  paddingRight = 45,
  paddingHorizontal = 10,
  padding = 10,
  fontSize = 17,
  backgroundColor = colors.secondary,
  handlePasswordVisibility,
  isPasswordVisible,
  isPassword = false,
  iconPosition,
  elevation = 5,
  shadowColor = '#000',
  shadowOffset = { width: 0, height: 2 },
  shadowOpacity = 0.1,
  shadowRadius = 2,
  ...otherProps
}) {
  const shadowStyle =
    Platform.OS === 'ios'
      ? {
          shadowColor,
          shadowOffset,
          shadowOpacity,
          shadowRadius,
        }
      : {
          elevation,
        };

  return (
    <View
      style={[
        styles.container,
        shadowStyle,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          borderWidth,
          borderColor,
          alignItems,
          justifyContent,
          paddingHorizontal,
          padding,
          paddingRight,
        },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={20}
          style={[styles.icon, { alignSelf: iconPosition }]}
          color={colors.darkViolet}
        />
      )}

      <TextInput
        style={[
          defaultStyles.text,
          { width: textAreaWidth, fontSize, height, textAlignVertical: 'top' },
        ]}
        {...otherProps}
      />

      {isPassword && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.eyeIconContainer}
          onPress={handlePasswordVisibility}
        >
          <Icon
            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            style={[styles.eyeIcon]}
            color={colors.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: '1.2%',
  },
  icon: {
    marginRight: '4%',
  },
  eyeIcon: {
    position: 'absolute',
    right: '4%',
  },
  eyeIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '10%',
  },
});

export default AppTextInput;
