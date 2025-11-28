import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import { bookingsService } from '../../services/api';

const { width } = Dimensions.get('window');

const filterTabs = [
  { id: 'all', title: 'All' },
  { id: 'rooms', title: 'Rooms', icon: '🚪' },
  { id: 'food', title: 'Food', icon: '🍴' },
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
  if (statusLower === 'confirmed' || statusLower === 'upcoming') {
    return {
      text: 'Upcoming',
      color: '#4A7CFF',
      bg: '#EEF2FF',
    };
  } else if (statusLower === 'completed' || statusLower === 'finished') {
    return {
      text: 'Completed',
      color: '#22C55E',
      bg: '#ECFDF5',
    };
  } else if (statusLower === 'cancelled' || statusLower === 'canceled') {
    return {
      text: 'Cancelled',
      color: '#EF4444',
      bg: '#FEE2E2',
    };
  } else {
    return {
      text: status || 'Pending',
      color: '#6B7280',
      bg: '#F3F4F6',
    };
  }
};

// Helper function to transform booking data
const transformBooking = (booking) => {
  if (booking.type === 'booking' || booking.room) {
    // Room booking
    return {
      id: booking.id,
      type: 'room',
      title: booking.room?.name || booking.title || 'Room Booking',
      date: formatDate(booking.date),
      time: formatTimeRange(booking.start_time, booking.end_time),
      price: parseFloat(booking.price || 0),
      status: mapStatus(booking.status).text,
      statusColor: mapStatus(booking.status).color,
      statusBg: mapStatus(booking.status).bg,
      emoji: '🚪',
      hasImage: true,
      rawDate: booking.date,
      rawStatus: booking.status,
    };
  } else if (booking.type === 'order' || booking.items) {
    // Food order
    const items = booking.items || [];
    const itemNames = items.map(item => 
      `${item.name || 'Item'} x${item.quantity || 1}`
    );
    return {
      id: booking.id,
      type: 'food',
      title: itemNames.length > 0 
        ? itemNames.slice(0, 2).join(' & ')
        : 'Food Order',
      items: itemNames,
      date: formatDate(booking.created_at || booking.date),
      time: formatTime(booking.created_at?.split(' ')[1] || booking.start_time || ''),
      price: parseFloat(booking.total || booking.price || 0),
      status: mapStatus(booking.status).text,
      statusColor: mapStatus(booking.status).color,
      statusBg: mapStatus(booking.status).bg,
      emoji: '🍴',
      rawDate: booking.created_at || booking.date,
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await bookingsService.getBookings();
      
      if (response.success && response.data) {
        // Handle paginated response: response.data.bookings.data
        let bookingsArray = [];
        
        if (Array.isArray(response.data)) {
          // Direct array response
          bookingsArray = response.data;
        } else if (response.data.bookings) {
          // Paginated response: response.data.bookings.data
          if (Array.isArray(response.data.bookings)) {
            bookingsArray = response.data.bookings;
          } else if (response.data.bookings.data && Array.isArray(response.data.bookings.data)) {
            bookingsArray = response.data.bookings.data;
          }
        }
        
        if (Array.isArray(bookingsArray)) {
          const transformedBookings = bookingsArray.map(transformBooking);
          setBookings(transformedBookings);
        } else {
          setBookings([]);
        }
      } else {
        setError(response.message || 'Failed to load bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookings =
    selectedFilter === 'all'
      ? bookings
      : bookings.filter(item => {
          if (selectedFilter === 'rooms') return item.type === 'room';
          if (selectedFilter === 'food') return item.type === 'food';
          return true;
        });

  const handleCancel = bookingId => {
    console.log('Cancel booking:', bookingId);
    // TODO: Implement cancel
  };

  const handleReschedule = bookingId => {
    console.log('Reschedule booking:', bookingId);
    // TODO: Implement reschedule
  };

  const renderRoomBooking = item => (
    <View style={styles.bookingCard} key={item.id}>
      {/* Room Image Placeholder */}
      <View style={styles.roomImageContainer}>
        <View style={styles.roomImagePlaceholder}>
          <Text style={styles.roomImageEmoji}>🏢</Text>
        </View>
      </View>

      <View style={styles.bookingContent}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingIconContainer}>
            <Text style={styles.bookingIcon}>{item.emoji}</Text>
          </View>
          <View style={styles.bookingTitleContainer}>
            <Text style={styles.bookingTitle}>{item.title}</Text>
          </View>
          <Text style={styles.bookingPrice}>₹{item.price}</Text>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          <View style={styles.detailRowWithStatus}>
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🕐</Text>
              <Text style={styles.detailText}>{item.time}</Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: item.statusBg }]}>
              <Text style={[styles.statusText, { color: item.statusColor }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </View>

        {item.status === 'Upcoming' && (
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
    <View style={styles.foodBookingCard} key={item.id}>
      <View style={styles.bookingHeader}>
        <View style={[styles.bookingIconContainer, { backgroundColor: '#FFF3E8' }]}>
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
          <Text style={styles.bookingPrice}>₹{item.price}</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="My Bookings"
        subtitle="View all your history"
        onBackPress={() => navigation.goBack()}
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
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A7CFF" />
            <Text style={styles.loadingText}>Loading bookings...</Text>
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
          filteredBookings.map(item =>
            item.type === 'room'
              ? renderRoomBooking(item)
              : renderFoodBooking(item),
          )
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#4A7CFF',
    borderColor: '#4A7CFF',
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  bookingsList: {
    flex: 1,
  },
  bookingsContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  roomImageContainer: {
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  roomImagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF',
  },
  roomImageEmoji: {
    fontSize: 48,
  },
  bookingContent: {
    padding: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bookingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bookingIcon: {
    fontSize: 18,
  },
  bookingTitleContainer: {
    flex: 1,
  },
  bookingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  bookingDetails: {
    marginTop: 12,
    marginLeft: 52,
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
    color: '#6B7280',
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#4A7CFF',
    alignItems: 'center',
  },
  rescheduleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  foodBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
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
    color: '#6B7280',
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
    borderTopColor: '#F3F4F6',
    gap: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4A7CFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default BookingsScreen;
