import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  StatusBar, TextInput, KeyboardAvoidingView, Platform,
  ScrollView, Dimensions, ActivityIndicator, Alert, Modal, Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseconfig';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailError, setResetEmailError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // ─── Login ────────────────────────────────────────────────────────────────
  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setIsError(false);
    if (!email.trim()) { setEmailError('Email is required.'); valid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Enter a valid email address.'); valid = false; }
    if (!password) { setPasswordError('Password is required.'); valid = false; }
    else if (password.length < 6) { setPasswordError('Password must be at least 6 characters.'); valid = false; }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setIsError(true);
        return;
      }
      const msg: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/too-many-requests': 'Too many failed attempts. Try again later.',
        'auth/network-request-failed': 'No internet connection. Please try again.',
        'auth/invalid-email': 'Invalid email address.',
      };
      Alert.alert('Login Failed', msg[error.code] ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password ──────────────────────────────────────────────────────
  const openForgotModal = () => {
    // Pre-fill reset email if user already typed one on login screen
    setResetEmail(email.trim());
    setResetEmailError('');
    setResetSent(false);
    setForgotModalVisible(true);
  };

  const closeForgotModal = () => {
    setForgotModalVisible(false);
    setResetEmail('');
    setResetEmailError('');
    setResetSent(false);
  };

  const handleSendReset = async () => {
    setResetEmailError('');
    if (!resetEmail.trim()) {
      setResetEmailError('Please enter your email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      setResetEmailError('Enter a valid email address.');
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetSent(true);
    } catch (error: any) {
      const msg: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/too-many-requests': 'Too many requests. Please try again later.',
        'auth/network-request-failed': 'No internet connection.',
      };
      setResetEmailError(msg[error.code] ?? error.message);
    } finally {
      setResetLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#B71C1C" />

      {/* ── Forgot Password Modal ── */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeForgotModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {!resetSent ? (
              /* ── Step 1: Enter email ── */
              <>
                <View style={styles.modalIconRow}>
                  <View style={styles.modalIconCircle}>
                    <MaterialCommunityIcons name="lock-reset" size={32} color="#B71C1C" />
                  </View>
                </View>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalSubtitle}>
                  Enter the email address linked to your account and we'll send you a reset link.
                </Text>

                <Text style={styles.modalLabel}>Email Address</Text>
                <View style={[styles.modalInputWrapper, !!resetEmailError && styles.modalInputError]}>
                  <MaterialCommunityIcons
                    name="email-outline" size={18}
                    color={resetEmailError ? '#B71C1C' : '#aaa'}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="you@example.com"
                    placeholderTextColor="#c0c0c0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={resetEmail}
                    onChangeText={(t) => { setResetEmail(t); setResetEmailError(''); }}
                  />
                </View>
                {!!resetEmailError && (
                  <View style={styles.modalErrorRow}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={13} color="#B71C1C" />
                    <Text style={styles.modalErrorText}>{resetEmailError}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.modalSendBtn, resetLoading && { opacity: 0.7 }]}
                  onPress={handleSendReset}
                  disabled={resetLoading}
                  activeOpacity={0.85}
                >
                  {resetLoading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.modalSendBtnText}>Send Reset Link</Text>
                  }
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalCancelBtn} onPress={closeForgotModal}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* ── Step 2: Success state ── */
              <>
                <View style={styles.modalIconRow}>
                  <View style={[styles.modalIconCircle, { backgroundColor: '#e8f5e9' }]}>
                    <MaterialCommunityIcons name="email-check-outline" size={32} color="#2E7D32" />
                  </View>
                </View>
                <Text style={styles.modalTitle}>Email Sent!</Text>
                <Text style={styles.modalSubtitle}>
                  We sent a password reset link to{'\n'}
                  <Text style={styles.resetEmailHighlight}>{resetEmail}</Text>
                  {'\n\n'}Check your inbox (and spam folder) and follow the link to reset your password.
                </Text>

                <TouchableOpacity
                  style={[styles.modalSendBtn, { backgroundColor: '#2E7D32' }]}
                  onPress={closeForgotModal}
                  activeOpacity={0.85}
                >
                  <MaterialCommunityIcons name="check" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSendBtnText}>Done</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { setResetSent(false); setResetEmail(''); }}>
                  <Text style={styles.modalCancelText}>Use a different email</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ── Main Login Screen ── */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.headerBlock}>
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialCommunityIcons name={"arrow-left" as any} size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.logoWrapper}>
              <View style={styles.logoCircle}>
                <MaterialCommunityIcons name={"shield-check" as any} size={48} color="#B71C1C" />
              </View>
            </View>
            <Text style={styles.welcomeBack}>Welcome Back</Text>
            <Text style={styles.headerSub}>Sign in to your AcciAlert account</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused, !!emailError && styles.inputWrapperError]}>
              <MaterialCommunityIcons name={"email-outline" as any} size={20} color={emailError ? '#B71C1C' : emailFocused ? '#B71C1C' : '#aaa'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#c0c0c0"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
            {!!emailError && (
              <View style={styles.errorRow}>
                <MaterialCommunityIcons name={"alert-circle-outline" as any} size={13} color="#B71C1C" />
                <Text style={styles.errorText}>{emailError}</Text>
              </View>
            )}

            {/* Password */}
            <Text style={[styles.label, { marginTop: 18 }]}>Password</Text>
            <View
              style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
                !!passwordError && styles.inputWrapperError,
                isError && styles.passwordInlineErrorWrapper,
              ]}
            >
              <MaterialCommunityIcons name={"lock-outline" as any} size={20} color={(passwordError || isError) ? '#B71C1C' : passwordFocused ? '#B71C1C' : '#aaa'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#c0c0c0"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => { setPassword(t); setPasswordError(''); setIsError(false); }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <MaterialCommunityIcons name={(showPassword ? 'eye-off-outline' : 'eye-outline') as any} size={20} color="#aaa" />
              </TouchableOpacity>
            </View>
            <View style={styles.passwordMetaRow}>
              {(isError || !!passwordError) ? (
                <Text style={styles.inlineErrorText}>
                  {isError ? 'Incorrect password. Please try again.' : passwordError}
                </Text>
              ) : <View />}

              <Pressable onPress={openForgotModal} hitSlop={8}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <>
                    <MaterialCommunityIcons name={"login" as any} size={20} color="#fff" />
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name={"google" as any} size={22} color="#EA4335" />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name={"facebook" as any} size={22} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Sign up link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupPrompt}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup' as any)}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.footer}>By signing in, you agree to our Terms of Service & Privacy Policy</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#B71C1C' },
  scroll: { flexGrow: 1 },

  // ── Modal ──────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconRow: { marginBottom: 16 },
  modalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffcdd2',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resetEmailHighlight: {
    color: '#B71C1C',
    fontWeight: '700',
  },
  modalLabel: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ececec',
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 6,
  },
  modalInputError: {
    borderColor: '#B71C1C',
    backgroundColor: '#fff5f5',
  },
  modalInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  modalErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 16,
  },
  modalErrorText: {
    fontSize: 12,
    color: '#B71C1C',
    fontWeight: '500',
  },
  modalSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B71C1C',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    gap: 6,
    shadowColor: '#B71C1C',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSendBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  modalCancelBtn: {
    marginTop: 14,
    paddingVertical: 6,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '600',
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  headerBlock: { backgroundColor: '#B71C1C', paddingTop: 16, paddingBottom: 40, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  bgCircle1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,255,255,0.05)', top: -100, right: -80 },
  bgCircle2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)', top: 40, left: -60 },
  backButton: { position: 'absolute', top: 16, left: 20, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  logoWrapper: { marginTop: 12, marginBottom: 16 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  welcomeBack: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },

  // ── Card ───────────────────────────────────────────────────────────────────
  card: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, minHeight: height * 0.62 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f4f8ff', borderRadius: 12, borderWidth: 1.5, borderColor: '#dfe7f3', paddingHorizontal: 14, height: 52 },
  inputWrapperFocused: { borderColor: '#B71C1C', backgroundColor: '#f9fbff', shadowColor: '#B71C1C', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  inputWrapperError: { borderColor: '#B71C1C', backgroundColor: '#fff5f5' },
  passwordInlineErrorWrapper: { borderColor: '#B71C1C', borderWidth: 1, backgroundColor: '#f4f8ff' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1a1a1a', height: '100%' },
  eyeButton: { padding: 4, marginLeft: 6 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  errorText: { fontSize: 12, color: '#B71C1C', fontWeight: '500' },
  passwordMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 24 },
  inlineErrorText: { flex: 1, fontSize: 11, color: '#B71C1C', fontWeight: '500', marginRight: 10 },
  forgotText: { fontSize: 12, color: '#B71C1C', fontWeight: '700' },
  loginButton: { backgroundColor: '#B71C1C', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 14, gap: 8, shadowColor: '#B71C1C', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#eee' },
  dividerText: { fontSize: 12, color: '#bbb', fontWeight: '600' },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#ececec', backgroundColor: '#fafafa' },
  socialText: { fontSize: 14, fontWeight: '700', color: '#333' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupPrompt: { fontSize: 14, color: '#888' },
  signupLink: { fontSize: 14, fontWeight: '800', color: '#B71C1C', textDecorationLine: 'underline' },
  footer: { backgroundColor: '#fff', textAlign: 'center', fontSize: 10, color: '#ccc', paddingHorizontal: 24, paddingBottom: 24 },
});