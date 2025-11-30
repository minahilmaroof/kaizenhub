import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../../constants/colors';
import storage from '../../app/storage';
import Icon from '../components/ImageComponent/IconComponent';
const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Book Your Perfect Space',
    description:
      'Reserve conference rooms, huddle spaces, and meeting rooms with just a few taps',
   
    icon: 'door-open',
    gradient: [colors.primary, colors.primaryLight],
    type: 'fontAwesome',
    borderColor: colors.primary,
    placeholderIcon: '🏢',
    placeholderBg: colors.statusUpcomingBg,
  },
  {
    id: '2',
    title: 'Order Food & Beverages',
    description:
      'Browse our cafeteria menu and get fresh food delivered right to your desk',
  
    icon: 'fast-food-outline',
    gradient: ['#F5842C', '#FB923C'],
    type: 'ionicons',
    borderColor: '#F5842C',
    placeholderIcon: '🥪',
    placeholderBg: '#FFF3E8',
  },
];

// Animated Pagination Dot Component
const AnimatedDot = ({ isActive, index, currentIndex }) => {
  const dotScale = useRef(new Animated.Value(1)).current;
  const dotOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(dotScale, {
          toValue: 1.2,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.spring(dotScale, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(dotOpacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  const activeColor = currentIndex === 1 ? '#F5842C' : colors.primary;

  return (
    <Animated.View
      style={[
        styles.dot,
        isActive ? { ...styles.activeDot, backgroundColor: activeColor } : styles.inactiveDot,
        {
          transform: [{ scale: dotScale }],
          opacity: dotOpacity,
        },
      ]}
    />
  );
};

// Animated Slide Component
const AnimatedSlide = ({ item, isActive }) => {
  const imageScale = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(50)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const descTranslateY = useRef(new Animated.Value(30)).current;
  const descOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      // Reset animations
      imageScale.setValue(0);
      imageOpacity.setValue(0);
      iconTranslateY.setValue(50);
      iconOpacity.setValue(0);
      titleTranslateY.setValue(30);
      titleOpacity.setValue(0);
      descTranslateY.setValue(30);
      descOpacity.setValue(0);

      // Animate image container (scale + fade)
      Animated.parallel([
        Animated.spring(imageScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      // Animate icon (slide up + fade)
      Animated.parallel([
        Animated.spring(iconTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 500,
          delay: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      // Animate title (slide up + fade)
      Animated.parallel([
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          delay: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      // Animate description (slide up + fade)
      Animated.parallel([
        Animated.spring(descTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          delay: 600,
          useNativeDriver: true,
        }),
        Animated.timing(descOpacity, {
          toValue: 1,
          duration: 500,
          delay: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isActive]);

  return (
    <View style={styles.slide}>
      {/* Circular Image with Border */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            borderColor: item.borderColor,
            transform: [{ scale: imageScale }],
            opacity: imageOpacity,
          },
        ]}
      >
        <View
          style={[
            styles.placeholderImage,
            { backgroundColor: item.placeholderBg },
          ]}
        >
          <Text style={styles.placeholderIcon}>{item.placeholderIcon}</Text>
        </View>
      </Animated.View>

      {/* Icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ translateY: iconTranslateY }],
            opacity: iconOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Icon
            name={item.icon}
            size={28}
            color={colors.white}
            type={item.type}
          />
        </LinearGradient>
      </Animated.View>

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            transform: [{ translateY: titleTranslateY }],
            opacity: titleOpacity,
          },
        ]}
      >
        {item.title}
      </Animated.Text>

      {/* Description */}
      <Animated.Text
        style={[
          styles.description,
          {
            transform: [{ translateY: descTranslateY }],
            opacity: descOpacity,
          },
        ]}
      >
        {item.description}
      </Animated.Text>
    </View>
  );
};

const OnboardingScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const completeOnboarding = async () => {
    await storage.setFirstTimeUser();
    navigation.replace('AuthScreen');
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const handleGetStarted = () => {
    completeOnboarding();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem = ({ item, index }) => (
    <AnimatedSlide item={item} isActive={index === currentIndex} />
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingData.map((_, index) => (
        <AnimatedDot key={index} isActive={index === currentIndex} index={index} currentIndex={currentIndex} />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Pagination */}
      {renderPagination()}

      {/* Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: buttonScale }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.9}
          style={styles.buttonTouchable}
        >
          <LinearGradient
            colors={currentIndex === 1 ? ['#F5842C', '#FB923C'] : colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {currentIndex === onboardingData.length - 1
                ? 'Get Started'
                : 'Next'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  slide: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  imageContainer: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    borderWidth: 4,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginBottom: 32,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 32,
    backgroundColor: colors.primary,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E0E0E0',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  buttonTouchable: {
    width: '100%',
  },
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
});

export default OnboardingScreen;
