import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AppBar from '../components/AppBar';
import Loader from '../components/Loader';
import ConfirmationPopup from '../components/ConfirmationPopup';
import { ordersService } from '../../services/api';
import colors from '../../constants/colors';

const CartScreen = ({ navigation, route }) => {
  const initialCartItems = route?.params?.cartItems || [];
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Update cart items when route params change
  useEffect(() => {
    if (route?.params?.cartItems) {
      setCartItems(route.params.cartItems);
    }
  }, [route?.params?.cartItems]);

  // Calculate totals
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const gstPercentage = 5;
  const gstAmount = Math.round((itemTotal * gstPercentage) / 100);
  const totalAmount = itemTotal + gstAmount;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('Please add items to your cart before placing an order.');
      return;
    }

    if (!deliveryLocation || !deliveryLocation.trim()) {
      setError('Please enter a delivery location before placing your order.');
      return;
    }

    setIsPlacingOrder(true);
    setError('');

    try {
      // Prepare order data according to API format
      const orderData = {
        items: cartItems.map(item => ({
          food_item_id: item.food_item_id || parseInt(item.id),
          quantity: item.quantity,
        })),
        ...(deliveryLocation.trim() && { delivery_location: deliveryLocation.trim() }),
        ...(specialInstructions.trim() && { notes: specialInstructions.trim() }),
        // payment_method: 'wallet', // You can add payment method selection
      };

      const response = await ordersService.createOrder(orderData);

      if (response.success) {
        setShowSuccessPopup(true);
      } else {
        setError(response.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = cartItems.filter(item => 
      item.id !== itemId && item.food_item_id !== itemId
    );
    setCartItems(updatedItems);
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    const updatedItems = cartItems.map(item =>
      (item.id === itemId || item.food_item_id === itemId)
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCartItems(updatedItems);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Cart"
        onBackPress={() => {
          // Pass updated cart items back to FoodScreen when going back
          navigation.navigate('MainTabs', {
            screen: 'Food',
            params: { cartItems: cartItems },
          });
        }}
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
            </View>
          ) : (
            cartItems.map((item, index) => (
              <View key={item.id || index} style={styles.orderItem}>
                <View style={styles.orderItemLeft}>
                  <Text style={styles.orderItemEmoji}>{item.emoji || '🍽️'}</Text>
                  <View style={styles.orderItemInfo}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.id || item.food_item_id, item.quantity - 1)}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleUpdateQuantity(item.id || item.food_item_id, item.quantity + 1)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.orderItemRight}>
                  <Text style={styles.orderItemPrice}>
                    PKR {item.price * item.quantity}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(item.id || item.food_item_id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Delivery Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Location</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Desk 42, Floor 2"
              placeholderTextColor="#9CA3AF"
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
            />
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Special Instructions (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any special requests..."
            placeholderTextColor="#9CA3AF"
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{specialInstructions.length}/500</Text>
        </View>

        {/* Price Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Item Total ({cartItems.length} × PKR {itemTotal / (cartItems[0]?.quantity || 1)})
            </Text>
            <Text style={styles.priceValue}>PKR {itemTotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GST ({gstPercentage}%)</Text>
            <Text style={styles.priceValue}>PKR {gstAmount}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>PKR {totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      {cartItems.length > 0 && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            activeOpacity={0.9}
            disabled={isPlacingOrder}>
            <LinearGradient
              colors={colors.secondaryGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.placeOrderGradient}>
              {isPlacingOrder ? (
                <Loader size="small" color={colors.white} variant="gradient-spinner" />
              ) : (
                <Text style={styles.placeOrderText}>Place Order - PKR {totalAmount}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Order Success Popup */}
      <ConfirmationPopup
        visible={showSuccessPopup}
        icon="✅"
        title="Order Placed!"
        message="Your order has been placed successfully."
        confirmText="OK"
        confirmColor="primary"
        showCancel={false}
        onConfirm={() => {
          setShowSuccessPopup(false);
          navigation.navigate('MainTabs', { screen: 'Bookings' });
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderItemEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 24,
    textAlign: 'center',
  },
  orderItemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
  },
  emptyCartContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
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
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F5842C',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  placeOrderButton: {
    width: '100%',
  },
  placeOrderGradient: {
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: 'center',
  },
  placeOrderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CartScreen;

