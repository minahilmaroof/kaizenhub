import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AppBar from '../components/AppBar';

const InvoiceDetailScreen = ({ navigation, route }) => {
  const { invoice } = route.params || {};

  // Default invoice data if not passed
  const invoiceData = invoice || {
    invoiceNumber: 'INV-2024-001',
    date: 'Apr 25, 2024',
    amount: '1,000',
    status: 'paid',
    type: 'room',
    description: 'Conference Room A - 2 hours booking',
  };

  const getStatusConfig = () => {
    switch (invoiceData.status) {
      case 'pending':
        return { color: '#F5842C', bg: '#FFF3E8', text: 'Pending' };
      case 'failed':
        return { color: '#EF4444', bg: '#FEE2E2', text: 'Failed' };
      default:
        return { color: '#22C55E', bg: '#ECFDF5', text: 'Paid' };
    }
  };

  const statusConfig = getStatusConfig();

  const handleDownload = () => {
    console.log('Download invoice:', invoiceData.invoiceNumber);
    // TODO: Implement download functionality
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Invoice Details"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Invoice Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.invoiceNumberRow}>
            <Text style={styles.invoiceNumber}>{invoiceData.invoiceNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
          <Text style={styles.invoiceDate}>{invoiceData.date}</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>₹{invoiceData.amount}</Text>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <View style={styles.detailValueRow}>
              <Text style={styles.typeEmoji}>
                {invoiceData.type === 'food' ? '🍴' : '🚪'}
              </Text>
              <Text style={styles.detailValue}>
                {invoiceData.type === 'food' ? 'Food Order' : 'Room Booking'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={[styles.detailValue, styles.descriptionText]}>
              {invoiceData.description}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Invoice Date</Text>
            <Text style={styles.detailValue}>{invoiceData.date}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status</Text>
            <Text style={[styles.detailValue, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>

        {/* Payment Breakdown */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Payment Breakdown</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Subtotal</Text>
            <Text style={styles.breakdownValue}>
              ₹{(parseFloat(invoiceData.amount.replace(',', '')) * 0.95).toFixed(0)}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>GST (5%)</Text>
            <Text style={styles.breakdownValue}>
              ₹{(parseFloat(invoiceData.amount.replace(',', '')) * 0.05).toFixed(0)}
            </Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{invoiceData.amount}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Download Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleDownload} activeOpacity={0.9}>
          <LinearGradient
            colors={['#4A7CFF', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.downloadButton}
          >
            <Icon name="download" size={18} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download Invoice</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  invoiceNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  amountContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4A7CFF',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  descriptionText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A7CFF',
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default InvoiceDetailScreen;
