import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AppBar from '../components/AppBar';
import Loader from '../components/Loader';
import Icon from '../components/ImageComponent/IconComponent';
import colors from '../../constants/colors';
import { dayPassService } from '../../services/api';
import { useAppSelector } from '../../redux/hooks';

const seatTypes = [
  { id: 'shared', label: 'Shared Space', price: 500 },
  { id: 'dedicated', label: 'Dedicated Seat', price: 1000 },
];

const CreateDayPassScreen = ({ navigation }) => {
  const user = useAppSelector(state => state.auth.user);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSeatType, setSelectedSeatType] = useState('dedicated');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('invoice');

  // Get wallet balance from user profile (Redux state)
  const walletBalance = user?.wallet_balance ? parseFloat(user.wallet_balance) : null;

  // Helper function to format date to YYYY-MM-DD
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setShowDatePicker(false);
    setError('');
  };

  const handlePurchase = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    if (!selectedSeatType) {
      setError('Please select a seat type');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const dateFormatted = formatDateForAPI(selectedDate);
      const response = await dayPassService.purchaseDayPass(
        dateFormatted,
        selectedPaymentMethod,
        selectedSeatType,
      );

      if (response.success) {
        Alert.alert(
          'Success',
          response.message || 'Day pass created successfully!',
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
        setError(response.message || 'Failed to create day pass. Please try again.');
      }
    } catch (err) {
      console.error('Error creating day pass:', err);
      const errorMessage =
        err.data?.message || err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedSeatPrice = () => {
    const seat = seatTypes.find(s => s.id === selectedSeatType);
    return seat ? seat.price : 0;
  };

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
        title="Create Day Pass"
        onBackPress={() => navigation.goBack()}
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Create Day Pass</Text>
          <Text style={styles.subtitle}>Get access for a day</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Pass Details Card */}
        <View style={styles.passDetailsCard}>
          <Text style={styles.passDetailsTitle}>Pass Details</Text>

          {/* Date Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateInputContainer}
              onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={styles.dateInput}
                value={selectedDate ? formatDate(selectedDate) : ''}
                placeholder="Select Date"
                placeholderTextColor={colors.textMuted}
                editable={false}
              />
              <Icon
                name="calendar"
                size={20}
                color={colors.textSecondary}
                type="fontAwesome"
              />
            </TouchableOpacity>
          </View>

          {/* Seat Type Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Seat Type</Text>
            {seatTypes.map((seat) => (
              <TouchableOpacity
                key={seat.id}
                style={styles.radioOption}
                onPress={() => setSelectedSeatType(seat.id)}>
                <View style={styles.radioButton}>
                  {selectedSeatType === seat.id && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.radioLabel}>
                  {seat.label} - PKR {seat.price.toLocaleString('en-IN')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Method Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Payment Method</Text>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setSelectedPaymentMethod('invoice')}>
              <View style={styles.radioButton}>
                {selectedPaymentMethod === 'invoice' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Add to Monthly Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setSelectedPaymentMethod('cash')}>
              <View style={styles.radioButton}>
                {selectedPaymentMethod === 'cash' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>Cash Payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setSelectedPaymentMethod('wallet')}>
              <View style={styles.radioButton}>
                {selectedPaymentMethod === 'wallet' && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>
                Wallet
                {walletBalance !== null && (
                  <Text style={styles.walletBalance}>
                    {' '}(Balance: PKR {walletBalance.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })})
                  </Text>
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={handlePurchase}
          disabled={isLoading || !selectedDate}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.purchaseGradient}>
            {isLoading ? (
              <Loader size="small" color="#FFFFFF" variant="gradient-spinner" />
            ) : (
              <Text style={styles.purchaseText}>Create Day Pass</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={handleDateSelect}
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
  headerSection: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  passDetailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  passDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },
  walletBalance: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
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
  paymentMethodsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  paymentMethodCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  paymentMethodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.statusUpcomingBg,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  paymentMethodTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  purchaseButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  purchaseGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseText: {
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

export default CreateDayPassScreen;

