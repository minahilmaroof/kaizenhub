import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/ImageComponent/IconComponent';
import AppBar from '../components/AppBar';
import ConfirmationPopup from '../components/ConfirmationPopup';
import colors from '../../constants/colors';
import { authService, profileService } from '../../services/api';
import { getImageUrl } from '../../services/api/config';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';

const menuItems = [
  { id: '1', title: 'Edit Profile', icon: 'user', type: 'fontAwesome' },
  { id: '2', title: 'My Bookings', icon: 'bookmark', type: 'fontAwesome' },
  { id: '3', title: 'Invoices', icon: 'file-invoice', type: 'fontAwesome' },
];

const ProfileScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Get user data from Redux, with fallbacks
  const userName = user?.name || 'Guest';
  const userEmail = user?.email || '';
  const userPhone = user?.phone || 'Not provided';
  const userCompany = user?.company || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const fetchProfileData = async () => {
    try {
      const response = await profileService.getProfile();
      if (response.success && response.data) {
        // Extract counts from API response
        const bookings = response.data.bookings_count || 0;
        const orders = response.data.orders_count || 0;
        setBookingsCount(bookings);
        setOrdersCount(orders);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Keep default values (0) on error
    }
  };

  // Fetch profile data to get booking and order counts
  useEffect(() => {
    fetchProfileData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfileData();
    setRefreshing(false);
  };

  // Format wallet balance to be more compact - show K for thousands
  const formatWalletBalance = (balance) => {
    if (!balance) return '0';
    const amount = parseFloat(balance);
    
    if (amount >= 1000000) {
      // For millions, show as M (e.g., 1.5M)
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      // For thousands, show as K (e.g., 5K, 1.5K)
      const thousands = amount / 1000;
      // If it's a whole number, don't show decimals (e.g., 5K instead of 5.0K)
      return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
    }
    // For amounts less than 1000, show as is
    return amount.toFixed(0);
  };

  // Stats
  const stats = {
    bookings: bookingsCount,
    orders: ordersCount,
    walletBalance: user?.wallet_balance ? formatWalletBalance(user.wallet_balance) : '0',
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      dispatch(logout());
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout from Redux even if API call fails
      dispatch(logout());
    } finally {
      setShowLogoutPopup(false);
      setIsLoggingOut(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'AuthScreen' }],
      });
    }
  };

  const handleMenuPress = itemId => {
    switch (itemId) {
      case '1':
        navigation.navigate('EditProfileScreen');
        break;
      case '2':
        navigation.navigate('Bookings');
        break;
      case '3':
        navigation.navigate('InvoicesScreen');
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <AppBar
            title="Profile"
            showBackButton={false}
            variant="light"
          />
        </SafeAreaView>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            {user?.image ? (
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
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
              {userPhone !== 'Not provided' && (
                <Text style={styles.userPhone}>{userPhone}</Text>
              )}
              {userCompany && (
                <Text style={styles.userCompany}>{userCompany}</Text>
              )}
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.bookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#22C55E' }]}>
                {stats.orders}
              </Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.walletContainer}>
                <Text style={[styles.statValue, { color: '#F5842C' }]}>
                  {stats.walletBalance}
                </Text>
                <Text style={styles.walletCurrency}>PKR</Text>
              </View>
              <Text style={styles.statLabel}>Wallet Balance</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <ScrollView
        style={styles.menuContainer}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIconContainer}>
              <Icon
                name={item.icon}
                size={20}
                color={colors.primary}
                type={item.type}
              />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setShowLogoutPopup(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Logout Confirmation Popup */}
      <ConfirmationPopup
        visible={showLogoutPopup}
        icon="👋"
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        confirmColor="danger"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutPopup(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  userCompany: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 4,
  },
  walletCurrency: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F5842C',
    marginLeft: 4,
    opacity: 0.8,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  menuContainer: {
    flex: 1,
    marginTop: -10,
  },
  menuContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  menuArrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default ProfileScreen;
