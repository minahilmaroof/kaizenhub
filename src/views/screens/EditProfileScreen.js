import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AppBar from '../components/AppBar';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchProfileSuccess } from '../../redux/slices/authSlice';
import { profileService } from '../../services/api';

const EditProfileScreen = ({ navigation, route }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  
  // Initialize form fields with user data from Redux
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [company, setCompany] = useState(user?.company || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form fields when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCompany(user.company || '');
    }
  }, [user]);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updateData = {
        name: name.trim(),
        ...(phone.trim() && { phone: phone.trim() }),
        ...(company.trim() && { company: company.trim() }),
      };

      const response = await profileService.updateProfile(updateData);

      if (response.success) {
        // Update Redux state with updated user data
        // The API might return the updated user in response.data.user
        if (response.data?.user) {
          dispatch(fetchProfileSuccess(response.data.user));
        } else if (response.data) {
          // If response.data is the user object directly
          dispatch(fetchProfileSuccess(response.data));
        } else {
          // If no user data in response, fetch fresh profile
          const profileResponse = await profileService.getProfile();
          if (profileResponse.success && profileResponse.data?.user) {
            dispatch(fetchProfileSuccess(profileResponse.data.user));
          }
        }
        
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBar
        title="Edit Profile"
        subtitle="Update your information"
        onBackPress={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['#4A7CFF', '#7C3AED']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <TouchableOpacity style={styles.changePhotoButton}>
              <Icon name="camera" size={14} color="#4A7CFF" />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="user"
                  size={18}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="phone"
                  size={18}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Company Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company (Optional)</Text>
              <View style={styles.inputContainer}>
                <Icon
                  name="building"
                  size={18}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={company}
                  onChangeText={text => {
                    setCompany(text);
                    setError('');
                  }}
                  placeholder="Enter your company name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Email (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputContainer, styles.inputDisabled]}>
                <Icon
                  name="envelope"
                  size={18}
                  color="#9CA3AF"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.inputTextDisabled]}
                  value={user?.email || ''}
                  editable={false}
                />
                <View style={styles.lockedBadge}>
                  <Icon name="lock" size={12} color="#9CA3AF" />
                </View>
              </View>
              <Text style={styles.helperText}>
                Email cannot be changed. Contact support for assistance.
              </Text>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.9}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#4A7CFF', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButton}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A7CFF',
    marginLeft: 6,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputDisabled: {
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  inputTextDisabled: {
    color: '#9CA3AF',
  },
  lockedBadge: {
    padding: 6,
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  errorContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  saveButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EditProfileScreen;

