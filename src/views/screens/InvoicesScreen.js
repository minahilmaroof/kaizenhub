import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import InvoiceCard from '../components/InvoiceCard';
import Loader from '../components/Loader';
import { invoiceService } from '../../services/api';
import colors from '../../constants/colors';

const filterTabs = [
  { id: 'all', title: 'All' },
  { id: 'paid', title: 'Paid' },
  { id: 'pending', title: 'Pending' },
];

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to format amount
const formatAmount = (amount) => {
  if (!amount) return '0';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount.toLocaleString('en-IN');
};

// Transform API invoice data to display format
const transformInvoice = (invoice) => {
  if (!invoice) return null;
  
  // Parse breakdown to get description
  let description = 'Invoice';
  let type = 'room';
  
  if (invoice.breakdown) {
    const breakdown = invoice.breakdown;
    const items = [];
    
    // Get bookings
    if (breakdown.bookings && Array.isArray(breakdown.bookings) && breakdown.bookings.length > 0) {
      type = 'room';
      breakdown.bookings.forEach(booking => {
        items.push(booking.room?.name || booking.description || 'Room Booking');
      });
    }
    
    // Get orders
    if (breakdown.orders && Array.isArray(breakdown.orders) && breakdown.orders.length > 0) {
      type = 'food';
      breakdown.orders.forEach(order => {
        try {
          const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          if (Array.isArray(orderItems)) {
            orderItems.forEach(item => {
              items.push(`${item.name || 'Item'} x${item.quantity || 1}`);
            });
          }
        } catch (e) {
          items.push('Food Order');
        }
      });
    }
    
    if (items.length > 0) {
      description = items.slice(0, 2).join(', ');
      if (items.length > 2) {
        description += ` +${items.length - 2} more`;
      }
    }
  }
  
  // Determine status - map 'unpaid' to 'pending' for display
  let status = (invoice.status || 'pending').toLowerCase();
  if (status === 'unpaid') {
    status = 'pending';
  }
  
  return {
    id: invoice.id?.toString(),
    invoiceNumber: invoice.invoice_number || invoice.invoiceNumber || `INV-${invoice.id}`,
    date: formatDate(invoice.created_at || invoice.date || invoice.invoice_date),
    amount: formatAmount(invoice.total || invoice.amount),
    rawAmount: parseFloat(invoice.total || invoice.amount || 0),
    status: status,
    type: type,
    description: description,
    month: invoice.month,
    dueDate: invoice.due_date,
    ...invoice, // Keep original data for detail screen
  };
};

const InvoicesScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(20)).current;

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = selectedFilter !== 'all' ? { status: selectedFilter } : {};
      const response = await invoiceService.getInvoices(params);
      
      if (response.success && response.data) {
        let invoicesArray = [];
        
        // Handle the nested structure: data.invoices.current, data.invoices.paid, data.invoices.unpaid
        if (response.data.invoices) {
          const invoicesObj = response.data.invoices;
          
          // Collect invoices from different categories
          if (selectedFilter === 'all') {
            // Get all invoices from current, paid, and unpaid
            if (invoicesObj.current && typeof invoicesObj.current === 'object') {
              invoicesArray.push(invoicesObj.current);
            }
            if (Array.isArray(invoicesObj.paid)) {
              invoicesArray = invoicesArray.concat(invoicesObj.paid);
            }
            if (Array.isArray(invoicesObj.unpaid)) {
              invoicesArray = invoicesArray.concat(invoicesObj.unpaid);
            }
          } else if (selectedFilter === 'paid') {
            // Get paid invoices
            if (Array.isArray(invoicesObj.paid)) {
              invoicesArray = invoicesObj.paid;
            }
            // Also check if current invoice is paid
            if (invoicesObj.current && typeof invoicesObj.current === 'object' && invoicesObj.current.status === 'paid') {
              invoicesArray.push(invoicesObj.current);
            }
          } else if (selectedFilter === 'pending') {
            // Get unpaid/pending invoices
            if (Array.isArray(invoicesObj.unpaid)) {
              invoicesArray = invoicesObj.unpaid;
            }
            // Also check if current invoice is unpaid/pending
            if (invoicesObj.current && typeof invoicesObj.current === 'object' && 
                (invoicesObj.current.status === 'unpaid' || invoicesObj.current.status === 'pending')) {
              invoicesArray.push(invoicesObj.current);
            }
          }
        } else if (Array.isArray(response.data)) {
          // Handle direct array response
          invoicesArray = response.data;
        } else if (response.data.data) {
          // Handle paginated response
          invoicesArray = Array.isArray(response.data.data) ? response.data.data : [];
        }
        
        const transformedInvoices = invoicesArray
          .map(transformInvoice)
          .filter(invoice => invoice !== null);
        setInvoices(transformedInvoices);
      } else {
        setError(response.message || 'Failed to load invoices');
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedFilter]);

  const filteredInvoices =
    selectedFilter === 'all'
      ? invoices
      : invoices.filter(invoice => invoice.status === selectedFilter);

  // Animate content when data is loaded
  useEffect(() => {
    if (!isLoading && !error && filteredInvoices && filteredInvoices.length > 0) {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animations when loading
      contentOpacity.setValue(0);
      contentTranslateY.setValue(20);
    }
  }, [isLoading, error, invoices.length, selectedFilter]);

  const handleInvoicePress = invoice => {
    navigation.navigate('InvoiceDetailScreen', { invoiceId: invoice.id, invoice });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvoices();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Invoices"
        subtitle="View and download invoices"
        onBackPress={() => navigation.goBack()}
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.filterTab,
              selectedFilter === tab.id && styles.filterTabActive,
            ]}
            onPress={() => setSelectedFilter(tab.id)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === tab.id && styles.filterTabTextActive,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Invoice List */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Loader size="large" color={colors.primary} variant="morphing" />
            <Text style={styles.loadingText}>Loading invoices...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchInvoices}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredInvoices.length > 0 ? (
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            }}
          >
            {filteredInvoices.map(invoice => (
              <InvoiceCard
                key={invoice.id}
                invoiceNumber={invoice.invoiceNumber}
                date={invoice.date}
                amount={invoice.amount}
                status={invoice.status}
                type={invoice.type}
                description={invoice.description}
                onPress={() => handleInvoicePress(invoice)}
              />
            ))}
          </Animated.View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No invoices found</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any {selectedFilter === 'all' ? '' : selectedFilter} invoices yet
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.white,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

export default InvoicesScreen;

