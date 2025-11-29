import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import Loader from '../components/Loader';
import Icon from '../components/ImageComponent/IconComponent';
import { notificationService } from '../../services/api';
import colors from '../../constants/colors';
import { useFocusEffect } from '@react-navigation/native';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
};

// Helper function to format time
const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Transform API notification data to display format
const transformNotification = (notification) => {
  if (!notification) return null;
  
  return {
    id: notification.id?.toString(),
    title: notification.title || 'Notification',
    message: notification.message || '',
    date: formatDate(notification.created_at || notification.date),
    time: formatTime(notification.created_at || notification.date),
    isRead: notification.is_read || false,
    type: notification.type || 'general',
    icon: notification.icon,
    color: notification.color,
    ...notification, // Keep original data
  };
};

const filterTabs = [
  { id: 'all', title: 'All' },
  { id: 'unread', title: 'Unread' },
  { id: 'read', title: 'Read' },
];

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (page = 1, append = false) => {
    if (page === 1) {
      setIsLoading(true);
    }
    setError('');
    try {
      const params = {
        page,
        ...(selectedFilter !== 'all' && { status: selectedFilter }),
      };
      
      const response = await notificationService.getNotifications(params);
      
      if (response.success && response.data) {
        let notificationsArray = [];
        
        // Handle the API response structure: data.notifications.data
        if (response.data.notifications) {
          if (response.data.notifications.data && Array.isArray(response.data.notifications.data)) {
            notificationsArray = response.data.notifications.data;
            
            // Handle pagination
            if (response.data.notifications.pagination) {
              const pagination = response.data.notifications.pagination;
              setHasMorePages(pagination.current_page < pagination.last_page);
            }
          } else if (Array.isArray(response.data.notifications)) {
            notificationsArray = response.data.notifications;
          }
        } else if (Array.isArray(response.data)) {
          notificationsArray = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          notificationsArray = response.data.data;
        }
        
        const transformedNotifications = notificationsArray.map(transformNotification).filter(Boolean);
        
        if (append) {
          setNotifications(prev => [...prev, ...transformedNotifications]);
        } else {
          setNotifications(transformedNotifications);
        }
        
        // Update unread count
        if (response.data.unread_count !== undefined) {
          setUnreadCount(response.data.unread_count);
        }
      } else {
        if (!append) {
          setNotifications([]);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
      if (!append) {
        setNotifications([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success && response.data?.count !== undefined) {
        setUnreadCount(response.data.count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Filter notifications based on selected filter
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredNotifications(notifications);
    } else if (selectedFilter === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.isRead));
    } else if (selectedFilter === 'read') {
      setFilteredNotifications(notifications.filter(n => n.isRead));
    }
  }, [notifications, selectedFilter]);

  // Fetch notifications when screen comes into focus or filter changes
  useFocusEffect(
    React.useCallback(() => {
      setCurrentPage(1);
      fetchNotifications(1, false);
      fetchUnreadCount();
    }, [selectedFilter])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setCurrentPage(1);
    await fetchNotifications(1, false);
    await fetchUnreadCount();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId.toString()
              ? { ...n, isRead: true }
              : n
          )
        );
        // Update unread count
        fetchUnreadCount();
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingRead(true);
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        // Update local state
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        Alert.alert('Success', 'All notifications marked as read');
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await notificationService.deleteNotification(notificationId);
              if (response.success) {
                // Remove from local state
                setNotifications(prev =>
                  prev.filter(n => n.id !== notificationId.toString())
                );
                // Update unread count if it was unread
                const deletedNotification = notifications.find(n => n.id === notificationId.toString());
                if (deletedNotification && !deletedNotification.isRead) {
                  setUnreadCount(prev => Math.max(0, prev - 1));
                }
              }
            } catch (err) {
              console.error('Error deleting notification:', err);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const handleClearRead = async () => {
    Alert.alert(
      'Clear Read Notifications',
      'Are you sure you want to delete all read notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await notificationService.clearReadNotifications();
              if (response.success) {
                // Remove read notifications from local state
                setNotifications(prev => prev.filter(n => !n.isRead));
                Alert.alert('Success', 'Read notifications cleared');
              }
            } catch (err) {
              console.error('Error clearing read notifications:', err);
              Alert.alert('Error', 'Failed to clear read notifications');
            }
          },
        },
      ]
    );
  };

  const handleNotificationPress = (item) => {
    // Mark as read if unread
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    // You can add navigation to specific screens based on notification type here
  };

  const handleLoadMore = () => {
    if (hasMorePages && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  const getNotificationIcon = (type, icon) => {
    // Use icon from API if available
    if (icon) {
      return { name: icon, type: 'ionicons' };
    }
    
    // Fallback to type-based icons
    switch (type?.toLowerCase()) {
      case 'booking':
        return { name: 'door-open', type: 'fontAwesome' };
      case 'order':
      case 'food':
        return { name: 'fast-food-outline', type: 'ionicons' };
      case 'invoice':
      case 'payment':
        return { name: 'receipt', type: 'ionicons' };
      case 'day_pass':
      case 'pass':
        return { name: 'calendar-day', type: 'fontAwesome' };
      case 'system':
        return { name: 'settings', type: 'ionicons' };
      default:
        return { name: 'notifications', type: 'ionicons' };
    }
  };

  const getNotificationColor = (color, isRead) => {
    if (color === 'success') return colors.success || '#22C55E';
    if (color === 'error' || color === 'danger') return colors.error || '#EF4444';
    if (color === 'warning') return colors.warning || '#F59E0B';
    if (color === 'info') return colors.primary;
    return isRead ? colors.textSecondary : colors.primary;
  };

  const renderNotificationItem = ({ item }) => {
    const icon = getNotificationIcon(item.type, item.icon);
    const iconColor = getNotificationColor(item.color, item.isRead);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.isRead && styles.unreadNotification,
        ]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleDeleteNotification(item.id)}
      >
        <View style={styles.notificationIconContainer}>
          <View
            style={[
              styles.notificationIcon,
              { backgroundColor: item.isRead ? colors.border : iconColor + '20' },
            ]}
          >
            <Icon
              name={icon.name}
              size={20}
              color={item.isRead ? colors.textSecondary : iconColor}
              type={icon.type}
            />
          </View>
          {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: iconColor }]} />}
        </View>
        <View style={styles.notificationContent}>
          <Text
            style={[
              styles.notificationTitle,
              !item.isRead && styles.unreadTitle,
            ]}
          >
            {item.title}
          </Text>
          {item.message ? (
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>
          ) : null}
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationDate}>{item.date}</Text>
            {item.time && (
              <Text style={styles.notificationTime}> • {item.time}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Icon
            name="close"
            size={18}
            color={colors.textMuted}
            type="ionicons"
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="notifications-off"
        size={64}
        color={colors.textSecondary}
        type="ionicons"
      />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyMessage}>
        {selectedFilter === 'unread'
          ? "You don't have any unread notifications."
          : selectedFilter === 'read'
          ? "You don't have any read notifications."
          : "You don't have any notifications yet."}
      </Text>
    </View>
  );

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.appBarContainer}>
        <AppBar
          title="Notifications"
          onBackPress={() => navigation.goBack()}
          showBackButton
        />
        {unreadNotifications.length > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllAsRead}
            disabled={isMarkingRead}
          >
            <Text style={styles.markAllButtonText}>
              {isMarkingRead ? 'Marking...' : 'Mark all read'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.filterTab,
              selectedFilter === tab.id && styles.filterTabActive,
            ]}
            onPress={() => {
              setSelectedFilter(tab.id);
              setCurrentPage(1);
            }}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === tab.id && styles.filterTabTextActive,
              ]}
            >
              {tab.title}
            </Text>
            {tab.id === 'unread' && unreadCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Buttons */}
      {readNotifications.length > 0 && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearRead}
          >
            <Icon name="trash-outline" size={16} color={colors.error} type="ionicons" />
            <Text style={styles.clearButtonText}>Clear Read</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isLoading && currentPage === 1 ? (
        <View style={styles.loadingContainer}>
          <Loader size="large" color={colors.primary} variant="ripple" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchNotifications(1, false)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {renderEmptyState()}
        </ScrollView>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={
            hasMorePages && isLoading ? (
              <View style={styles.footerLoader}>
                <Loader size="small" color={colors.primary} variant="ripple" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterTabActive: {
    backgroundColor: colors.primary + '15',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 6,
    fontWeight: '500',
  },
  markAllButton: {
    position: 'absolute',
    right: 20,
    top: 16,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
  },
  listContent: {
    padding: 16,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: colors.primary + '08',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notificationIconContainer: {
    marginRight: 12,
    position: 'relative',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default NotificationScreen;
