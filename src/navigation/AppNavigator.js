import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../views/screens/AuthScreen';
import OTPScreen from '../views/screens/OTPScreen';
import ForgotPasswordScreen from '../views/screens/ForgotPasswordScreen';
import OnboardingScreen from '../views/screens/OnboardingScreen';
import BookRoomScreen from '../views/screens/BookRoomScreen';
import OrderDetailsScreen from '../views/screens/OrderDetailsScreen';
import CartScreen from '../views/screens/CartScreen';
import EditProfileScreen from '../views/screens/EditProfileScreen';
import InvoicesScreen from '../views/screens/InvoicesScreen';
import InvoiceDetailScreen from '../views/screens/InvoiceDetailScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProfileSuccess, initializeAuth } from '../redux/slices/authSlice';
import storage from '../app/storage';
import colors from '../constants/colors';
import { authService, profileService, apiClient } from '../services/api';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      // Check onboarding status
      const hasCompletedOnboarding = await storage.checkFirstTimeUser();
      setIsFirstTime(hasCompletedOnboarding !== 'false');

      // Check authentication status
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);

      // Initialize Redux state from stored token
      if (authenticated) {
        const token = await apiClient.getToken();
        dispatch(initializeAuth({ token }));
        
        // Fetch profile if authenticated
        try {
          const profileResponse = await profileService.getProfile();
          if (profileResponse.success && profileResponse.data?.user) {
            dispatch(fetchProfileSuccess(profileResponse.data.user));
          }
        } catch (profileError) {
          console.error('Error fetching profile on app start:', profileError);
          // Continue even if profile fetch fails
        }
      }
    } catch (error) {
      console.error('Error checking initial state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialRoute = () => {
    if (isFirstTime) {
      return 'OnboardingScreen';
    }
    if (isAuthenticated) {
      return 'MainTabs';
    }
    return 'AuthScreen';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={getInitialRoute()}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
          <Stack.Screen name="AuthScreen" component={AuthScreen} />
          <Stack.Screen name="OTPScreen" component={OTPScreen} />
          <Stack.Screen
            name="ForgotPasswordScreen"
            component={ForgotPasswordScreen}
          />
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="BookRoomScreen" component={BookRoomScreen} />
          <Stack.Screen
            name="OrderDetailsScreen"
            component={OrderDetailsScreen}
          />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          <Stack.Screen
            name="EditProfileScreen"
            component={EditProfileScreen}
          />
          <Stack.Screen name="InvoicesScreen" component={InvoicesScreen} />
          <Stack.Screen
            name="InvoiceDetailScreen"
            component={InvoiceDetailScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AppNavigator;
