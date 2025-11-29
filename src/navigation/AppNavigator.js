import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from '../views/screens/AuthScreen';
import OTPScreen from '../views/screens/OTPScreen';
import ForgotPasswordScreen from '../views/screens/ForgotPasswordScreen';
import OnboardingScreen from '../views/screens/OnboardingScreen';
import BookRoomScreen from '../views/screens/BookRoomScreen';
import RescheduleBookingScreen from '../views/screens/RescheduleBookingScreen';
import CreateDayPassScreen from '../views/screens/CreateDayPassScreen';
import OrderDetailsScreen from '../views/screens/OrderDetailsScreen';
import CartScreen from '../views/screens/CartScreen';
import EditProfileScreen from '../views/screens/EditProfileScreen';
import InvoicesScreen from '../views/screens/InvoicesScreen';
import InvoiceDetailScreen from '../views/screens/InvoiceDetailScreen';
import NotificationScreen from '../views/screens/NotificationScreen';
import WebViewScreen from '../views/screens/WebViewScreen';
import BottomTabNavigator from './BottomTabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProfileSuccess, initializeAuth, logout } from '../redux/slices/authSlice';
import storage from '../app/storage';
import colors from '../constants/colors';
import { authService, profileService, apiClient } from '../services/api';
import Loader from '../views/components/Loader';
import { ToastProvider } from '../contexts/ToastContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigationRef = useRef(null);

  // Set up logout handler for 401 responses - do this first before any API calls
  useEffect(() => {
    const handleLogout = () => {
      console.log('Logout handler called - logging out user');
      dispatch(logout());
      setIsAuthenticated(false);
      
      // Function to navigate to AuthScreen
      const navigateToAuth = () => {
        if (navigationRef.current) {
          try {
            if (navigationRef.current.isReady()) {
              navigationRef.current.reset({
                index: 0,
                routes: [{ name: 'AuthScreen' }],
              });
              return true;
            }
          } catch (error) {
            console.error('Error navigating to AuthScreen:', error);
          }
        }
        return false;
      };
      
      // Try to navigate immediately
      if (!navigateToAuth()) {
        // If navigation not ready, try again after delays
        const tryNavigate = (attempts = 0) => {
          if (attempts < 5) {
            setTimeout(() => {
              if (!navigateToAuth() && attempts < 4) {
                tryNavigate(attempts + 1);
              }
            }, 200 * (attempts + 1));
          }
        };
        tryNavigate();
      }
    };
    
    apiClient.setLogoutHandler(handleLogout);
    
    return () => {
      apiClient.setLogoutHandler(null);
    };
  }, [dispatch]);

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
          // If 401 error, the logout handler will be called automatically
          // Just make sure we don't continue with authenticated state
          if (profileError.status === 401) {
            setIsAuthenticated(false);
            dispatch(logout());
          }
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
        <Loader size="large" color={colors.primary} variant="morphing" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <NavigationContainer ref={navigationRef}>
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
            name="RescheduleBookingScreen"
            component={RescheduleBookingScreen}
          />
          <Stack.Screen
            name="CreateDayPassScreen"
            component={CreateDayPassScreen}
          />
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
          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
          />
          <Stack.Screen
            name="WebViewScreen"
            component={WebViewScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </ToastProvider>
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
