import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './ImageComponent/IconComponent';
import colors from '../../constants/colors';

const TYPE_CONFIG = {
  booking: {
    icon: 'door-open',
    type: 'fontAwesome',
    gradient: colors.primaryGradient,
    statusColor: colors.primary,
    statusBg: '#ECFDF5',
  },
  food: {
    icon: 'fast-food-outline',
    type: 'ionicons',
    gradient: colors.secondaryGradient,
    statusColor: colors.secondary,
    statusBg: colors.statusPendingBg,
  },
  pass: {
    icon: 'calendar-day',
    type: 'fontAwesome',
    gradient: ['#22C55E', '#10B981'],
    statusColor: colors.success,
    statusBg: colors.statusPaidBg,
  },
};

const ScheduleCard = ({
  type = 'booking',
  title,
  subtitle,
  time,
  status,
  onPress,
}) => {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.booking;

  return (
    <TouchableOpacity
      style={styles.scheduleCard}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <LinearGradient colors={config.gradient} style={styles.scheduleIcon}>
        <Icon name={config.icon} size={24} color="white" type={config.type} />
      </LinearGradient>
      <View style={styles.scheduleContent}>
        <Text style={styles.scheduleTitle}>{title}</Text>
        <Text style={styles.scheduleSubtitle}>{subtitle}</Text>
        <View style={styles.scheduleTimeRow}>
          <Text style={styles.clockIcon}>🕐</Text>
          <Text style={styles.scheduleTime}>{time}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: config.statusBg }]}>
        <Text style={[styles.statusText, { color: config.statusColor }]}>
          {status}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  scheduleSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  scheduleTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  scheduleTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ScheduleCard;
