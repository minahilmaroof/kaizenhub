import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AppBar from '../components/AppBar';
import Loader from '../components/Loader';
import colors from '../../constants/colors';
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

const RescheduleBookingScreen = ({ navigation, route }) => {
  const bookingId = route?.params?.bookingId;
  const bookingData = route?.params?.bookingData || {};
  const onRescheduleSuccess = route?.params?.onRescheduleSuccess;

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

  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validateTimes = (start, end) => {
    if (!start || !end) return true; // Allow if either is not set yet
    const start24 = convertTo24Hour(start);
    const end24 = convertTo24Hour(end);
    return start24 < end24;
  };

  const validateReschedule = () => {
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
    // Validate end time is after start time
    if (!validateTimes(startTime, endTime)) {
      setError('Start time must be before end time');
      return false;
    }
    return true;
  };

  const handleReschedule = async () => {
    setError('');

    if (!validateReschedule()) {
      return;
    }

    setIsLoading(true);

    try {
      const rescheduleData = {
        date: formatDateForAPI(selectedDate),
        start_time: convertTo24Hour(startTime),
        end_time: convertTo24Hour(endTime),
      };

      console.log('Rescheduling booking with data:', rescheduleData);

      const response = await bookingsService.rescheduleBooking(bookingId, rescheduleData);

      if (response.success) {
        // Call the refresh callback if provided
        if (onRescheduleSuccess) {
          onRescheduleSuccess();
        }
        
        Alert.alert(
          'Success',
          response.message || 'Booking rescheduled successfully!',
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
        setError(response.message || 'Failed to reschedule booking. Please try again.');
      }
    } catch (err) {
      console.error('Error rescheduling booking:', err);
      const errorMessage =
        err.data?.message || err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Select Date';
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

  const TimePickerModal = ({ visible, onClose, onSelect, title, selectedTime }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <ScrollView style={styles.timeSlotList}>
            {timeSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  selectedTime === slot && styles.timeSlotSelected,
                ]}
                onPress={() => {
                  onSelect(slot);
                  onClose();
                }}>
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === slot && styles.timeSlotTextSelected,
                  ]}>
                  {slot}
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

  const DatePickerModal = ({ visible, onClose, onSelect, selectedDate }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date</Text>
          <ScrollView style={styles.dateList}>
            {generateDates().map((date, index) => {
              const dateStr = date.toISOString();
              const isSelected = selectedDate === dateStr;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dateSlot, isSelected && styles.dateSlotSelected]}
                  onPress={() => {
                    onSelect(dateStr);
                    onClose();
                  }}>
                  <Text
                    style={[
                      styles.dateSlotText,
                      isSelected && styles.dateSlotTextSelected,
                    ]}>
                    {formatDate(dateStr)}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
      <AppBar
        title="Reschedule Booking"
        onBackPress={() => navigation.goBack()}
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Current Booking Info */}
        {bookingData.date && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Current Booking</Text>
            <Text style={styles.infoText}>
              Date: {new Date(bookingData.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.infoText}>
              Time: {bookingData.start_time} - {bookingData.end_time}
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Date Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select New Date</Text>
          <TouchableOpacity
            style={styles.dateSelect}
            onPress={() => setShowDatePicker(true)}>
            <Text
              style={[
                styles.dateSelectText,
                !selectedDate && styles.placeholderText,
              ]}>
              {formatDate(selectedDate)}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Time Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select New Time</Text>
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

        {/* Reschedule Button */}
        <TouchableOpacity
          style={styles.rescheduleButton}
          onPress={handleReschedule}
          disabled={isLoading}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rescheduleGradient}>
            {isLoading ? (
              <Loader size="small" color="#FFFFFF" variant="gradient-spinner" />
            ) : (
              <Text style={styles.rescheduleText}>Reschedule Booking</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Time Pickers */}
      <TimePickerModal
        visible={showStartTimePicker}
        onClose={() => setShowStartTimePicker(false)}
        onSelect={time => {
          setStartTime(time);
          // Validate if end time is already selected
          if (endTime && !validateTimes(time, endTime)) {
            setError('Start time must be before end time');
          } else {
            setError('');
          }
        }}
        title="Select Start Time"
        selectedTime={startTime}
      />
      <TimePickerModal
        visible={showEndTimePicker}
        onClose={() => setShowEndTimePicker(false)}
        onSelect={time => {
          setEndTime(time);
          // Validate if start time is already selected
          if (startTime && !validateTimes(startTime, time)) {
            setError('Start time must be before end time');
          } else {
            setError('');
          }
        }}
        title="Select End Time"
        selectedTime={endTime}
      />

      {/* Date Picker */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={setSelectedDate}
        selectedDate={selectedDate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: colors.statusUpcomingBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: colors.statusFailedBg,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dateSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateSelectText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  dropdownIcon: {
    fontSize: 12,
    color: colors.textMuted,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  timeSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeSelectText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  rescheduleButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  rescheduleGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  timeSlotList: {
    maxHeight: 400,
  },
  timeSlot: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  timeSlotSelected: {
    backgroundColor: colors.statusUpcomingBg,
  },
  timeSlotText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  timeSlotTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  dateList: {
    maxHeight: 400,
  },
  dateSlot: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateSlotSelected: {
    backgroundColor: colors.statusUpcomingBg,
  },
  dateSlotText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  dateSlotTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default RescheduleBookingScreen;

