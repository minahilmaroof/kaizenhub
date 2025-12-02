import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import Loader from '../components/Loader';
import { roomsService } from '../../services/api';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');

// Helper function to get emoji and color based on room type
const getRoomStyle = type => {
  const typeLower = (type || '').toLowerCase();
  if (typeLower.includes('conference')) {
    return { emoji: '🏢', bgColor: '#E0E7FF' };
  } else if (typeLower.includes('meeting')) {
    return { emoji: '🏛️', bgColor: '#FEF3C7' };
  } else if (typeLower.includes('huddle')) {
    return { emoji: '💼', bgColor: '#FEE2E2' };
  } else {
    return { emoji: '🏠', bgColor: '#ECFDF5' };
  }
};

// Helper function to transform API room data to display format
const transformRoomData = room => {
  const style = getRoomStyle(room.type);
  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    price: parseFloat(room.hourly_rate || 0),
    fullDayPrice: parseFloat(room.day_rate || 0),
    amenities: room.amenities || [],
    type: room.type,
    emoji: style.emoji,
    bgColor: style.bgColor,
    ...room, // Keep all original data for booking
  };
};

const RoomsScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchRooms();
  }, []);

  // Animate sections when data is loaded
  useEffect(() => {
    if (!isLoading) {
      // Animate Section Title
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate Rooms List with delay
      if (!error && rooms.length > 0) {
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 500,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(contentTranslateY, {
            toValue: 0,
            duration: 500,
            delay: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      // Reset animations when loading
      titleOpacity.setValue(0);
      titleTranslateY.setValue(20);
      contentOpacity.setValue(0);
      contentTranslateY.setValue(20);
    }
  }, [isLoading, error, rooms.length]);

  const fetchRooms = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const date = today.toISOString().split('T')[0];

      // Default time range: current time to end of day (23:59)
      // API expects H:i format (HH:MM) without seconds
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const startTime = `${String(currentHour).padStart(2, '0')}:${String(
        currentMinute,
      ).padStart(2, '0')}`;
      const endTime = '23:59';

      const response = await roomsService.getAvailableRooms(
        date,
        startTime,
        endTime,
      );
      if (response.success && response.data) {
        // Handle both array and object with rooms property
        const roomsArray = Array.isArray(response.data)
          ? response.data
          : response.data.rooms || [];
        const transformedRooms = roomsArray.map(transformRoomData);
        setRooms(transformedRooms);
      } else {
        setError(response.message || 'Failed to load available rooms');
      }
    } catch (err) {
      console.error('Error fetching available rooms:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookRoom = room => {
    navigation.navigate('BookRoomScreen', { room });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Book a Room"
        subtitle="Select your preferred space"
        showBackButton={false}
      />

      {/* Section Title */}
      <Animated.View
        style={{
          opacity: titleOpacity,
          transform: [{ translateY: titleTranslateY }],
        }}
      >
        <Text style={styles.sectionTitle}>Available Rooms</Text>
      </Animated.View>

      {/* Rooms List */}
      <ScrollView
        style={styles.roomsList}
        contentContainerStyle={styles.roomsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Loader size="large" color={colors.primary} variant="morphing" />
            <Text style={styles.loadingText}>Loading rooms...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchRooms}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : rooms.length > 0 ? (
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            }}
          >
            {rooms.map(room => (
            <View key={room.id} style={styles.roomCard}>
              {/* Room Info */}
              <View style={styles.roomInfo}>
                <View style={styles.roomHeaderRow}>
                  <View
                    style={[
                      styles.roomIconContainer,
                      { backgroundColor: room.bgColor },
                    ]}
                  >
                    <Text style={styles.roomIcon}>{room.emoji}</Text>
                  </View>
                  <View style={styles.roomTitleSection}>
                    <Text style={styles.roomName} numberOfLines={1}>
                      {room.name}
                    </Text>
                    {!!room.type && (
                      <View style={styles.roomTypeBadge}>
                        <Text style={styles.roomTypeText}>{room.type}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.roomPrice}>PKR {room.price}</Text>
                    <Text style={styles.priceUnit}>/hour</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.capacityRow}>
                    <Text style={styles.capacityIcon}>👥</Text>
                    <Text style={styles.capacityText}>
                      Up to {room.capacity} people
                    </Text>
                  </View>
                  {room.fullDayPrice > 0 && (
                    <View style={styles.fullDayBadge}>
                      <Text style={styles.fullDayLabel}>Day Pass</Text>
                      <Text style={styles.fullDayValue}>
                        PKR {room.fullDayPrice}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Amenities */}
                {room.amenities?.length > 0 && (
                  <View style={styles.amenitiesContainer}>
                    {room.amenities.slice(0, 4).map((amenity, index) => (
                      <View key={index} style={styles.amenityChip}>
                        <Text style={styles.amenityDot}>•</Text>
                        <Text style={styles.amenityText} numberOfLines={1}>
                          {amenity}
                        </Text>
                      </View>
                    ))}
                    {room.amenities.length > 4 && (
                      <View style={[styles.amenityChip, styles.moreAmenitiesChip]}>
                        <Text style={styles.moreAmenitiesText}>
                          +{room.amenities.length - 4} more
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Book Button */}
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => handleBookRoom(room)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          </Animated.View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No rooms available</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  roomsList: {
    flex: 1,
  },
  roomsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  roomCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  roomInfo: {
    padding: 18,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  roomIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roomIcon: {
    fontSize: 22,
  },
  roomTitleSection: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roomTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceLight,
  },
  roomTypeText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  roomPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  priceUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  capacityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  capacityText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fullDayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
  },
  fullDayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    marginRight: 6,
  },
  fullDayValue: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.surfaceLight,
  },
  amenityDot: {
    fontSize: 10,
    color: colors.primary,
    marginRight: 4,
  },
  amenityText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    maxWidth: (width - 40) / 2.2,
  },
  moreAmenitiesChip: {
    backgroundColor: 'rgba(40,84,54,0.08)',
  },
  moreAmenitiesText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  loadingContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default RoomsScreen;
