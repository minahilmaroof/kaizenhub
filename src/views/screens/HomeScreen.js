import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/ImageComponent/IconComponent';
import ScheduleCard from '../components/ScheduleCard';
import Loader from '../components/Loader';
import colors from '../../constants/colors';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchProfileSuccess } from '../../redux/slices/authSlice';
import {
  profileService,
  scheduleService,
  authService,
  notificationService,
} from '../../services/api';
import { getImageUrl, isDefaultUserIcon } from '../../services/api/config';
import { useFocusEffect, CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const quickActions = [
  {
    id: '1',
    title: 'Book Room',
    icon: 'door-open',
    gradient: [colors.primary, colors.primaryLight],
    type: 'fontAwesome',
  },
  {
    id: '2',
    title: 'Order Food',
    icon: 'fast-food-outline',
    gradient: [colors.secondary, colors.secondaryLight],
    type: 'ionicons',
  },
  {
    id: '3',
    title: 'One Day Pass',
    icon: 'calendar-day',
    gradient: ['#4A7CFF', '#6366F1'],
    type: 'fontAwesome',
  },
  {
    id: '4',
    title: 'My Bookings',
    icon: 'bookmark',
    gradient: ['#8A2BE2', '#DA70D6'],
    type: 'fontAwesome',
  },
];

// Helper function to format time from HH:MM:SS to 12-hour format
const formatTime = timeString => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Helper function to format time range
const formatTimeRange = (startTime, endTime) => {
  if (!startTime) return '';
  if (!endTime) return formatTime(startTime);
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

// Helper function to map API status to display status
const mapStatus = (statusType, status) => {
  const statusMap = {
    upcoming: 'Upcoming',
    active: 'Active',
    completed: 'Completed',
  };
  return statusMap[statusType] || status || 'Pending';
};

// Helper function to transform API schedule item to ScheduleCard props
const transformScheduleItem = item => {
  try {
    let type = item.type;
    // Map API types to ScheduleCard types
    if (type === 'day_pass') type = 'pass';
    if (type === 'order') type = 'food';

    let title = item.title || 'Untitled';
    let subtitle = item.description || '';

    // Customize based on type
    if (item.type === 'booking' && item.data?.room) {
      title = item.data.room.name || title;
      subtitle = item.data.room.type || subtitle;
    } else if (item.type === 'order') {
      // Handle order items - check multiple possible locations
      let items = item.data?.items || item.items || [];

      // If items is a JSON string, parse it
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          console.error('Error parsing order items JSON:', e);
          items = [];
        }
      }

      if (Array.isArray(items) && items.length > 0) {
        const itemNames = items.map(i => i.name || i).join(', ');
        subtitle = itemNames || subtitle;
      } else {
        // Fallback to description or order number
        subtitle = item.description || `Order #${item.id}` || subtitle;
      }
    } else if (item.type === 'day_pass' && item.data?.seat_type) {
      subtitle =
        item.data.seat_type.charAt(0).toUpperCase() +
        item.data.seat_type.slice(1);
    }

    return {
      id: item.id,
      uniqueKey: `${item.type}-${item.id}`, // Unique key combining type and id
      type,
      title,
      subtitle,
      time: formatTimeRange(item.start_time, item.end_time),
      status: mapStatus(item.status_type, item.status),
      data: item.data, // Keep original data for navigation
    };
  } catch (error) {
    console.error('Error transforming schedule item:', error, item);
    // Return a safe fallback
    return {
      id: item.id || 'unknown',
      uniqueKey: `${item.type || 'unknown'}-${item.id || 'unknown'}`,
      type:
        item.type === 'day_pass'
          ? 'pass'
          : item.type === 'order'
          ? 'food'
          : 'booking',
      title: item.title || 'Unknown',
      subtitle: item.description || '',
      time: formatTimeRange(item.start_time, item.end_time),
      status: mapStatus(item.status_type, item.status),
      data: item.data,
    };
  }
};

const HomeScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const token = useAppSelector(state => state.auth.token);
  const [scheduleData, setScheduleData] = useState([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const quickActionsOpacity = useRef(new Animated.Value(0)).current;
  const quickActionsTranslateY = useRef(new Animated.Value(20)).current;
  const scheduleOpacity = useRef(new Animated.Value(0)).current;
  const scheduleTranslateY = useRef(new Animated.Value(20)).current;

  // Fetch profile if authenticated but user data is missing
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && !user) {
        try {
          const profileResponse = await profileService.getProfile();
          if (profileResponse.success && profileResponse.data?.user) {
            dispatch(fetchProfileSuccess(profileResponse.data.user));
          }
        } catch (error) {
          console.error('Error fetching profile in HomeScreen:', error);
        }
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, dispatch]);

  // Fetch today's schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      console.log(
        'Schedule useEffect triggered. isAuthenticated:',
        isAuthenticated,
      );
      console.log('Redux token:', token);
      console.log('Redux user:', user);

      // Check both Redux state and actual token in storage
      const hasToken = token || (await authService.isAuthenticated());
      console.log('Has token (from storage or Redux):', hasToken);

      if (isAuthenticated || hasToken) {
        setIsLoadingSchedule(true);
        try {
          console.log('=== Starting schedule fetch ===');
          console.log('User authenticated:', !!user);
          console.log('User token exists:', !!token);

          const response = await scheduleService.getTodaySchedule();
          console.log('=== Schedule API Response ===');
          console.log('Full response:', JSON.stringify(response, null, 2));
          console.log('Response success:', response?.success);
          console.log('Response data:', response?.data);
          console.log('Schedule array:', response?.data?.schedule);

          if (response && response.success && response.data?.schedule) {
            console.log('Schedule items count:', response.data.schedule.length);
            console.log('Schedule data:', response.data.schedule);
            const transformedSchedule = response.data.schedule.map(
              transformScheduleItem,
            );
            console.log('Transformed schedule:', transformedSchedule);
            setScheduleData(transformedSchedule);
            console.log('Schedule data set in state');
          } else {
            console.log('⚠️ No schedule data in response');
            console.log('Response structure:', {
              hasResponse: !!response,
              hasSuccess: !!response?.success,
              hasData: !!response?.data,
              hasSchedule: !!response?.data?.schedule,
            });
          }
        } catch (error) {
          console.error('❌ Error fetching schedule:', error);
          console.error('Error message:', error.message);
          console.error('Error status:', error.status);
          console.error('Error data:', error.data);
          if (error.stack) {
            console.error('Error stack:', error.stack);
          }
        } finally {
          setIsLoadingSchedule(false);
          console.log('=== Schedule fetch completed ===');
        }
      } else {
        console.log('⚠️ User not authenticated, skipping schedule fetch');
      }
    };

    fetchSchedule();
  }, [isAuthenticated, user]);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data?.count !== undefined) {
        setUnreadNotificationCount(response.data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Fetch unread count when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  // Get user name from Redux state, fallback to 'Guest' if not available
  const userName = user?.name || 'Guest';
  const userInitial = userName.charAt(0).toUpperCase();

  // Animate sections when data is loaded
  useEffect(() => {
    if (!isLoadingSchedule) {
      // Animate Quick Actions
      Animated.parallel([
        Animated.timing(quickActionsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(quickActionsTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate Schedule section with delay
      Animated.parallel([
        Animated.timing(scheduleOpacity, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scheduleTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when loading
      quickActionsOpacity.setValue(0);
      quickActionsTranslateY.setValue(20);
      scheduleOpacity.setValue(0);
      scheduleTranslateY.setValue(20);
    }
  }, [isLoadingSchedule]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch schedule
      const hasToken = await authService.isAuthenticated();
      if (hasToken) {
        const response = await scheduleService.getTodaySchedule();
        if (response && response.success && response.data?.schedule) {
          const transformedSchedule = response.data.schedule.map(
            transformScheduleItem,
          );
          setScheduleData(transformedSchedule);
        }
      }
      // Fetch unread notification count
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleQuickAction = actionId => {
    switch (actionId) {
      case '1':
        navigation.navigate('Rooms');
        break;
      case '2':
        navigation.navigate('Food');
        break;
      case '3':
        navigation.navigate('CreateDayPassScreen');
        break;
      case '4':
        navigation.navigate('Bookings');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>KaizenHub</Text>
            <Text style={styles.welcomeText}>Welcome back, {userName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => {
                try {
                  // Navigate to NotificationScreen using CommonActions for reliability
                  const rootNavigator = navigation.getParent() || navigation;
                  if (rootNavigator) {
                    rootNavigator.dispatch(
                      CommonActions.navigate({
                        name: 'NotificationScreen',
                      })
                    );
                  }
                } catch (error) {
                  console.error('Navigation error:', error);
                  // Fallback to simple navigate
                  try {
                    const parent = navigation.getParent();
                    if (parent) {
                      parent.navigate('NotificationScreen');
                    } else {
                      navigation.navigate('NotificationScreen');
                    }
                  } catch (fallbackError) {
                    console.error('Fallback navigation error:', fallbackError);
                  }
                }
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={styles.notificationIconContainer}>
                <Icon
                  name="notifications"
                  size={24}
                  color={colors.textPrimary}
                  type="ionicons"
                />
                {unreadNotificationCount > 0 && (
                  <View style={styles.notificationBadge} pointerEvents="none">
                    <Text style={styles.notificationBadgeText}>
                      {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => navigation.navigate('Profile')}
            >
              {user?.image && !isDefaultUserIcon(user.image) ? (
                <Image
                  source={{ uri: getImageUrl(user.image) }}
                  style={styles.avatarImage}
                />
              ) : (
                <LinearGradient
                  colors={colors.primaryGradient}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{userInitial}</Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: quickActionsOpacity,
              transform: [{ translateY: quickActionsTranslateY }],
            },
          ]}
        >
          <Text style={[styles.sectionTitle, styles.quickActionsTitle]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => handleQuickAction(action.id)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.quickActionIcon}
                >
                  <Icon
                    name={action.icon}
                    size={24}
                    color="white"
                    type={action.type}
                  />
                </LinearGradient>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Today's Schedule */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: scheduleOpacity,
              transform: [{ translateY: scheduleTranslateY }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            {scheduleData.length > 2 && (
              <TouchableOpacity onPress={() => navigation.navigate('Bookings')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingSchedule ? (
            <View style={styles.loadingContainer}>
              <Loader size="large" color={colors.primary} variant="morphing" />
              <Text style={styles.loadingText}>Loading schedule...</Text>
            </View>
          ) : scheduleData.length > 0 ? (
            scheduleData.slice(0, 2).map(item => (
              <ScheduleCard
                key={item.uniqueKey || `${item.type}-${item.id}`}
                type={item.type}
                title={item.title}
                subtitle={item.subtitle}
                time={item.time}
                status={item.status}
                onPress={() => {
                  // Navigate based on type
                  if (item.type === 'booking') {
                    navigation.navigate('Bookings');
                  } else if (item.type === 'food') {
                    navigation.navigate('Bookings');
                  } else if (item.type === 'pass') {
                    navigation.navigate('Bookings');
                  }
                }}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No schedule items for today</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    fontStyle: 'italic',
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    overflow: 'visible',
  },
  notificationIconContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.error || '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: colors.surface,
    zIndex: 1,
  },
  notificationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  avatarButton: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quickActionsTitle: {
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    width: (width - 52) / 2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

export default HomeScreen;
