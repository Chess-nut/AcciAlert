import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  StatusBar, TextInput, KeyboardAvoidingView, Platform,
  ScrollView, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseconfig';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');
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
      // ✅ Navigates into the (tabs) route group → lands on (tabs)/index
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      const msg: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many failed attempts. Try again later.',
        'auth/network-request-failed': 'No internet connection. Please try again.',
        'auth/invalid-email': 'Invalid email address.',
      };
      Alert.alert('Login Failed', msg[error.code] ?? error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Reset Password', 'Please enter your email address first, then tap Forgot Password.');
      return;
    }
    Alert.alert(
      'Reset Password',
      `Send a password reset email to ${email.trim()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await sendPasswordResetEmail(auth, email.trim());
              Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#B71C1C" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.headerBlock}>
            <View style={styles.bgCircle1} /><View style={styles.bgCircle2} />
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
              <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor="#c0c0c0" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={(t) => { setEmail(t); setEmailError(''); }} onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} />
            </View>
            {!!emailError && <View style={styles.errorRow}><MaterialCommunityIcons name={"alert-circle-outline" as any} size={13} color="#B71C1C" /><Text style={styles.errorText}>{emailError}</Text></View>}

            {/* Password */}
            <Text style={[styles.label, { marginTop: 18 }]}>Password</Text>
            <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused, !!passwordError && styles.inputWrapperError]}>
              <MaterialCommunityIcons name={"lock-outline" as any} size={20} color={passwordError ? '#B71C1C' : passwordFocused ? '#B71C1C' : '#aaa'} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor="#c0c0c0" secureTextEntry={!showPassword} value={password} onChangeText={(t) => { setPassword(t); setPasswordError(''); }} onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <MaterialCommunityIcons name={(showPassword ? 'eye-off-outline' : 'eye-outline') as any} size={20} color="#aaa" />
              </TouchableOpacity>
            </View>
            {!!passwordError && <View style={styles.errorRow}><MaterialCommunityIcons name={"alert-circle-outline" as any} size={13} color="#B71C1C" /><Text style={styles.errorText}>{passwordError}</Text></View>}

            <TouchableOpacity style={styles.forgotRow} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity style={[styles.loginButton, loading && { opacity: 0.7 }]} onPress={handleLogin} activeOpacity={0.85} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><MaterialCommunityIcons name={"login" as any} size={20} color="#fff" /><Text style={styles.loginButtonText}>Sign In</Text></>
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
  headerBlock: { backgroundColor: '#B71C1C', paddingTop: 16, paddingBottom: 40, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  bgCircle1: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(255,255,255,0.05)', top: -100, right: -80 },
  bgCircle2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)', top: 40, left: -60 },
  backButton: { position: 'absolute', top: 16, left: 20, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  logoWrapper: { marginTop: 12, marginBottom: 16 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  welcomeBack: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, flex: 1, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24, minHeight: height * 0.62 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 12, borderWidth: 1.5, borderColor: '#ececec', paddingHorizontal: 14, height: 52 },
  inputWrapperFocused: { borderColor: '#B71C1C', backgroundColor: '#fff', shadowColor: '#B71C1C', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  inputWrapperError: { borderColor: '#B71C1C', backgroundColor: '#fff5f5' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1a1a1a', height: '100%' },
  eyeButton: { padding: 4, marginLeft: 6 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  errorText: { fontSize: 12, color: '#B71C1C', fontWeight: '500' },
  forgotRow: { alignSelf: 'flex-end', marginTop: 12, marginBottom: 24 },
  forgotText: { fontSize: 13, color: '#B71C1C', fontWeight: '700' },
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