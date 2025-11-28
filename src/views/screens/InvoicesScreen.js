import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppBar from '../components/AppBar';
import InvoiceCard from '../components/InvoiceCard';

const filterTabs = [
  { id: 'all', title: 'All' },
  { id: 'paid', title: 'Paid' },
  { id: 'pending', title: 'Pending' },
];

const invoicesData = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    date: 'Apr 25, 2024',
    amount: '1,000',
    status: 'paid',
    type: 'room',
    description: 'Conference Room A - 2 hours booking',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    date: 'Apr 24, 2024',
    amount: '200',
    status: 'paid',
    type: 'food',
    description: 'Cappuccino x1, Veg Sandwich x1',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    date: 'Apr 23, 2024',
    amount: '800',
    status: 'pending',
    type: 'room',
    description: 'Meeting Room B - 2 hours booking',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    date: 'Apr 22, 2024',
    amount: '350',
    status: 'paid',
    type: 'food',
    description: 'Pasta x1, Orange Juice x2',
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    date: 'Apr 20, 2024',
    amount: '3,500',
    status: 'paid',
    type: 'room',
    description: 'Conference Room A - Full day booking',
  },
];

const InvoicesScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredInvoices =
    selectedFilter === 'all'
      ? invoicesData
      : invoicesData.filter(invoice => invoice.status === selectedFilter);

  const handleInvoicePress = invoice => {
    navigation.navigate('InvoiceDetailScreen', { invoice });
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
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map(invoice => (
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
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No invoices found</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any {selectedFilter} invoices yet
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
    backgroundColor: '#F8FAFC',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    backgroundColor: '#4A7CFF',
    borderColor: '#4A7CFF',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default InvoicesScreen;

