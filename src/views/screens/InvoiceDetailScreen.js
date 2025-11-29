import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Share from 'react-native-share';
import AppBar from '../components/AppBar';

// Conditionally import react-native-fs to avoid crashes if not linked
let RNFS = null;
try {
  RNFS = require('react-native-fs');
} catch (e) {
  console.warn('react-native-fs not available:', e);
}
import Loader from '../components/Loader';
import { invoiceService } from '../../services/api';
import { API_CONFIG } from '../../services/api/config';
import colors from '../../constants/colors';

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

// Helper function to convert ArrayBuffer to base64 (works in React Native)
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // Simple base64 encoding
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  while (i < binary.length) {
    const a = binary.charCodeAt(i++);
    const b = i < binary.length ? binary.charCodeAt(i++) : 0;
    const c = i < binary.length ? binary.charCodeAt(i++) : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < binary.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < binary.length ? chars.charAt(bitmap & 63) : '=';
  }
  return result;
};

const InvoiceDetailScreen = ({ navigation, route }) => {
  const invoiceId = route?.params?.invoiceId;
  const initialInvoice = route?.params?.invoice;
  
  const [invoiceData, setInvoiceData] = useState(initialInvoice || {
    invoiceNumber: 'Loading...',
    date: '',
    amount: '0',
    status: 'pending',
    type: 'room',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(!!invoiceId);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await invoiceService.getInvoiceDetails(invoiceId);
      
      if (response.success && response.data) {
        // Handle nested structure: data.invoice
        const invoice = response.data.invoice || response.data;
        
        // Parse breakdown to get description
        let description = 'Invoice';
        let type = 'room';
        const items = [];
        
        if (invoice.breakdown) {
          const breakdown = invoice.breakdown;
          
          // Get bookings
          if (breakdown.bookings && Array.isArray(breakdown.bookings) && breakdown.bookings.length > 0) {
            type = 'room';
            breakdown.bookings.forEach(booking => {
              items.push(booking.room_name || 'Room Booking');
            });
          }
          
          // Get orders
          if (breakdown.orders && Array.isArray(breakdown.orders) && breakdown.orders.length > 0) {
            if (items.length === 0) type = 'food';
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
            description = items.slice(0, 3).join(', ');
            if (items.length > 3) {
              description += ` +${items.length - 3} more`;
            }
          }
        }
        
        // Determine status - map 'unpaid' to 'pending' for display
        let status = (invoice.status || 'pending').toLowerCase();
        if (status === 'unpaid') {
          status = 'pending';
        }
        
        // Get amounts from breakdown if available
        const breakdown = invoice.breakdown || {};
        const subtotal = breakdown.subtotal || parseFloat(invoice.total || 0);
        const discount = parseFloat(breakdown.discount || invoice.discount || 0);
        const additionalCharges = parseFloat(breakdown.additional_charges || invoice.additional_charges || 0);
        const total = parseFloat(breakdown.total || invoice.total || 0);
        const gst = total - subtotal + discount - additionalCharges; // Calculate GST from difference
        
        setInvoiceData({
          id: invoice.id?.toString(),
          invoiceNumber: invoice.invoice_number || invoice.invoiceNumber || `INV-${invoice.id}`,
          date: formatDate(invoice.created_at || invoice.date || invoice.invoice_date),
          amount: formatAmount(invoice.total || invoice.amount),
          rawAmount: total,
          status: status,
          type: type,
          description: description,
          subtotal: subtotal,
          discount: discount,
          additionalCharges: additionalCharges,
          gst: gst > 0 ? gst : 0,
          month: invoice.month,
          dueDate: invoice.due_date,
          breakdown: invoice.breakdown,
          ...invoice, // Keep original data
        });
      } else {
        setError(response.message || 'Failed to load invoice details');
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    if (invoiceId) {
      setRefreshing(true);
      await fetchInvoiceDetails();
      setRefreshing(false);
    }
  };

  const getStatusConfig = () => {
    switch (invoiceData.status) {
      case 'pending':
        return { color: colors.warning, bg: colors.statusPendingBg, text: 'Pending' };
      case 'failed':
        return { color: colors.error, bg: colors.statusFailedBg, text: 'Failed' };
      default:
        return { color: colors.success, bg: colors.statusPaidBg, text: 'Paid' };
    }
  };

  const statusConfig = getStatusConfig();
  
  // Calculate amounts
  const rawAmount = invoiceData.rawAmount || parseFloat((invoiceData.amount || '0').replace(/,/g, ''));
  const subtotal = invoiceData.subtotal || (rawAmount * 0.95);
  const gst = invoiceData.gst || (rawAmount * 0.05);

  const handleDownload = async () => {
    if (!invoiceId) {
      Alert.alert('Error', 'Invoice ID not found');
      return;
    }

    // Check if react-native-fs is available
    if (!RNFS) {
      Alert.alert(
        'Download Not Available',
        'File system module is not available. Please rebuild the app to enable downloads.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsDownloading(true);
    try {
      // Import apiClient to get token
      const apiClient = require('../../services/api/client').default;
      const token = await apiClient.getToken();
      
      if (!token) {
        Alert.alert('Error', 'Authentication required to download invoice');
        setIsDownloading(false);
        return;
      }
      
      // For Android 10+ (API 29+), WRITE_EXTERNAL_STORAGE is not needed for scoped storage
      // We can write to app-specific directories without permission
      // Only request permission for Android 9 and below
      if (Platform.OS === 'android') {
        try {
          const androidVersion = Platform.Version;
          
          // Only request permission for Android 9 (API 28) and below
          if (androidVersion < 29) {
            const checkResult = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            );
            
            if (!checkResult) {
              const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                  title: 'Storage Permission Required',
                  message: 'This app needs access to your device storage to download the invoice PDF file.',
                  buttonNeutral: 'Ask Me Later',
                  buttonNegative: 'Cancel',
                  buttonPositive: 'Grant Permission',
                }
              );
              
              if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert(
                  'Permission Denied',
                  'Storage permission is required to download the invoice on this Android version.',
                  [{ text: 'OK' }]
                );
                setIsDownloading(false);
                return;
              }
            }
          }
          // For Android 10+, no permission needed - we'll use scoped storage
        } catch (err) {
          console.error('Permission error:', err);
          // Continue anyway for Android 10+ as permission might not be needed
          if (Platform.Version < 29) {
            Alert.alert(
              'Permission Error',
              'Unable to request storage permission. Please check app permissions in settings.',
              [{ text: 'OK' }]
            );
            setIsDownloading(false);
            return;
          }
        }
      }
      
      // Construct the PDF download URL
      const downloadUrl = `${API_CONFIG.BASE_URL}/invoices/${invoiceId}/download`;
      
      // Create filename
      const fileName = `Invoice_${invoiceData.invoiceNumber.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      
      // For Android 10+, we need to download to app's private directory first
      // Then use Share API to save it to Downloads (which handles MediaStore properly)
      let tempPath;
      let finalPath;
      
      if (Platform.OS === 'android') {
        // Download to app's cache directory first
        tempPath = `${RNFS.CachesDirectoryPath}/${fileName}`;
        finalPath = Platform.Version >= 29 
          ? `${RNFS.DocumentDirectoryPath}/${fileName}` // For Android 10+, we'll use Share to save to Downloads
          : `${RNFS.DownloadDirectoryPath}/${fileName}`; // For older Android, direct to Downloads
      } else {
        // iOS: Save to Documents folder
        tempPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        finalPath = tempPath;
      }
      
      console.log('Downloading to temp path:', tempPath);
      
      // Download the file to temp location
      const downloadResult = await RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: tempPath,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      }).promise;
      
      console.log('Download result:', downloadResult);
      
      if (downloadResult.statusCode === 200) {
        // Verify file was actually saved
        const fileExists = await RNFS.exists(tempPath);
        if (!fileExists) {
          throw new Error('File was not saved successfully');
        }
        
        const fileSize = await RNFS.stat(tempPath);
        console.log('File saved successfully. Size:', fileSize.size, 'bytes');
        
        // For Android 10+, use Share API to save to Downloads (makes it visible)
        if (Platform.OS === 'android' && Platform.Version >= 29) {
          try {
            // Automatically open share dialog
            // User should select "Files by Google" or scroll to find "Save" option
            await Share.open({
              url: `file://${tempPath}`,
              type: 'application/pdf',
              filename: fileName,
              title: 'Save Invoice to Downloads',
            });
            
            Alert.alert(
              'Download Successful',
              'Invoice saved successfully! Check your Downloads folder.',
              [{ text: 'OK' }]
            );
          } catch (shareError) {
            // If user cancels share, file is still in temp location
            if (shareError.message !== 'User did not share' && shareError.message !== 'User cancelled') {
              // Copy to final location as fallback
              await RNFS.copyFile(tempPath, finalPath);
              Alert.alert(
                'Download Successful',
                'Invoice saved to app folder. You can access it via Files app.',
                [{ text: 'OK' }]
              );
            } else {
              // User cancelled - file is still downloaded but in temp location
              Alert.alert(
                'Download Cancelled',
                'To save the invoice, please select "Files by Google" or "Save" from the share options.',
                [{ text: 'OK' }]
              );
            }
          }
        } else {
          // For older Android or iOS, file is already in the right place
          if (tempPath !== finalPath) {
            await RNFS.copyFile(tempPath, finalPath);
            // Clean up temp file
            await RNFS.unlink(tempPath).catch(() => {});
          }
          
          const saveLocation = Platform.OS === 'android' ? 'Downloads folder' : 'Documents folder';
          Alert.alert(
            'Download Successful',
            `Invoice saved to ${saveLocation}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error(`Download failed with status code: ${downloadResult.statusCode}`);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      Alert.alert(
        'Download Error',
        error.message || 'Unable to download invoice. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppBar
          title="Invoice Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <Loader size="large" color={colors.primary} variant="morphing" />
          <Text style={styles.loadingText}>Loading invoice details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !invoiceData.invoiceNumber) {
    return (
      <SafeAreaView style={styles.container}>
        <AppBar
          title="Invoice Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchInvoiceDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
            <Text style={styles.amountValue}>PKR {invoiceData.amount}</Text>
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

          {invoiceData.month && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Month</Text>
                <Text style={styles.detailValue}>{invoiceData.month}</Text>
              </View>
            </>
          )}

          {invoiceData.dueDate && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>{formatDate(invoiceData.dueDate)}</Text>
              </View>
            </>
          )}

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
              PKR {formatAmount(subtotal)}
            </Text>
          </View>

          {invoiceData.discount > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Discount</Text>
              <Text style={[styles.breakdownValue, { color: colors.success }]}>
                -PKR {formatAmount(invoiceData.discount)}
              </Text>
            </View>
          )}

          {invoiceData.additionalCharges > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Additional Charges</Text>
              <Text style={styles.breakdownValue}>
                PKR {formatAmount(invoiceData.additionalCharges)}
              </Text>
            </View>
          )}

          {gst > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>GST</Text>
              <Text style={styles.breakdownValue}>
                PKR {formatAmount(gst)}
              </Text>
            </View>
          )}

          <View style={styles.totalDivider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>PKR {invoiceData.amount}</Text>
          </View>
        </View>

        {/* Invoice Items Breakdown */}
        {invoiceData.breakdown && (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Items</Text>
            
            {/* Bookings */}
            {invoiceData.breakdown.bookings && 
             Array.isArray(invoiceData.breakdown.bookings) && 
             invoiceData.breakdown.bookings.length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Room Bookings</Text>
                {invoiceData.breakdown.bookings.map((booking, index) => (
                  <View key={booking.id || index} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemName}>{booking.room_name || 'Room Booking'}</Text>
                      <Text style={styles.itemDetails}>
                        {formatDate(booking.date)} • {booking.time}
                      </Text>
                    </View>
                    <Text style={styles.itemPrice}>PKR {formatAmount(booking.price)}</Text>
                  </View>
                ))}
                {invoiceData.breakdown.orders && 
                 Array.isArray(invoiceData.breakdown.orders) && 
                 invoiceData.breakdown.orders.length > 0 && (
                  <View style={styles.divider} />
                )}
              </>
            )}
            
            {/* Orders */}
            {invoiceData.breakdown.orders && 
             Array.isArray(invoiceData.breakdown.orders) && 
             invoiceData.breakdown.orders.length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Food Orders</Text>
                {invoiceData.breakdown.orders.map((order, index) => {
                  let orderItems = [];
                  try {
                    orderItems = typeof order.items === 'string' 
                      ? JSON.parse(order.items) 
                      : (Array.isArray(order.items) ? order.items : []);
                  } catch (e) {
                    orderItems = [];
                  }
                  
                  return (
                    <View key={order.id || index} style={styles.orderGroup}>
                      {orderItems.map((item, itemIndex) => (
                        <View key={itemIndex} style={styles.itemRow}>
                          <View style={styles.itemLeft}>
                            <Text style={styles.itemName}>
                              {item.name || 'Item'} × {item.quantity || 1}
                            </Text>
                            {item.price && (
                              <Text style={styles.itemDetails}>
                                PKR {formatAmount(item.price)} each
                              </Text>
                            )}
                          </View>
                          <Text style={styles.itemPrice}>
                            PKR {formatAmount(item.subtotal || (item.price * (item.quantity || 1)))}
                          </Text>
                        </View>
                      ))}
                      {orderItems.length > 0 && (
                        <View style={styles.orderTotal}>
                          <Text style={styles.orderTotalLabel}>Order Total</Text>
                          <Text style={styles.orderTotalValue}>
                            PKR {formatAmount(order.total)}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Download Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleDownload} activeOpacity={0.9}>
          <LinearGradient
            colors={colors.primaryGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.downloadButton}
          >
            <Icon name="download" size={18} color={colors.white} />
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
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
    color: colors.textPrimary,
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
    color: colors.textSecondary,
    marginBottom: 20,
  },
  amountContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
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
    color: colors.textSecondary,
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
    color: colors.textPrimary,
  },
  descriptionText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  breakdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  totalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
  },
  downloadButtonDisabled: {
    opacity: 0.7,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemLeft: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderGroup: {
    marginBottom: 8,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  orderTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default InvoiceDetailScreen;
