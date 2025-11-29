import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AppBar from '../components/AppBar';
import Loader from '../components/Loader';
import { foodService } from '../../services/api';
import colors from '../../constants/colors';

const getCategoryColor = category => {
  switch (category) {
    case 'beverages':
      return { bg: '#FFF3E8', text: '#F5842C', emoji: '☕' };
    case 'snacks':
      return { bg: '#FEF3C7', text: '#D97706', emoji: '🍪' };
    case 'meals':
      return { bg: '#ECFDF5', text: '#059669', emoji: '🍱' };
    default:
      return { bg: '#F3F4F6', text: '#6B7280', emoji: '🍽️' };
  }
};

const OrderDetailsScreen = ({ navigation, route }) => {
  const itemId = route?.params?.itemId;
  const initialItem = route?.params?.item;
  
  const [item, setItem] = useState(initialItem || {
    id: '1',
    name: 'Loading...',
    description: '',
    price: 0,
    category: 'beverages',
    emoji: '☕',
    bgColor: '#FFF3E8',
  });
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(!!itemId);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (itemId) {
      fetchFoodItemDetails();
    }
  }, [itemId]);

  const fetchFoodItemDetails = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await foodService.getFoodItemDetails(itemId);
      if (response.success && response.data) {
        const foodItem = response.data;
        const categoryStyle = getCategoryColor(foodItem.type || foodItem.category);
        setItem({
          id: foodItem.id?.toString(),
          name: foodItem.name || 'Food Item',
          description: foodItem.description || '',
          price: parseFloat(foodItem.price || 0),
          category: foodItem.type || foodItem.category || 'meals',
          emoji: categoryStyle.emoji,
          bgColor: categoryStyle.bg,
          ...foodItem, // Keep original data
        });
      } else {
        setError(response.message || 'Failed to load item details');
      }
    } catch (err) {
      console.error('Error fetching food item details:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
    // Get existing cart items from route params or use empty array
    const existingCartItems = route?.params?.cartItems || [];
    
    // Check if item already exists in cart
    const existingItemIndex = existingCartItems.findIndex(
      cartItem => cartItem.id === item.id || cartItem.food_item_id === item.id
    );

    let updatedCartItems;
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      updatedCartItems = [...existingCartItems];
      updatedCartItems[existingItemIndex] = {
        ...updatedCartItems[existingItemIndex],
        quantity: updatedCartItems[existingItemIndex].quantity + quantity,
      };
    } else {
      // Add new item to cart
      const cartItem = {
        id: item.id,
        food_item_id: parseInt(item.id) || item.food_item_id || item.id,
        name: item.name,
        price: item.price,
        quantity: quantity,
        emoji: item.emoji,
        description: item.description,
        category: item.category,
      };
      updatedCartItems = [...existingCartItems, cartItem];
    }

    // Navigate to CartScreen with updated cart items
    navigation.navigate('CartScreen', { cartItems: updatedCartItems });
  };

  const categoryColors = getCategoryColor(item.category);

  const onRefresh = async () => {
    if (itemId) {
      setRefreshing(true);
      await fetchFoodItemDetails();
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppBar
          title="Order Details"
          onBackPress={() => navigation.goBack()}
          showBackButton
        />
        <View style={styles.loadingContainer}>
          <Loader size="large" color={colors.secondary} variant="particles" />
          <Text style={styles.loadingText}>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !item.name) {
    return (
      <SafeAreaView style={styles.container}>
        <AppBar
          title="Order Details"
          onBackPress={() => navigation.goBack()}
          showBackButton
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchFoodItemDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Order Details"
        onBackPress={() => navigation.goBack()}
        showBackButton
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
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
            <Text style={styles.itemPrice}>PKR {item.price}</Text>
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
            <Text style={styles.summaryValue}>PKR {item.price * quantity}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>PKR {totalPrice}</Text>
          </View>
        </View>
        
        {error ? (
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessageText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          activeOpacity={0.9}>
          <LinearGradient
            colors={colors.secondaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addToCartGradient}>
            <Text style={styles.addToCartText}>Add to Cart - PKR {totalPrice}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  errorMessageContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorMessageText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
  },
});

export default OrderDetailsScreen;

