import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome6';
import HomeScreen from '../views/screens/HomeScreen';
import RoomsScreen from '../views/screens/RoomsScreen';
import FoodScreen from '../views/screens/FoodScreen';
import BookingsScreen from '../views/screens/BookingsScreen';
import ProfileScreen from '../views/screens/ProfileScreen';
import colors from '../constants/colors';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, label, focused }) => (
  <View style={styles.tabIconContainer}>
    <Icon name={icon} size={22} color={focused ? colors.primary : colors.textMuted} />
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

const BottomTabNavigator = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="house" label="Home" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Rooms"
          component={RoomsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="door-open" label="Rooms" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Food"
          component={FoodScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="bowl-food" label="Food" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Bookings"
          component={BookingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="bookmark" label="Bookings" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="user" label="Profile" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    height: 80,
    paddingTop: 8,
    paddingBottom: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default BottomTabNavigator;
