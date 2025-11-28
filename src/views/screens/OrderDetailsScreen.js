import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const OrderDetailsScreen = ({ navigation, route }) => {
  const item = route?.params?.item || {
    id: '1',
    name: 'Cappuccino',
    description: 'Rich espresso with steamed milk',
    price: 80,
    category: 'beverages',
    emoji: '☕',
    bgColor: '#FFF3E8',
  };

  const [quantity, setQuantity] = useState(1);

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const totalPrice = item.price * quantity;

  const handleAddToCart = () => {
    const orderData = {
      item,
      quantity,
      totalPrice,
    };
    console.log('Added to cart:', orderData);
    // TODO: Add to cart state/redux
    navigation.goBack();
  };

  const getCategoryColor = category => {
    switch (category) {
      case 'beverages':
        return { bg: '#FFF3E8', text: '#F5842C' };
      case 'snacks':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'meals':
        return { bg: '#ECFDF5', text: '#059669' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const categoryColors = getCategoryColor(item.category);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Item Card */}
        <View style={styles.itemCard}>
          {/* Item Image */}
          <View style={[styles.itemImageContainer, { backgroundColor: item.bgColor }]}>
            <Text style={styles.itemEmoji}>{item.emoji}</Text>
          </View>

          {/* Item Details */}
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>

          <View style={styles.categoryPriceRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryColors.bg },
              ]}>
              <Text style={[styles.categoryText, { color: categoryColors.text }]}>
                {item.category}
              </Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </View>
        </View>

        {/* Quantity Card */}
        <View style={styles.quantityCard}>
          <Text style={styles.quantityTitle}>Quantity</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[
                styles.quantityButton,
                quantity <= 1 && styles.quantityButtonDisabled,
              ]}
              onPress={decrementQuantity}
              disabled={quantity <= 1}>
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, styles.quantityButtonPlus]}
              onPress={incrementQuantity}>
              <Text style={[styles.quantityButtonText, styles.plusText]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {item.name} × {quantity}
            </Text>
            <Text style={styles.summaryValue}>₹{item.price * quantity}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{totalPrice}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          activeOpacity={0.9}>
          <LinearGradient
            colors={['#F5842C', '#E85D04']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addToCartGradient}>
            <Text style={styles.addToCartText}>Add to Cart - ₹{totalPrice}</Text>
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
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  itemImageContainer: {
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  itemEmoji: {
    fontSize: 80,
  },
  itemName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 16,
  },
  categoryPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F5842C',
  },
  quantityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quantityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonPlus: {
    backgroundColor: '#F5842C',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#374151',
  },
  plusText: {
    color: '#FFFFFF',
  },
  quantityValue: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1F2937',
    marginHorizontal: 50,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 17,
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
  addToCartButton: {
    width: '100%',
  },
  addToCartGradient: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OrderDetailsScreen;

