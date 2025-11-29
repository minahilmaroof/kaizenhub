import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AppBar from '../components/AppBar';
import Loader from '../components/Loader';
import { foodService } from '../../services/api';
import colors from '../../constants/colors';

const { width } = Dimensions.get('window');
const cardWidth = (width - 52) / 2;

const categories = [
  { id: 'all', title: 'All', icon: '🍽️' },
  { id: 'beverages', title: 'Beverages', icon: '☕' },
  { id: 'snacks', title: 'Snacks', icon: '🍪' },
  { id: 'meals', title: 'Meals', icon: '🍱' },
];

// Helper function to get emoji and background color based on category
const getCategoryStyle = (category) => {
  const categoryLower = (category || '').toLowerCase();
  const styles = {
    beverages: { emoji: '☕', bgColor: '#FFF3E8' },
    snacks: { emoji: '🍪', bgColor: '#FEF3C7' },
    meals: { emoji: '🍱', bgColor: '#ECFDF5' },
    default: { emoji: '🍽️', bgColor: '#F3F4F6' },
  };
  return styles[categoryLower] || styles.default;
};

// Transform API food item to display format
const transformFoodItem = (item) => {
  const categoryStyle = getCategoryStyle(item.type || item.category);
  return {
    id: item.id?.toString() || item.food_item_id?.toString(),
    name: item.name || 'Food Item',
    description: item.description || '',
    price: parseFloat(item.price || 0),
    category: item.type || item.category || 'meals',
    emoji: categoryStyle.emoji,
    bgColor: categoryStyle.bgColor,
    ...item, // Keep original data for API calls
  };
};

const FoodScreen = ({ navigation, route }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchFoodItems();
  }, []);

  // Update cart when screen comes into focus or route params change
  useFocusEffect(
    React.useCallback(() => {
      // Check if cart items were passed via route params
      if (route?.params?.cartItems && Array.isArray(route.params.cartItems)) {
        setCart(route.params.cartItems);
      }
    }, [route?.params?.cartItems])
  );

  const fetchFoodItems = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await foodService.getFoodItems();
      if (response.success && response.data) {
        // Handle both array and object with items property
        const itemsArray = Array.isArray(response.data)
          ? response.data
          : response.data.items || response.data.food_items || [];
        const transformedItems = itemsArray.map(transformFoodItem);
        setFoodItems(transformedItems);
      } else {
        setError(response.message || 'Failed to load food items');
      }
    } catch (err) {
      console.error('Error fetching food items:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on selected category
  const filteredItems =
    selectedCategory === 'all'
      ? foodItems
      : foodItems.filter(item => item.category === selectedCategory);

  // Animate content when data is loaded
  useEffect(() => {
    if (!isLoading && !error && filteredItems && filteredItems.length > 0) {
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
  }, [isLoading, error, foodItems.length, selectedCategory]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = item => {
    navigation.navigate('OrderDetailsScreen', { item, cartItems: cart || [] });
  };

  const handleCartPress = () => {
    navigation.navigate('CartScreen', { cartItems: cart || [] });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFoodItems();
    setRefreshing(false);
  };

  const renderFoodCard = ({ item }) => (
    <View style={styles.foodCard}>
      <View
        style={[styles.foodImageContainer, { backgroundColor: item.bgColor }]}
      >
        <Text style={styles.foodEmoji}>{item.emoji}</Text>
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDescription} numberOfLines={1}>
          {item.description}
        </Text>
        <View style={styles.foodFooter}>
          <Text style={styles.foodPrice}>PKR {item.price}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Icon name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Cafeteria"
        subtitle="Order your favorites"
        showBackButton={false}
        rightIcon="🛒"
        rightIconBadge={cartItemCount}
        onRightPress={handleCartPress}
      />

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Food Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Loader size="large" color={colors.secondary} variant="morphing" />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchFoodItems}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredItems.length > 0 ? (
        <Animated.View
          style={{
            flex: 1,
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          }}
        >
          <FlatList
            data={filteredItems}
            renderItem={renderFoodCard}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.foodRow}
            contentContainerStyle={styles.foodGrid}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </Animated.View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No food items found</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  categoriesContainer: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
    minHeight: 44,
  },
  categoryChipActive: {
    backgroundColor: '#F5842C',
    borderColor: '#F5842C',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    flexShrink: 0,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  foodGrid: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  foodRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  foodCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  foodImageContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodEmoji: {
    fontSize: 56,
  },
  foodInfo: {
    padding: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F5842C',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5842C',
    alignItems: 'center',
    justifyContent: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default FoodScreen;
