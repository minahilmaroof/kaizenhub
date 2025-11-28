import React, { useState } from 'react';
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

const CartScreen = ({ navigation, route }) => {
  const cartItems = route?.params?.cartItems || [
    {
      id: '1',
      name: 'Cappuccino',
      price: 80,
      quantity: 1,
      emoji: '☕',
    },
  ];

  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Calculate totals
  const itemTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const gstPercentage = 5;
  const gstAmount = Math.round((itemTotal * gstPercentage) / 100);
  const totalAmount = itemTotal + gstAmount;

  const handlePlaceOrder = () => {
    const orderData = {
      items: cartItems,
      deliveryLocation,
      specialInstructions,
      itemTotal,
      gstAmount,
      totalAmount,
    };
    console.log('Order placed:', orderData);
    // TODO: Process order
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {cartItems.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={styles.orderItemEmoji}>{item.emoji}</Text>
                <View>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                </View>
              </View>
              <Text style={styles.orderItemPrice}>
                ₹{item.price * item.quantity}
              </Text>
            </View>
          ))}
        </View>

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
              Item Total ({cartItems.length} × ₹{itemTotal / (cartItems[0]?.quantity || 1)})
            </Text>
            <Text style={styles.priceValue}>₹{itemTotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GST ({gstPercentage}%)</Text>
            <Text style={styles.priceValue}>₹{gstAmount}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          activeOpacity={0.9}>
          <LinearGradient
            colors={['#F5842C', '#E85D04']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.placeOrderGradient}>
            <Text style={styles.placeOrderText}>Place Order - ₹{totalAmount}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  },
  orderItemEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderItemQty: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
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

