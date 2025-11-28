import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ZoomableImage from './ZoomableImage';
import config from '../../../config';

const ProfileImageWithBorder = ({ uri, size = 120 }) => {
  const placeholder = require('../../../assets/images/profile_icon.jpeg');

  const borderWidth = 4; // 👈 thinner border

  return (
    <LinearGradient
      colors={['#133FDB', '#B7004D']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradientBorder,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View
        style={[
          styles.innerCircle,
          {
            width: size - borderWidth,
            height: size - borderWidth,
            borderRadius: (size - borderWidth) / 2,
          },
        ]}
      >
        <ZoomableImage
          uri={uri ? `${config.userimageURL}${uri}` : null}
          placeholder={placeholder}
          style={{
            width: size - borderWidth * 2,
            height: size - borderWidth * 2,
            borderRadius: (size - borderWidth * 2) / 2,
          }}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileImageWithBorder;
