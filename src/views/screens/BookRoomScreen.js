import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { bookingsService } from '../../services/api';

const timeSlots = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
];

const BookRoomScreen = ({ navigation, route }) => {
  const room = route?.params?.room || {
    id: '1',
    name: 'Conference Room A',
    capacity: 15,
    price: 500,
    fullDayPrice: 3500,
    amenities: ['TV', 'HDMI', 'AC', 'Whiteboard', 'WiFi'],
    emoji: '🏢',
    bgColor: '#E0E7FF',
  };

  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendees, setAttendees] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const incrementAttendees = () => {
    if (attendees < room.capacity) {
      setAttendees(attendees + 1);
    }
  };

  const decrementAttendees = () => {
    if (attendees > 1) {
      setAttendees(attendees - 1);
    }
  };

  // Helper function to convert 12-hour time to 24-hour format (HH:MM)
  const convertTo24Hour = (time12h) => {
    if (!time12h) return '';
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  // Helper function to format date to YYYY-MM-DD
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const validateBooking = () => {
    if (!selectedDate) {
      setError('Please select a date');
      return false;
    }
    if (!startTime) {
      setError('Please select a start time');
      return false;
    }
    if (!endTime) {
      setError('Please select an end time');
      return false;
    }
    if (!purpose.trim()) {
      setError('Please enter the purpose of booking');
      return false;
    }
    // Validate end time is after start time
    const start24 = convertTo24Hour(startTime);
    const end24 = convertTo24Hour(endTime);
    if (start24 >= end24) {
      setError('End time must be after start time');
      return false;
    }
    return true;
  };

  const handleConfirmBooking = async () => {
    setError('');
    
    if (!validateBooking()) {
      return;
    }

    setIsLoading(true);

    try {
      const bookingData = {
        room_id: room.id,
        date: formatDateForAPI(selectedDate),
        start_time: convertTo24Hour(startTime),
        end_time: convertTo24Hour(endTime),
        purpose: purpose.trim(),
        number_of_attendees: attendees,
      };

      console.log('Creating booking with data:', bookingData);

      const response = await bookingsService.createBooking(bookingData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Room booked successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack();
              },
            },
          ],
        );
      } else {
        setError(response.message || 'Failed to create booking. Please try again.');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      const errorMessage =
        err.data?.message || err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = date => {
    if (!date) return 'dd/mm/yyyy';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const TimePickerModal = ({ visible, onClose, onSelect, title }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.timeList}>
            {timeSlots.map(time => (
              <TouchableOpacity
                key={time}
                style={styles.timeOption}
                onPress={() => {
                  onSelect(time);
                  onClose();
                }}>
                <Text style={styles.timeOptionText}>{time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const DatePickerModal = ({ visible, onClose, onSelect }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date</Text>
          <ScrollView style={styles.dateList}>
            {generateDates().map((date, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dateOption}
                onPress={() => {
                  onSelect(date.toISOString());
                  onClose();
                }}>
                <Text style={styles.dateOptionText}>
                  {date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Room</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Room Image */}
        <View style={[styles.roomImageContainer, { backgroundColor: room.bgColor }]}>
          <Text style={styles.roomEmoji}>{room.emoji}</Text>
        </View>

        {/* Room Info */}
        <View style={styles.roomInfoCard}>
          <Text style={styles.roomName}>{room.name}</Text>
          <View style={styles.capacityRow}>
            <Text style={styles.capacityIcon}>👥</Text>
            <Text style={styles.capacityText}>Up to {room.capacity} people</Text>
          </View>

          {/* Amenities */}
          <View style={styles.amenitiesContainer}>
            {room.amenities.map((amenity, index) => (
              <View key={index} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <View style={styles.priceItem}>
              <Text style={styles.priceValue}>₹{room.price}</Text>
              <Text style={styles.priceLabel}>per hour</Text>
            </View>
            <View style={styles.priceDivider} />
            <View style={styles.priceItem}>
              <Text style={[styles.priceValue, { color: '#22C55E' }]}>
                ₹{room.fullDayPrice || room.price * 7}
              </Text>
              <Text style={styles.priceLabel}>full day</Text>
            </View>
          </View>
        </View>

        {/* Select Date */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateIcon}>📅</Text>
            <Text
              style={[
                styles.dateText,
                !selectedDate && styles.placeholderText,
              ]}>
              {formatDate(selectedDate)}
            </Text>
            <Text style={styles.calendarIcon}>📆</Text>
          </TouchableOpacity>
        </View>

        {/* Select Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Time</Text>
          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>Start Time</Text>
              <TouchableOpacity
                style={styles.timeSelect}
                onPress={() => setShowStartTimePicker(true)}>
                <Text
                  style={[
                    styles.timeSelectText,
                    !startTime && styles.placeholderText,
                  ]}>
                  {startTime || 'Select'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>End Time</Text>
              <TouchableOpacity
                style={styles.timeSelect}
                onPress={() => setShowEndTimePicker(true)}>
                <Text
                  style={[
                    styles.timeSelectText,
                    !endTime && styles.placeholderText,
                  ]}>
                  {endTime || 'Select'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Number of Attendees */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Number of Attendees</Text>
          <View style={styles.attendeesRow}>
            <TouchableOpacity
              style={[
                styles.attendeeButton,
                attendees <= 1 && styles.attendeeButtonDisabled,
              ]}
              onPress={decrementAttendees}
              disabled={attendees <= 1}>
              <Text style={styles.attendeeButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.attendeesCount}>{attendees}</Text>
            <TouchableOpacity
              style={[
                styles.attendeeButton,
                styles.attendeeButtonPlus,
                attendees >= room.capacity && styles.attendeeButtonDisabled,
              ]}
              onPress={incrementAttendees}
              disabled={attendees >= room.capacity}>
              <Text style={[styles.attendeeButtonText, styles.plusText]}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.maxCapacity}>
            Maximum capacity: {room.capacity} people
          </Text>
        </View>

        {/* Purpose of Booking */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Purpose of Booking</Text>
          <TextInput
            style={styles.purposeInput}
            placeholder="e.g., Team meeting, Client presentation..."
            placeholderTextColor="#9CA3AF"
            value={purpose}
            onChangeText={text => {
              setPurpose(text);
              setError('');
            }}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{purpose.length}/500</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          activeOpacity={0.9}
          disabled={isLoading}>
          <LinearGradient
            colors={['#4A7CFF', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmGradient}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmText}>Confirm Booking</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Time Picker Modals */}
      <TimePickerModal
        visible={showStartTimePicker}
        onClose={() => setShowStartTimePicker(false)}
        onSelect={time => {
          setStartTime(time);
          setError('');
        }}
        title="Select Start Time"
      />
      <TimePickerModal
        visible={showEndTimePicker}
        onClose={() => setShowEndTimePicker(false)}
        onSelect={time => {
          setEndTime(time);
          setError('');
        }}
        title="Select End Time"
      />
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={date => {
          setSelectedDate(date);
          setError('');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  roomImageContainer: {
    height: 200,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  roomEmoji: {
    fontSize: 80,
  },
  roomInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  roomName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  capacityIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  capacityText: {
    fontSize: 15,
    color: '#6B7280',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  amenityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A7CFF',
  },
  amenityText: {
    fontSize: 13,
    color: '#4A7CFF',
    fontWeight: '500',
  },
  pricingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceItem: {
    flex: 1,
  },
  priceValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4A7CFF',
  },
  priceLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  priceDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dateIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  calendarIcon: {
    fontSize: 18,
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  timeSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  timeSelectText: {
    fontSize: 16,
    color: '#1F2937',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#6B7280',
  },
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  attendeeButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeButtonPlus: {
    backgroundColor: '#4A7CFF',
  },
  attendeeButtonDisabled: {
    opacity: 0.5,
  },
  attendeeButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
  },
  plusText: {
    color: '#FFFFFF',
  },
  attendeesCount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 40,
  },
  maxCapacity: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  purposeInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 8,
  },
  confirmButton: {
    marginTop: 8,
  },
  confirmGradient: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  timeList: {
    maxHeight: 300,
  },
  dateList: {
    maxHeight: 300,
  },
  timeOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  dateOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
  },
  modalCloseButton: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
});

export default BookRoomScreen;

