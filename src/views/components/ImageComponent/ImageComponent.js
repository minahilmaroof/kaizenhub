import React, { useState } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import colors from '../../../constants/colors'; // optional: use your app colors if available

function ImageComponent({ source, style, height, width, resizeMode = 'cover' }) {
  const [loading, setLoading] = useState(true);

  const imageSource =
    typeof source === 'string' ? { uri: source } : source; // handle both local and remote

  return (
    <View
      style={[
        styles.container,
        { height: height || 50, width: width || 50 },
        style,
      ]}
    >
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors?.primary || '#999'} />
        </View>
      )}

      <Image
        source={imageSource}
        style={[StyleSheet.absoluteFill, { height: '100%', width: '100%' }]}
        resizeMode={resizeMode}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  loaderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default ImageComponent;
