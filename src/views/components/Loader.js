import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../../constants/colors';

const Loader = ({
  size = 'small',
  color = colors.primary,
  variant = 'orbital', // 'orbital', 'gradient-spinner', 'ripple', 'particles', 'skeleton', 'morphing'
  style,
  gradientColors,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animatedValue2 = useRef(new Animated.Value(0)).current;
  const animatedValue3 = useRef(new Animated.Value(0)).current;
  const animatedValue4 = useRef(new Animated.Value(0)).current;
  const animatedValue5 = useRef(new Animated.Value(0)).current;

  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const loaderSize = sizeMap[size] || sizeMap.small;
  const defaultGradient = gradientColors || [color, color + '80', color];

  useEffect(() => {
    // Orbital animation - particles orbiting around center
    if (variant === 'orbital') {
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
      
      Animated.loop(
        Animated.timing(animatedValue2, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
      
      Animated.loop(
        Animated.timing(animatedValue3, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }
    
    // Gradient spinner with multiple layers
    else if (variant === 'gradient-spinner') {
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue2, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue2, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
    
    // Ripple effect
    else if (variant === 'ripple') {
      const createRipple = (animValue, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(animValue, {
                toValue: 1,
                duration: 2000,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]),
        );
      };
      
      createRipple(animatedValue, 0).start();
      createRipple(animatedValue2, 400).start();
      createRipple(animatedValue3, 800).start();
    }
    
    // Particles animation
    else if (variant === 'particles') {
      const createParticle = (animValue, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(animValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        );
      };
      
      createParticle(animatedValue, 0).start();
      createParticle(animatedValue2, 200).start();
      createParticle(animatedValue3, 400).start();
      createParticle(animatedValue4, 600).start();
      createParticle(animatedValue5, 800).start();
    }
    
    // Morphing blob
    else if (variant === 'morphing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue2, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue2, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [variant, animatedValue, animatedValue2, animatedValue3, animatedValue4, animatedValue5]);

  // Orbital loader - particles orbiting around center
  const renderOrbital = () => {
    const radius = loaderSize * 0.35;
    const particleSize = loaderSize * 0.15;

    return (
      <View style={[styles.container, { width: loaderSize, height: loaderSize }, style]}>
        {/* Center glow */}
        <View
          style={[
            styles.centerGlow,
            {
              width: loaderSize * 0.3,
              height: loaderSize * 0.3,
              borderRadius: loaderSize * 0.15,
              backgroundColor: color,
            },
          ]}
        />
        
        {/* Orbiting particles */}
        <Animated.View
          style={[
            styles.orbitalParticle,
            {
              width: particleSize,
              height: particleSize,
              borderRadius: particleSize / 2,
              backgroundColor: color,
              transform: [
                {
                  translateX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      radius * Math.cos(0),
                      radius * Math.cos(2 * Math.PI),
                    ],
                  }),
                },
                {
                  translateY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      radius * Math.sin(0),
                      radius * Math.sin(2 * Math.PI),
                    ],
                  }),
                },
              ],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.orbitalParticle,
            {
              width: particleSize,
              height: particleSize,
              borderRadius: particleSize / 2,
              backgroundColor: color,
              transform: [
                {
                  translateX: animatedValue2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      radius * Math.cos((2 * Math.PI) / 3),
                      radius * Math.cos((2 * Math.PI) / 3 + 2 * Math.PI),
                    ],
                  }),
                },
                {
                  translateY: animatedValue2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      radius * Math.sin((2 * Math.PI) / 3),
                      radius * Math.sin((2 * Math.PI) / 3 + 2 * Math.PI),
                    ],
                  }),
                },
              ],
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.orbitalParticle,
            {
              width: particleSize,
              height: particleSize,
              borderRadius: particleSize / 2,
              backgroundColor: color,
              transform: [
                {
                  translateX: animatedValue3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      radius * Math.cos((4 * Math.PI) / 3),
                      radius * Math.cos((4 * Math.PI) / 3 + 2 * Math.PI),
                    ],
                  }),
                },
                {
                  translateY: animatedValue3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [
                      radius * Math.sin((4 * Math.PI) / 3),
                      radius * Math.sin((4 * Math.PI) / 3 + 2 * Math.PI),
                    ],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    );
  };

  // Gradient spinner with multiple rotating layers
  const renderGradientSpinner = () => {
    const spin = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    
    const spinReverse = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['360deg', '0deg'],
    });
    
    const opacity = animatedValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

    return (
      <View style={[styles.container, { width: loaderSize, height: loaderSize }, style]}>
        {/* Outer rotating gradient ring */}
        <Animated.View
          style={[
            {
              width: loaderSize,
              height: loaderSize,
              borderRadius: loaderSize / 2,
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <View
            style={[
              {
                width: loaderSize,
                height: loaderSize,
                borderRadius: loaderSize / 2,
                borderWidth: 4,
                borderColor: 'transparent',
                borderTopColor: defaultGradient[0],
                borderRightColor: defaultGradient[1] || defaultGradient[0],
              },
            ]}
          />
        </Animated.View>
        
        {/* Inner counter-rotating ring */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: loaderSize * 0.7,
              height: loaderSize * 0.7,
              borderRadius: loaderSize * 0.35,
              transform: [{ rotate: spinReverse }],
              opacity,
            },
          ]}
        >
          <View
            style={[
              {
                width: loaderSize * 0.7,
                height: loaderSize * 0.7,
                borderRadius: loaderSize * 0.35,
                borderWidth: 3,
                borderColor: 'transparent',
                borderBottomColor: defaultGradient[0],
                borderLeftColor: defaultGradient[1] || defaultGradient[0],
              },
            ]}
          />
        </Animated.View>
        
        {/* Center dot with gradient */}
        <View
          style={[
            styles.centerDot,
            {
              width: loaderSize * 0.25,
              height: loaderSize * 0.25,
              borderRadius: loaderSize * 0.125,
            },
          ]}
        >
          <LinearGradient
            colors={defaultGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                width: '100%',
                height: '100%',
                borderRadius: loaderSize * 0.125,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  // Ripple effect loader
  const renderRipple = () => {
    const scale1 = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1.5],
    });
    
    const opacity1 = animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    });
    
    const scale2 = animatedValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1.5],
    });
    
    const opacity2 = animatedValue2.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    });
    
    const scale3 = animatedValue3.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1.5],
    });
    
    const opacity3 = animatedValue3.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    });

    return (
      <View style={[styles.container, { width: loaderSize, height: loaderSize }, style]}>
        {/* Center circle */}
        <View
          style={[
            styles.rippleCenter,
            {
              width: loaderSize * 0.4,
              height: loaderSize * 0.4,
              borderRadius: loaderSize * 0.2,
              backgroundColor: color,
            },
          ]}
        />
        
        {/* Ripple rings */}
        <Animated.View
          style={[
            styles.rippleRing,
            {
              width: loaderSize,
              height: loaderSize,
              borderRadius: loaderSize / 2,
              borderColor: color,
              transform: [{ scale: scale1 }],
              opacity: opacity1,
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.rippleRing,
            {
              width: loaderSize,
              height: loaderSize,
              borderRadius: loaderSize / 2,
              borderColor: color,
              transform: [{ scale: scale2 }],
              opacity: opacity2,
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.rippleRing,
            {
              width: loaderSize,
              height: loaderSize,
              borderRadius: loaderSize / 2,
              borderColor: color,
              transform: [{ scale: scale3 }],
              opacity: opacity3,
            },
          ]}
        />
      </View>
    );
  };

  // Particles loader - multiple particles expanding from center
  const renderParticles = () => {
    const particleCount = 5;
    const particles = [animatedValue, animatedValue2, animatedValue3, animatedValue4, animatedValue5];
    
    return (
      <View style={[styles.container, { width: loaderSize, height: loaderSize }, style]}>
        {particles.map((animValue, index) => {
          const angle = (index * 360) / particleCount;
          const radius = loaderSize * 0.4;
          
          const translateX = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, radius * Math.cos((angle * Math.PI) / 180)],
          });
          
          const translateY = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, radius * Math.sin((angle * Math.PI) / 180)],
          });
          
          const scale = animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0],
          });
          
          const opacity = animValue.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [0, 1, 0],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  width: loaderSize * 0.2,
                  height: loaderSize * 0.2,
                  borderRadius: loaderSize * 0.1,
                  backgroundColor: color,
                  transform: [{ translateX }, { translateY }, { scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
        
        {/* Center glow */}
        <View
          style={[
            styles.particleCenter,
            {
              width: loaderSize * 0.25,
              height: loaderSize * 0.25,
              borderRadius: loaderSize * 0.125,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    );
  };

  // Morphing blob loader
  const renderMorphing = () => {
    const scaleX1 = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.3],
    });
    
    const scaleY1 = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1.3, 1],
    });
    
    const scaleX2 = animatedValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [1.2, 1],
    });
    
    const scaleY2 = animatedValue2.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.2],
    });

    return (
      <View style={[styles.container, { width: loaderSize, height: loaderSize }, style]}>
        <Animated.View
          style={[
            {
              width: loaderSize * 0.8,
              height: loaderSize * 0.8,
              borderRadius: loaderSize * 0.4,
              transform: [{ scaleX: scaleX1 }, { scaleY: scaleY1 }],
            },
          ]}
        >
          <LinearGradient
            colors={defaultGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                width: '100%',
                height: '100%',
                borderRadius: loaderSize * 0.4,
              },
            ]}
          />
        </Animated.View>
        
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: loaderSize * 0.6,
              height: loaderSize * 0.6,
              borderRadius: loaderSize * 0.3,
              transform: [{ scaleX: scaleX2 }, { scaleY: scaleY2 }],
              opacity: 0.6,
            },
          ]}
        >
          <LinearGradient
            colors={[...defaultGradient].reverse()}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              {
                width: '100%',
                height: '100%',
                borderRadius: loaderSize * 0.3,
              },
            ]}
          />
        </Animated.View>
      </View>
    );
  };

  switch (variant) {
    case 'orbital':
      return renderOrbital();
    case 'gradient-spinner':
      return renderGradientSpinner();
    case 'ripple':
      return renderRipple();
    case 'particles':
      return renderParticles();
    case 'morphing':
      return renderMorphing();
    default:
      return renderOrbital();
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerGlow: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  orbitalParticle: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  gradientRing: {
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  centerDot: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rippleCenter: {
    position: 'absolute',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  rippleRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  particle: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  particleCenter: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default Loader;
