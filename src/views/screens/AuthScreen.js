import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Loader from '../components/Loader';
import colors from '../../constants/colors';
import { authService, profileService } from '../../services/api';
import { useAppDispatch } from '../../redux/hooks';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  fetchProfileSuccess,
} from '../../redux/slices/authSlice';

const { height } = Dimensions.get('window');

const AuthScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('member');
  const [showPassword, setShowPassword] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // Individual field errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const roleOptions = [
    { id: 'member', label: 'Member' },
    { id: 'walk_in', label: 'Walk-in' },
  ];

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = password => {
    // Password must have at least one special character
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharRegex.test(password);
  };

  const validateName = name => {
    // Check if name has trailing spaces
    if (name !== name.trim()) {
      return 'Name cannot have spaces at the beginning or end';
    }
    // Check if name is empty
    if (!name.trim()) {
      return 'Please enter your name';
    }
    // Check if name has only spaces
    if (name.trim().length === 0) {
      return 'Name cannot be empty';
    }
    return '';
  };

  const validatePhone = phone => {
    if (phone && phone.trim()) {
      // Remove spaces, dashes, and parentheses for validation
      const cleanedPhone = phone.replace(/[\s\-\(\)]/g, '');
      // Check if phone contains only digits
      if (!/^\d+$/.test(cleanedPhone)) {
        return 'Phone number must contain only digits';
      }
      // Check minimum length (adjust as needed)
      if (cleanedPhone.length < 10) {
        return 'Phone number must be at least 10 digits';
      }
    }
    return '';
  };

  const validateForm = () => {
    let isValid = true;
    
    // Clear all errors first
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setPhoneError('');
    setError('');

    // Validate name (register only)
    if (mode === 'register') {
      const nameValidation = validateName(name);
      if (nameValidation) {
        setNameError(nameValidation);
        isValid = false;
      }
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Please enter your password');
      isValid = false;
    } else if (mode === 'register') {
      // Only apply strict password validation for register
      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        isValid = false;
      } else if (!validatePassword(password)) {
        setPasswordError('Password must contain at least one special character');
        isValid = false;
      }
    }
    // For login, only check if password is not empty (no special character requirement)

    // Validate phone (optional but if provided, must be valid)
    if (mode === 'register' && phone && phone.trim()) {
      const phoneValidation = validatePhone(phone);
      if (phoneValidation) {
        setPhoneError(phoneValidation);
        isValid = false;
      }
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    dispatch(loginStart());

    try {
      const response = await authService.login(
        email.trim().toLowerCase(),
        password,
      );

      if (response.success && response.data) {
        dispatch(
          loginSuccess({
            user: response.data.user,
            token: response.data.token,
          }),
        );
        // Fetch full profile data
        try {
          const profileResponse = await profileService.getProfile();
          if (profileResponse.success && profileResponse.data?.user) {
            dispatch(fetchProfileSuccess(profileResponse.data.user));
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Continue even if profile fetch fails
        }
        // Navigate to main app
        navigation.replace('MainTabs');
      } else {
        const errorMsg = response.message || 'Login failed. Please try again.';
        setError(errorMsg);
        dispatch(loginFailure(errorMsg));
      }
    } catch (err) {
      const errorMsg = err.message || 'Something went wrong. Please try again.';
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    dispatch(loginStart());

    try {
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || '',
        company: company.trim() || '',
        role: role || 'member',
      };

      const response = await authService.register(userData);

      if (response.success && response.data) {
        dispatch(
          loginSuccess({
            user: response.data.user,
            token: response.data.token,
          }),
        );
        // Fetch full profile data
        try {
          const profileResponse = await profileService.getProfile();
          if (profileResponse.success && profileResponse.data?.user) {
            dispatch(fetchProfileSuccess(profileResponse.data.user));
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Continue even if profile fetch fails
        }
        // Navigate to main app
        navigation.replace('MainTabs');
      } else {
        const errorMsg =
          response.message || 'Registration failed. Please try again.';
        setError(errorMsg);
        dispatch(loginFailure(errorMsg));
      }
    } catch (err) {
      const errorMsg = err.message || 'Something went wrong. Please try again.';
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight, colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.logo}>KaizenHub</Text>
                <Text style={styles.tagline}>
                  Your Coworking Space Companion
                </Text>
              </View>

              {/* White Card */}
              <View style={styles.card}>
                {/* Mode Toggle */}
                <View style={styles.modeToggle}>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      mode === 'login' && styles.modeButtonActive,
                    ]}
                    onPress={() => {
                      setMode('login');
                      setEmail('');
                      setPassword('');
                      setError('');
                      setNameError('');
                      setEmailError('');
                      setPasswordError('');
                      setPhoneError('');
                    }}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        mode === 'login' && styles.modeButtonTextActive,
                      ]}
                    >
                      Login
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modeButton,
                      mode === 'register' && styles.modeButtonActive,
                    ]}
                    onPress={() => {
                      setMode('register');
                      setEmail('');
                      setPassword('');
                      setError('');
                      setNameError('');
                      setEmailError('');
                      setPasswordError('');
                      setPhoneError('');
                    }}
                  >
                    <Text
                      style={[
                        styles.modeButtonText,
                        mode === 'register' && styles.modeButtonTextActive,
                      ]}
                    >
                      Register
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardTitle}>
                  {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {mode === 'login'
                    ? 'Enter your credentials to continue'
                    : 'Fill in your details to get started'}
                </Text>

                {/* Name Input (Register only) */}
                {mode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View
                      style={[
                        styles.inputContainer,
                        nameError && styles.inputError,
                      ]}
                    >
                      <Icon
                        name="user"
                        size={18}
                        color={colors.textMuted}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={colors.textMuted}
                        value={name}
                        onChangeText={text => {
                          // Remove trailing spaces
                          const trimmedText = text.replace(/\s+$/, '');
                          setName(trimmedText);
                          setNameError('');
                          setError('');
                        }}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                    {nameError ? (
                      <Text style={styles.fieldErrorText}>{nameError}</Text>
                    ) : null}
                  </View>
                )}

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View
                    style={[styles.inputContainer, emailError && styles.inputError]}
                  >
                    <Icon
                      name="envelope"
                      size={18}
                      color={colors.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor={colors.textMuted}
                      value={email}
                      onChangeText={text => {
                        // Remove trailing spaces
                        const trimmedText = text.replace(/\s+$/, '');
                        setEmail(trimmedText);
                        setEmailError('');
                        setError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>
                  {emailError ? (
                    <Text style={styles.fieldErrorText}>{emailError}</Text>
                  ) : null}
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View
                    style={[styles.inputContainer, passwordError && styles.inputError]}
                  >
                    <Icon
                      name="lock"
                      size={18}
                      color={colors.textMuted}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.textMuted}
                      value={password}
                      onChangeText={text => {
                        // Remove trailing spaces
                        const trimmedText = text.replace(/\s+$/, '');
                        setPassword(trimmedText);
                        setPasswordError('');
                        setError('');
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Icon
                        name={showPassword ? 'eye-slash' : 'eye'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text style={styles.fieldErrorText}>{passwordError}</Text>
                  ) : null}
                </View>

                {/* Phone Input (Register only) */}
                {mode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone (Optional)</Text>
                    <View
                      style={[
                        styles.inputContainer,
                        phoneError && styles.inputError,
                      ]}
                    >
                      <Icon
                        name="phone"
                        size={18}
                        color={colors.textMuted}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="1234567890"
                        placeholderTextColor={colors.textMuted}
                        value={phone}
                        onChangeText={text => {
                          // Remove trailing spaces
                          const trimmedText = text.replace(/\s+$/, '');
                          setPhone(trimmedText);
                          setPhoneError('');
                          setError('');
                        }}
                        keyboardType="phone-pad"
                        editable={!isLoading}
                      />
                    </View>
                    {phoneError ? (
                      <Text style={styles.fieldErrorText}>{phoneError}</Text>
                    ) : null}
                  </View>
                )}

                {/* Company Input (Register only) */}
                {mode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Company (Optional)</Text>
                    <View style={styles.inputContainer}>
                      <Icon
                        name="building"
                        size={18}
                        color={colors.textMuted}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Tech Solutions Pvt Ltd"
                        placeholderTextColor={colors.textMuted}
                        value={company}
                        onChangeText={text => {
                          // Remove trailing spaces
                          const trimmedText = text.replace(/\s+$/, '');
                          setCompany(trimmedText);
                          setError('');
                        }}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                  </View>
                )}

                {/* Role Selection (Register only) */}
                {mode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>User Role</Text>
                    <TouchableOpacity
                      style={styles.inputContainer}
                      onPress={() => setShowRolePicker(true)}
                      disabled={isLoading}
                    >
                      <Icon
                        name="user-tag"
                        size={18}
                        color={colors.textMuted}
                        style={styles.inputIcon}
                      />
                      <Text
                        style={[
                          styles.roleSelectText,
                          !role && styles.placeholderText,
                        ]}
                      >
                        {roleOptions.find(r => r.id === role)?.label || 'Select Role'}
                      </Text>
                      <Icon
                        name="chevron-down"
                        size={16}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={mode === 'login' ? handleLogin : handleRegister}
                  activeOpacity={0.9}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={colors.primaryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                  >
                    {isLoading ? (
                      <Loader size="small" color={colors.white} variant="gradient-spinner" />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>
                          {mode === 'login' ? 'Login' : 'Register'}
                        </Text>
                        <Icon
                          name="arrow-right"
                          size={16}
                          color={colors.white}
                          style={styles.buttonIcon}
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Terms */}
                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() =>
                      navigation.navigate('WebViewScreen', {
                        url: 'https://smartkaizen.figma.site/terms',
                        title: 'Terms of Service',
                      })
                    }
                  >
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() =>
                      navigation.navigate('WebViewScreen', {
                        url: 'https://smartkaizen.figma.site/privacy',
                        title: 'Privacy Policy',
                      })
                    }
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>

      {/* Role Picker Modal */}
      <Modal
        visible={showRolePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRolePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select User Role</Text>
            <ScrollView style={styles.roleList}>
              {roleOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.roleOption,
                    role === option.id && styles.roleOptionSelected,
                  ]}
                  onPress={() => {
                    setRole(option.id);
                    setShowRolePicker(false);
                    setError('');
                  }}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      role === option.id && styles.roleOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {role === option.id && (
                    <Icon
                      name="check"
                      size={18}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowRolePicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.white,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: height * 0.65,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  fieldErrorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    marginTop: 6,
  },
  submitButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  termsText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '500',
  },
  roleSelectText: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: 16,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  roleList: {
    maxHeight: 300,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  roleOptionSelected: {
    backgroundColor: colors.statusUpcomingBg,
  },
  roleOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  roleOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default AuthScreen;
