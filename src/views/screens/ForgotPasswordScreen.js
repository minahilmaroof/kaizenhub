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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Formik } from 'formik';
import * as Yup from 'yup';

const { height } = Dimensions.get('window');

const forgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleResetPassword = values => {
    setIsLoading(true);
    setSubmittedEmail(values.email);
    // TODO: Implement actual password reset logic
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      console.log('Password reset requested for:', values.email);
    }, 1500);
  };

  const handleBackToLogin = () => {
    navigation.navigate('AuthScreen');
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#4A7CFF', '#7C3AED', '#9B59B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.successContainer}>
              <View style={styles.successCard}>
                <View style={styles.successIconContainer}>
                  <Text style={styles.successIcon}>✉️</Text>
                </View>
                <Text style={styles.successTitle}>Check Your Email</Text>
                <Text style={styles.successMessage}>
                  We've sent a password reset link to{'\n'}
                  <Text style={styles.emailHighlight}>{submittedEmail}</Text>
                </Text>
                <Text style={styles.successNote}>
                  Didn't receive the email? Check your spam folder or try again.
                </Text>

                <TouchableOpacity
                  onPress={handleBackToLogin}
                  activeOpacity={0.9}
                  style={styles.fullWidth}>
                  <LinearGradient
                    colors={['#4A7CFF', '#9B59B6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}>
                    <Text style={styles.submitButtonText}>Back to Login</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4A7CFF', '#7C3AED', '#9B59B6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={handleBackToLogin}
                  style={styles.backButton}>
                  <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.logo}>KaizenHub</Text>
                <Text style={styles.tagline}>Your Coworking Space Companion</Text>
              </View>

              {/* White Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.lockIcon}>🔐</Text>
                  </View>
                  <Text style={styles.title}>Forgot Password?</Text>
                  <Text style={styles.subtitle}>
                    No worries! Enter your email address and we'll send you a
                    link to reset your password.
                  </Text>
                </View>

                {/* Form */}
                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={forgotPasswordValidationSchema}
                  onSubmit={handleResetPassword}>
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                  }) => (
                    <View style={styles.formContent}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <View
                          style={[
                            styles.inputContainer,
                            touched.email && errors.email && styles.inputError,
                          ]}>
                          <Text style={styles.inputIcon}>✉️</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            placeholderTextColor="#9CA3AF"
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        </View>
                        {touched.email && errors.email && (
                          <Text style={styles.errorText}>{errors.email}</Text>
                        )}
                      </View>

                      <TouchableOpacity
                        onPress={handleSubmit}
                        activeOpacity={0.9}>
                        <LinearGradient
                          colors={['#4A7CFF', '#9B59B6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.submitButton}>
                          <Text style={styles.submitButtonText}>
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.backToLoginButton}
                        onPress={handleBackToLogin}>
                        <Text style={styles.backToLoginText}>
                          Remember your password?{' '}
                          <Text style={styles.loginLink}>Login</Text>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
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
    paddingTop: 20,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    color: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    minHeight: height * 0.65,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  formContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  backToLoginButton: {
    alignItems: 'center',
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    color: '#4A7CFF',
    fontWeight: '600',
  },
  // Success state styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  emailHighlight: {
    color: '#4A7CFF',
    fontWeight: '600',
  },
  successNote: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  fullWidth: {
    width: '100%',
  },
});

export default ForgotPasswordScreen;
