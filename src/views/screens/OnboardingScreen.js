import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../../constants/colors';
import storage from '../../app/storage';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Book Your Perfect Space',
    description:
      'Reserve conference rooms, huddle spaces, and meeting rooms with just a few taps',
    icon: '🚪',
    iconBg: '#4A7CFF',
    borderColor: '#4A7CFF',
    placeholderIcon: '🏢',
    placeholderBg: '#E8F0FF',
  },
  {
    id: '2',
    title: 'Order Food & Beverages',
    description:
      'Browse our cafeteria menu and get fresh food delivered right to your desk',
    icon: '🍴',
    iconBg: '#F5842C',
    borderColor: '#F5842C',
    placeholderIcon: '🥪',
    placeholderBg: '#FFF3E8',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
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

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {/* Circular Image with Border */}
      <View style={[styles.imageContainer, { borderColor: item.borderColor }]}>
        {/* Replace this View with Image when you have actual images */}
        {/* <Image source={item.image} style={styles.image} resizeMode="cover" /> */}
        <View
          style={[
            styles.placeholderImage,
            { backgroundColor: item.placeholderBg },
          ]}
        >
          <Text style={styles.placeholderIcon}>{item.placeholderIcon}</Text>
        </View>
      </View>

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentIndex === index ? styles.activeDot : styles.inactiveDot,
          ]}
        />
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
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={handleNext}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#4A7CFF', '#9B59B6']}
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
  },
  icon: {
    fontSize: 28,
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
    backgroundColor: '#4A7CFF',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E0E0E0',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
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
