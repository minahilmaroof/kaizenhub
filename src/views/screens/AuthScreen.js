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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome6';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your name');
        return false;
      }
    }

    if (!email.trim()) {
      setError('Please enter your email address');
      return false;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    return true;
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
        ...(phone.trim() && { phone: phone.trim() }),
        ...(company.trim() && { company: company.trim() }),
        ...(role && { role }),
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

  const handleSendOTP = async () => {
    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.sendOTP(email.trim().toLowerCase());
      console.log('response------', response);
      if (response.success) {
        // Navigate to OTP screen
        navigation.navigate('OTPScreen', { email: email.trim().toLowerCase() });
      } else {
        setError(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
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
                      setError('');
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
                      setError('');
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
                        error && styles.inputError,
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
                          setName(text);
                          setError('');
                        }}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
                  </View>
                )}

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View
                    style={[styles.inputContainer, error && styles.inputError]}
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
                        setEmail(text);
                        setError('');
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View
                    style={[styles.inputContainer, error && styles.inputError]}
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
                        setPassword(text);
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
                </View>

                {/* Phone Input (Register only) */}
                {mode === 'register' && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone (Optional)</Text>
                    <View style={styles.inputContainer}>
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
                          setPhone(text);
                          setError('');
                        }}
                        keyboardType="phone-pad"
                        editable={!isLoading}
                      />
                    </View>
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
                          setCompany(text);
                          setError('');
                        }}
                        autoCapitalize="words"
                        editable={!isLoading}
                      />
                    </View>
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
                      <ActivityIndicator color={colors.white} />
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

                {/* OTP Login Option */}
                <TouchableOpacity
                  onPress={handleSendOTP}
                  style={styles.otpButton}
                  disabled={isLoading}
                >
                  <Text style={styles.otpButtonText}>
                    Continue with OTP instead
                  </Text>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Buttons */}
                <View style={styles.socialContainer}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.googleIcon}>G</Text>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.appleIcon}></Text>
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </TouchableOpacity>
                </View>

                {/* Terms */}
                <Text style={styles.termsText}>
                  By continuing, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
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
  otpButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  otpButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 8,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 14,
    marginHorizontal: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EA4335',
    marginRight: 8,
  },
  appleIcon: {
    fontSize: 20,
    color: colors.black,
    marginRight: 8,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
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
});

export default AuthScreen;
