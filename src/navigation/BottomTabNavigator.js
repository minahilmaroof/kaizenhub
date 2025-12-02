import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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
    <Icon
      name={icon}
      size={20}
      color={focused ? colors.primary : colors.textMuted}
    />
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  </View>
);

const TabItem = ({ isFocused, onPress, options, route }) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.12,
        useNativeDriver: true,
        friction: 5,
        tension: 120,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={handlePress}
      style={styles.tabItem}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {options.tabBarIcon
          ? options.tabBarIcon({ focused: isFocused })
          : (
            <Text style={styles.fallbackLabel}>
              {options.tabBarLabel || route.name}
            </Text>
          )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const CenterHomeButton = ({ isFocused, onPress }) => {
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.1,
        useNativeDriver: true,
        friction: 5,
        tension: 120,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={styles.centerButton}
    >
      <Animated.View
        style={[
          styles.centerIconContainer,
          { transform: [{ scale }] },
        ]}
      >
        <Icon
          name="house"
          size={22}
          color={isFocused ? colors.primary : colors.textPrimary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const homeRouteName = 'Home';
  const homeIndex = state.routes.findIndex((route) => route.name === homeRouteName);

  return (
    <View style={styles.tabWrapper}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          if (index === homeIndex) {
            return null;
          }

          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <React.Fragment key={route.key}>
              <TabItem
                isFocused={isFocused}
                onPress={onPress}
                options={options}
                route={route}
              />
              {index === homeIndex - 1 && <View style={styles.centerGap} />}
            </React.Fragment>
          );
        })}
      </View>

      {/* Center Home button */}
      {homeIndex !== -1 && (
        <View style={styles.centerButtonWrapper}>
          {(() => {
            const route = state.routes[homeIndex];
            const isFocused = state.index === homeIndex;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return <CenterHomeButton isFocused={isFocused} onPress={onPress} />;
          })()}
        </View>
      )}
    </View>
  );
};

const BottomTabNavigator = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
        initialRouteName="Home"
        tabBar={(props) => <CustomTabBar {...props} />}
      >
        {/* Order routes so Home is logically in the center */}
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
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon icon="house" label="Home" focused={focused} />
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
  tabWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 40,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
    width: '86%',
    marginBottom: 18,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerGap: {
    width: 40,
  },
  centerButtonWrapper: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  centerButtonActive: {
    shadowOpacity: 0.18,
  },
  centerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
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
  fallbackLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
});

export default BottomTabNavigator;
