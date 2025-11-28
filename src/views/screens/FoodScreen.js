import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';

const { width } = Dimensions.get('window');
const cardWidth = (width - 52) / 2;

const categories = [
  { id: 'all', title: 'All', icon: '🍽️' },
  { id: 'beverages', title: 'Beverages', icon: '☕' },
  { id: 'snacks', title: 'Snacks', icon: '🍪' },
  { id: 'meals', title: 'Meals', icon: '🍱' },
];

const foodItems = [
  {
    id: '1',
    name: 'Cappuccino',
    description: 'Rich espresso with steamed milk',
    price: 80,
    category: 'beverages',
    emoji: '☕',
    bgColor: '#FFF3E8',
  },
  {
    id: '2',
    name: 'Green Tea',
    description: 'Fresh brewed green tea with antioxidants',
    price: 50,
    category: 'beverages',
    emoji: '🍵',
    bgColor: '#ECFDF5',
  },
  {
    id: '3',
    name: 'Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 60,
    category: 'beverages',
    emoji: '🍊',
    bgColor: '#FFF7ED',
  },
  {
    id: '4',
    name: 'Veg Sandwich',
    description: 'Fresh vegetables with cheese and herbs',
    price: 120,
    category: 'snacks',
    emoji: '🥪',
    bgColor: '#FEF3C7',
  },
  {
    id: '5',
    name: 'French Fries',
    description: 'Crispy golden fries with seasoning',
    price: 90,
    category: 'snacks',
    emoji: '🍟',
    bgColor: '#FEF9C3',
  },
  {
    id: '6',
    name: 'Pasta',
    description: 'Creamy white sauce pasta with herbs',
    price: 180,
    category: 'meals',
    emoji: '🍝',
    bgColor: '#FEE2E2',
  },
];

const FoodScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);

  const filteredItems =
    selectedCategory === 'all'
      ? foodItems
      : foodItems.filter(item => item.category === selectedCategory);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = item => {
    navigation.navigate('OrderDetailsScreen', { item });
  };

  const handleCartPress = () => {
    navigation.navigate('CartScreen', { cartItems: cart });
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
          <Text style={styles.foodPrice}>₹{item.price}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addButtonText}>→</Text>
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
        onBackPress={() => navigation.goBack()}
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
      <FlatList
        data={filteredItems}
        renderItem={renderFoodCard}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.foodRow}
        contentContainerStyle={styles.foodGrid}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  categoriesContainer: {
    maxHeight: 56,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#F5842C',
    borderColor: '#F5842C',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
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
  addButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default FoodScreen;
