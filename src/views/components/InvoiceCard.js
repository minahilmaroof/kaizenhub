import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const InvoiceCard = ({
  invoiceNumber,
  date,
  amount,
  status = 'paid', // 'paid' | 'pending' | 'failed'
  type = 'room', // 'room' | 'food'
  description,
  onPress,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          color: '#F5842C',
          bg: '#FFF3E8',
          text: 'Pending',
        };
      case 'failed':
        return {
          color: '#EF4444',
          bg: '#FEE2E2',
          text: 'Failed',
        };
      default:
        return {
          color: '#22C55E',
          bg: '#ECFDF5',
          text: 'Paid',
        };
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'food':
        return {
          icon: '🍴',
          bg: '#FFF3E8',
        };
      default:
        return {
          icon: '🚪',
          bg: '#EEF2FF',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const typeConfig = getTypeConfig();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.typeIcon, { backgroundColor: typeConfig.bg }]}>
          <Text style={styles.typeEmoji}>{typeConfig.icon}</Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
          <Text style={styles.invoiceDate}>{date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.text}
          </Text>
        </View>
      </View>

      {description && (
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.amount}>PKR {amount}</Text>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  typeEmoji: {
    fontSize: 20,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  invoiceDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  arrow: {
    fontSize: 24,
    color: '#9CA3AF',
  },
});

export default InvoiceCard;

