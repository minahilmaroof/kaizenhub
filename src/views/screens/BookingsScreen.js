import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AppBar from '../components/AppBar';
import Loader from '../components/Loader';
import ConfirmationPopup from '../components/ConfirmationPopup';
import colors from '../../constants/colors';
import { bookingsService, ordersService, dayPassService } from '../../services/api';

const { width } = Dimensions.get('window');

const filterTabs = [
  { id: 'all', title: 'All' },
  { id: 'rooms', title: 'Rooms', icon: '🚪' },
  { id: 'food', title: 'Food', icon: '🍴' },
  { id: 'daypasses', title: 'Day Passes', icon: '🎫' },
];

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to format time
const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Helper function to format time range
const formatTimeRange = (startTime, endTime) => {
  if (!startTime) return '';
  if (!endTime) return formatTime(startTime);
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

// Helper function to map status
const mapStatus = (status) => {
  const statusLower = (status || '').toLowerCase();
  if (statusLower === 'confirmed') {
    return {
      text: 'Confirmed',
      color: colors.success,
      bg: colors.statusPaidBg || '#ECFDF5',
    };
  } else if (statusLower === 'upcoming') {
    return {
      text: 'Upcoming',
      color: colors.primary,
      bg: colors.statusUpcomingBg || '#ECFDF5',
    };
  } else if (statusLower === 'completed' || statusLower === 'finished') {
    return {
      text: 'Completed',
      color: colors.success,
      bg: colors.statusPaidBg,
    };
  } else if (statusLower === 'cancelled' || statusLower === 'canceled') {
    return {
      text: 'Cancelled',
      color: colors.error,
      bg: colors.statusFailedBg,
    };
  } else if (statusLower === 'rescheduled') {
    return {
      text: 'Rescheduled',
      color: colors.warning || colors.secondary,
      bg: colors.statusPendingBg || '#FFF3E8',
    };
  } else {
    return {
      text: status || 'Pending',
      color: colors.textSecondary,
      bg: colors.borderLight,
    };
  }
};

// Helper function to transform booking data
const transformBooking = (booking) => {
  if (booking.type === 'booking' || booking.room || booking.data?.room) {
    // Room booking - handle both flat and nested structures
    const room = booking.room || booking.data?.room;
    const bookingDate = booking.date || booking.data?.date;
    const startTime = booking.start_time || booking.data?.start_time;
    const endTime = booking.end_time || booking.data?.end_time;
    const bookingStatus = booking.status || booking.data?.status;
    const bookingPrice = booking.price || booking.data?.price;
    
    return {
      id: booking.id || booking.data?.id,
      type: 'room',
      title: room?.name || booking.title || 'Room Booking',
      date: formatDate(bookingDate),
      time: formatTimeRange(startTime, endTime),
      price: parseFloat(bookingPrice || 0),
      status: mapStatus(bookingStatus).text,
      statusColor: mapStatus(bookingStatus).color,
      statusBg: mapStatus(bookingStatus).bg,
      emoji: '🚪',
      hasImage: true,
      rawDate: bookingDate,
      rawStatus: bookingStatus,
    };
  } else if (booking.type === 'order' || booking.items !== undefined || booking.total !== undefined) {
    // Food order
    const items = booking.items || [];
    let itemNames = [];
    
    // Handle both array of items and empty array
    if (Array.isArray(items) && items.length > 0) {
      itemNames = items.map(item => 
        `${item.name || item.food_item?.name || 'Item'} x${item.quantity || 1}`
      );
    }
    
    // If no items, show order ID or generic title
    const title = itemNames.length > 0 
      ? itemNames.slice(0, 2).join(' & ')
      : `Food Order #${booking.id || ''}`;
    
    return {
      id: booking.id,
      type: 'food',
      title: title,
      items: itemNames,
      date: formatDate(booking.created_at || booking.date),
      time: (() => {
        const createdAt = booking.created_at || booking.date;
        if (!createdAt) return '';
        // Handle ISO format: '2025-11-29T08:30:00.000000Z'
        if (typeof createdAt === 'string' && createdAt.includes('T')) {
          const timeMatch = createdAt.match(/T(\d{2}):(\d{2}):(\d{2})/);
          if (timeMatch) {
            return formatTime(`${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]}`);
          }
        }
        // Handle space-separated format
        const parts = createdAt.split(' ');
        if (parts.length > 1) {
          return formatTime(parts[1]);
        }
        return formatTime(createdAt);
      })(),
      price: parseFloat(booking.total || booking.price || 0),
      status: mapStatus(booking.status).text,
      statusColor: mapStatus(booking.status).color,
      statusBg: mapStatus(booking.status).bg,
      emoji: '🍴',
      rawDate: booking.created_at || booking.date,
      rawStatus: booking.status,
    };
  } else if (booking.type === 'day_pass' || booking.seat_type || booking.pass_date) {
    // Day pass
    const seatType = booking.seat_type === 'dedicated' ? 'Dedicated Seat' : 'Shared Space';
    return {
      id: booking.id,
      type: 'daypass',
      title: `Day Pass - ${seatType}`,
      date: formatDate(booking.pass_date || booking.date || booking.created_at),
      time: formatTime(booking.created_at?.split(' ')[1] || ''),
      price: parseFloat(booking.price || booking.amount || 0),
      status: mapStatus(booking.status).text,
      statusColor: mapStatus(booking.status).color,
      statusBg: mapStatus(booking.status).bg,
      emoji: '🎫',
      seatType: seatType,
      rawDate: booking.pass_date || booking.date || booking.created_at,
      rawStatus: booking.status,
    };
  } else {
    // Default/unknown type
    return {
      id: booking.id,
      type: 'room',
      title: booking.title || 'Booking',
      date: formatDate(booking.date || booking.created_at),
      time: formatTimeRange(booking.start_time, booking.end_time),
      price: parseFloat(booking.price || 0),
      status: mapStatus(booking.status).text,
      statusColor: mapStatus(booking.status).color,
      statusBg: mapStatus(booking.status).bg,
      emoji: '📅',
      rawDate: booking.date || booking.created_at,
      rawStatus: booking.status,
    };
  }
};

const BookingsScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelPopupVisible, setCancelPopupVisible] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  
  // Animation values
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;
  const [isCancelling, setIsCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Refresh bookings when screen comes into focus (e.g., after rescheduling)
  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
    }, [])
  );

  // Filter bookings based on selected filter
  const filteredBookings =
    selectedFilter === 'all'
      ? bookings
      : bookings.filter(booking => {
          if (selectedFilter === 'rooms') return booking.type === 'room';
          if (selectedFilter === 'food') return booking.type === 'food';
          if (selectedFilter === 'daypasses') return booking.type === 'daypass';
          return true;
        });

  // Animate content when data is loaded
  useEffect(() => {
    if (!isLoading && !error && filteredBookings && filteredBookings.length > 0) {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when loading
      contentOpacity.setValue(0);
      contentTranslateY.setValue(20);
    }
  }, [isLoading, error, bookings.length, selectedFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch room bookings, food orders, and day passes
      const [bookingsResponse, ordersResponse, dayPassesResponse] = await Promise.all([
        bookingsService.getBookings(),
        ordersService.getOrders(),
        dayPassService.getMyPasses(),
      ]);

      let allBookings = [];

      // Process room bookings
      if (bookingsResponse.success && bookingsResponse.data) {
        let bookingsArray = [];
        
        // Check for items array (new API structure)
        if (bookingsResponse.data.items && Array.isArray(bookingsResponse.data.items)) {
          bookingsArray = bookingsResponse.data.items;
        } else if (Array.isArray(bookingsResponse.data)) {
          bookingsArray = bookingsResponse.data;
        } else if (bookingsResponse.data.bookings) {
          if (Array.isArray(bookingsResponse.data.bookings)) {
            bookingsArray = bookingsResponse.data.bookings;
          } else if (bookingsResponse.data.bookings.data && Array.isArray(bookingsResponse.data.bookings.data)) {
            bookingsArray = bookingsResponse.data.bookings.data;
          }
        }
        
        // Transform room bookings - merge top-level and nested data
        const roomBookings = bookingsArray
          .filter(item => item.type === 'booking')
          .map(item => {
            // Merge top-level properties with nested data object
            const bookingData = item.data || {};
            return {
              ...bookingData,
              ...item,
              type: 'booking',
              // Ensure room data is accessible
              room: bookingData.room || item.room,
              // Use top-level or nested date/time
              date: bookingData.date || item.date,
              start_time: bookingData.start_time || item.start_time,
              end_time: bookingData.end_time || item.end_time,
              status: item.status || bookingData.status,
              price: item.price || bookingData.price,
            };
          });
        allBookings = [...allBookings, ...roomBookings];
      }

      // Process food orders
      if (ordersResponse.success && ordersResponse.data) {
        let ordersArray = [];
        
        // Check for nested orders structure: response.data.orders.data
        if (ordersResponse.data.orders) {
          if (ordersResponse.data.orders.data && Array.isArray(ordersResponse.data.orders.data)) {
            ordersArray = ordersResponse.data.orders.data;
          } else if (Array.isArray(ordersResponse.data.orders)) {
            ordersArray = ordersResponse.data.orders;
          }
        }
        // Check for items array (if orders are in items array)
        else if (ordersResponse.data.items && Array.isArray(ordersResponse.data.items)) {
          ordersArray = ordersResponse.data.items.filter(item => item.type === 'order');
        } else if (Array.isArray(ordersResponse.data)) {
          ordersArray = ordersResponse.data;
        }
        
        // Transform food orders - each order is already an order object
        const foodOrders = ordersArray.map(order => ({
          ...order,
          type: 'order',
        }));
        allBookings = [...allBookings, ...foodOrders];
      }

      // Process day passes
      if (dayPassesResponse.success && dayPassesResponse.data) {
        let dayPassesArray = [];
        
        if (Array.isArray(dayPassesResponse.data)) {
          dayPassesArray = dayPassesResponse.data;
        } else if (dayPassesResponse.data.day_passes) {
          if (Array.isArray(dayPassesResponse.data.day_passes)) {
            dayPassesArray = dayPassesResponse.data.day_passes;
          } else if (dayPassesResponse.data.day_passes.data && Array.isArray(dayPassesResponse.data.day_passes.data)) {
            dayPassesArray = dayPassesResponse.data.day_passes.data;
          }
        } else if (dayPassesResponse.data.passes && Array.isArray(dayPassesResponse.data.passes)) {
          dayPassesArray = dayPassesResponse.data.passes;
        }
        
        // Transform day passes
        const dayPasses = dayPassesArray.map(pass => ({
          ...pass,
          type: 'day_pass',
        }));
        allBookings = [...allBookings, ...dayPasses];
      }

      // Transform all bookings
      if (allBookings.length > 0) {
        const transformedBookings = allBookings.map(transformBooking);
        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (bookingId) => {
    setBookingToCancel(bookingId);
    setCancelPopupVisible(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    setCancelPopupVisible(false);

    try {
      const response = await bookingsService.cancelBooking(bookingToCancel);

      if (response.success) {
        Alert.alert(
          'Success',
          response.message || 'Booking cancelled successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh bookings list
                fetchBookings();
                setBookingToCancel(null);
              },
            },
          ],
        );
      } else {
        Alert.alert(
          'Error',
          response.message || 'Failed to cancel booking. Please try again.',
        );
        setBookingToCancel(null);
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      Alert.alert(
        'Error',
        err.message || 'Something went wrong. Please try again.',
      );
      setBookingToCancel(null);
    } finally {
      setIsCancelling(false);
    }
  };

  const cancelCancel = () => {
    setCancelPopupVisible(false);
    setBookingToCancel(null);
  };

  const handleReschedule = async (bookingId) => {
    try {
      // Get booking details
      const response = await bookingsService.getBookingDetails(bookingId);
      
      if (response.success && response.data) {
        const booking = response.data.booking || response.data;
        
        // Navigate to RescheduleBookingScreen with booking data and refresh callback
        navigation.navigate('RescheduleBookingScreen', {
          bookingId: bookingId,
          bookingData: {
            date: booking.date,
            start_time: booking.start_time,
            end_time: booking.end_time,
          },
          onRescheduleSuccess: () => {
            // Refresh bookings list after successful reschedule
            fetchBookings();
          },
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to load booking details.');
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    }
  };

  const renderRoomBooking = item => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingContent}>
        <View style={styles.bookingHeaderRow}>
          <View style={styles.bookingIconContainer}>
            <Text style={styles.bookingIcon}>{item.emoji}</Text>
          </View>
          <View style={styles.bookingTitleSection}>
            <Text style={styles.bookingTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.bookingMetaRow}>
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>{item.date}</Text>
              </View>
              {item.time ? (
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{item.time}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.bookingPriceSection}>
            <Text style={styles.bookingPrice}>PKR {item.price}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
              <Text style={[styles.statusText, { color: item.statusColor }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {(item.status === 'Upcoming' || item.status === 'Confirmed') && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancel(item.id)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rescheduleButton}
              onPress={() => handleReschedule(item.id)}>
              <Text style={styles.rescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderFoodBooking = item => (
    <View style={styles.foodBookingCard}>
      <View style={styles.bookingHeader}>
        <View style={[styles.bookingIconContainer, { backgroundColor: colors.statusPendingBg }]}>
          <Text style={styles.bookingIcon}>{item.emoji}</Text>
        </View>
        <View style={styles.foodBookingInfo}>
          <Text style={styles.bookingTitle}>{item.title}</Text>
          {item.items?.map((orderItem, index) => (
            <Text key={index} style={styles.orderItem}>
              • {orderItem}
            </Text>
          ))}
        </View>
        <View style={styles.foodPriceStatus}>
          <Text style={styles.bookingPrice}>PKR {item.price}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
            <Text style={[styles.statusText, { color: item.statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.foodBookingFooter}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>🕐</Text>
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
      </View>
    </View>
  );

  const renderDayPassBooking = item => (
    <View style={styles.foodBookingCard}>
      <View style={styles.bookingHeader}>
        <View style={[styles.bookingIconContainer, { backgroundColor: colors.statusUpcomingBg }]}>
          <Text style={styles.bookingIcon}>{item.emoji}</Text>
        </View>
        <View style={styles.foodBookingInfo}>
          <Text style={styles.bookingTitle}>{item.title}</Text>
          {item.seatType && (
            <Text style={styles.orderItem}>
              • {item.seatType}
            </Text>
          )}
        </View>
        <View style={styles.foodPriceStatus}>
          <Text style={styles.bookingPrice}>PKR {item.price}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
            <Text style={[styles.statusText, { color: item.statusColor }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.foodBookingFooter}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        {item.time && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>🕐</Text>
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="My Bookings"
        subtitle="View all your history"
        showBackButton={false}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.filterTab,
              selectedFilter === tab.id && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(tab.id)}>
            {tab.icon && <Text style={styles.filterIcon}>{tab.icon}</Text>}
            <Text
              style={[
                styles.filterText,
                selectedFilter === tab.id && styles.filterTextActive,
              ]}>
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.bookingsList}
        contentContainerStyle={styles.bookingsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Loader size="large" color={colors.primary} variant="morphing" />
            <Text style={styles.loadingText}>Loading your bookings...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchBookings}
              activeOpacity={0.8}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredBookings.length > 0 ? (
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            }}
          >
            {filteredBookings.map(item => {
              // Create unique key by combining type and id to avoid duplicate keys
              const uniqueKey = `${item.type}-${item.id}`;
              if (item.type === 'room') {
                return <View key={uniqueKey}>{renderRoomBooking(item)}</View>;
              } else if (item.type === 'food') {
                return <View key={uniqueKey}>{renderFoodBooking(item)}</View>;
              } else if (item.type === 'daypass') {
                return <View key={uniqueKey}>{renderDayPassBooking(item)}</View>;
              }
              return null;
            })}
          </Animated.View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        )}
      </ScrollView>

      {/* Cancel Confirmation Popup */}
      <ConfirmationPopup
        visible={cancelPopupVisible}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        icon="⚠️"
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        confirmColor="danger"
        onConfirm={confirmCancel}
        onCancel={cancelCancel}
      />

      {/* Loading overlay for cancellation */}
      {isCancelling && (
        <View style={styles.loadingOverlay}>
          <Loader size="large" color={colors.primary} variant="gradient-spinner" />
          <Text style={styles.loadingOverlayText}>Cancelling booking...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  filterTextActive: {
    color: colors.white,
  },
  bookingsList: {
    flex: 1,
  },
  bookingsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  bookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  roomImageContainer: {
    height: 150,
    backgroundColor: colors.borderLight,
  },
  roomImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.statusUpcomingBg,
  },
  roomImageEmoji: {
    fontSize: 48,
  },
  bookingContent: {
    padding: 16,
  },
  bookingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bookingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.statusUpcomingBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookingIcon: {
    fontSize: 18,
  },
  bookingTitleSection: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bookingPriceSection: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  bookingMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 6,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.surfaceLight,
  },
  metaPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailRowWithStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  rescheduleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  foodBookingCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  foodBookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  orderItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  foodPriceStatus: {
    alignItems: 'flex-end',
  },
  foodBookingFooter: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 20,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
});

export default BookingsScreen;
