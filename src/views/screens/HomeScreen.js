import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/ImageComponent/IconComponent';
import ScheduleCard from '../components/ScheduleCard';
import colors from '../../constants/colors';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchProfileSuccess } from '../../redux/slices/authSlice';
import {
  profileService,
  scheduleService,
  authService,
} from '../../services/api';

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

  // Get user name from Redux state, fallback to 'Guest' if not available
  const userName = user?.name || 'Guest';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleQuickAction = actionId => {
    switch (actionId) {
      case '1':
        navigation.navigate('Rooms');
        break;
      case '2':
        navigation.navigate('Food');
        break;
      case '3':
        // Handle One Day Pass
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
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>KaizenHub</Text>
            <Text style={styles.welcomeText}>Welcome back, {userName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <LinearGradient
                colors={colors.primaryGradient}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{userInitial}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
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
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
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
              <ActivityIndicator size="small" color={colors.primary} />
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
        </View>
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
  avatarButton: {},
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 20,
    alignItems: 'center',
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
