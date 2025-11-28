import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import colors from '../../constants/colors';

const AppBar = ({
  title,
  subtitle,
  onBackPress,
  showBackButton = true,
  rightIcon,
  rightIconBadge,
  onRightPress,
  variant = 'default', // 'default' | 'light'
  centerTitle = false,
}) => {
  const isLight = variant === 'light';

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <TouchableOpacity
          style={[styles.backButton, isLight && styles.backButtonLight]}
          onPress={onBackPress}
        >
          <Icon name="arrow-left" size={18} color={isLight ? colors.white : colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButtonPlaceholder} />
      )}

      <View style={[styles.headerText, centerTitle && styles.headerTextCenter]}>
        <Text style={[styles.headerTitle, isLight && styles.headerTitleLight]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.headerSubtitle, isLight && styles.headerSubtitleLight]}>
            {subtitle}
          </Text>
        )}
      </View>

      {rightIcon ? (
        <TouchableOpacity
          style={[styles.rightButton, isLight && styles.rightButtonLight]}
          onPress={onRightPress}
        >
          <Text style={styles.rightIcon}>{rightIcon}</Text>
          {rightIconBadge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rightIconBadge}</Text>
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.rightButtonPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonPlaceholder: {
    width: 44,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTextCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerTitleLight: {
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerSubtitleLight: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rightButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.statusPendingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtonLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  rightButtonPlaceholder: {
    width: 48,
  },
  rightIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
});

export default AppBar;
