import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  StatusBar, TextInput, KeyboardAvoidingView, Platform,
  ScrollView, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseconfig';

const { height } = Dimensions.get('window');

export default function SignUpScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
  });

  const [focused, setFocused] = useState({
    fullName: false, email: false, phone: false, password: false, confirmPassword: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const setFocus = (field: keyof typeof focused, value: boolean) => {
    setFocused({ ...focused, [field]: value });
  };

  const validate = () => {
    const newErrors = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' };
    let valid = true;

    if (!form.fullName.trim()) { newErrors.fullName = 'Full name is required.'; valid = false; }
    else if (form.fullName.trim().length < 3) { newErrors.fullName = 'Name must be at least 3 characters.'; valid = false; }

    if (!form.email.trim()) { newErrors.email = 'Email address is required.'; valid = false; }
    else if (!/\S+@\S+\.\S+/.test(form.email)) { newErrors.email = 'Enter a valid email address.'; valid = false; }

    if (!form.phone.trim()) { newErrors.phone = 'Phone number is required.'; valid = false; }
    else if (!/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) { newErrors.phone = 'Enter a valid phone number.'; valid = false; }

    if (!form.password) { newErrors.password = 'Password is required.'; valid = false; }
    else if (form.password.length < 8) { newErrors.password = 'Password must be at least 8 characters.'; valid = false; }
    else if (!/[A-Z]/.test(form.password)) { newErrors.password = 'Include at least one uppercase letter.'; valid = false; }
    else if (!/[0-9]/.test(form.password)) { newErrors.password = 'Include at least one number.'; valid = false; }

    if (!form.confirmPassword) { newErrors.confirmPassword = 'Please confirm your password.'; valid = false; }
    else if (form.password !== form.confirmPassword) { newErrors.confirmPassword = 'Passwords do not match.'; valid = false; }

    if (!agreedToTerms) { setTermsError('You must agree to the Terms & Privacy Policy.'); valid = false; }
    else { setTermsError(''); }

    setErrors(newErrors);
    return valid;
  };

  const getPasswordStrength = () => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: 'Weak', color: '#B71C1C', bars: 1 };
    if (score === 2) return { label: 'Fair', color: '#E65100', bars: 2 };
    if (score === 3) return { label: 'Good', color: '#F9A825', bars: 3 };
    return { label: 'Strong', color: '#2E7D32', bars: 4 };
  };

  // Firebase sign up handler
  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Step 1: Create auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email.trim(),
        form.password
      );
      const user = userCredential.user;

      // Step 2: Set display name
      await updateProfile(user, { displayName: form.fullName.trim() });

      // Step 3: Write to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        createdAt: serverTimestamp(),
        totalReports: 0,
        resolvedReports: 0,
      });

      setLoading(false);
      router.replace('/(tabs)' as any);
      useEffect(() => {
      console.log("Welcome user!");
    }, []);

    } catch (error: any) {
      setLoading(false);
      const msg: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
        'auth/network-request-failed': 'No internet connection.',
        'auth/operation-not-allowed': 'Email/password sign-up is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.',
      };
      Alert.alert('Sign Up Failed', msg[error.code] ?? `${error.message} (${error.code})`);
    }
  };

  const strength = getPasswordStrength();

  const fields: {
    key: keyof typeof form;
    label: string;
    placeholder: string;
    icon: string;
    keyboardType?: any;
    autoCapitalize?: any;
  }[] = [
    { key: 'fullName', label: 'Full Name', placeholder: 'e.g. Maria Santos', icon: 'account-outline', autoCapitalize: 'words' },
    { key: 'email', label: 'Email Address', placeholder: 'you@example.com', icon: 'email-outline', keyboardType: 'email-address', autoCapitalize: 'none' },
    { key: 'phone', label: 'Phone Number', placeholder: '+63 9XX XXX XXXX', icon: 'phone-outline', keyboardType: 'phone-pad' },
  ];

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
                <MaterialCommunityIcons name={"shield-check" as any} size={44} color="#B71C1C" />
              </View>
            </View>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSub}>Join AcciAlert and help keep roads safe</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {fields.map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={[styles.inputWrapper, focused[field.key] && styles.inputWrapperFocused, !!errors[field.key] && styles.inputWrapperError]}>
                  <MaterialCommunityIcons name={field.icon as any} size={20} color={errors[field.key] ? '#B71C1C' : focused[field.key] ? '#B71C1C' : '#bbb'} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor="#c8c8c8"
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize ?? 'none'}
                    autoCorrect={false}
                    value={form[field.key]}
                    onChangeText={(t) => update(field.key, t)}
                    onFocus={() => setFocus(field.key, true)}
                    onBlur={() => setFocus(field.key, false)}
                  />
                  {!errors[field.key] && form[field.key].length > 0 && (
                    <MaterialCommunityIcons name={"check-circle" as any} size={18} color="#2E7D32" />
                  )}
                </View>
                {!!errors[field.key] && (
                  <View style={styles.errorRow}>
                    <MaterialCommunityIcons name={"alert-circle-outline" as any} size={13} color="#B71C1C" />
                    <Text style={styles.errorText}>{errors[field.key]}</Text>
                  </View>
                )}
              </View>
            ))}

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, focused.password && styles.inputWrapperFocused, !!errors.password && styles.inputWrapperError]}>
                <MaterialCommunityIcons name={"lock-outline" as any} size={20} color={errors.password ? '#B71C1C' : focused.password ? '#B71C1C' : '#bbb'} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Min. 8 chars, 1 uppercase, 1 number" placeholderTextColor="#c8c8c8" secureTextEntry={!showPassword} autoCapitalize="none" value={form.password} onChangeText={(t) => update('password', t)} onFocus={() => setFocus('password', true)} onBlur={() => setFocus('password', false)} />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <MaterialCommunityIcons name={(showPassword ? 'eye-off-outline' : 'eye-outline') as any} size={20} color="#bbb" />
                </TouchableOpacity>
              </View>
              {strength && (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBars}>
                    {[1,2,3,4].map((n) => (
                      <View key={n} style={[styles.strengthBar, { backgroundColor: n <= strength.bars ? strength.color : '#e0e0e0' }]} />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}
              {!!errors.password && <View style={styles.errorRow}><MaterialCommunityIcons name={"alert-circle-outline" as any} size={13} color="#B71C1C" /><Text style={styles.errorText}>{errors.password}</Text></View>}
            </View>

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.inputWrapper, focused.confirmPassword && styles.inputWrapperFocused, !!errors.confirmPassword && styles.inputWrapperError, !errors.confirmPassword && form.confirmPassword.length > 0 && form.password === form.confirmPassword && styles.inputWrapperSuccess]}>
                <MaterialCommunityIcons name={"lock-check-outline" as any} size={20} color={errors.confirmPassword ? '#B71C1C' : (!errors.confirmPassword && form.confirmPassword && form.password === form.confirmPassword) ? '#2E7D32' : focused.confirmPassword ? '#B71C1C' : '#bbb'} style={styles.inputIcon} />
                <TextInput style={styles.input} placeholder="Re-enter your password" placeholderTextColor="#c8c8c8" secureTextEntry={!showConfirm} autoCapitalize="none" value={form.confirmPassword} onChangeText={(t) => update('confirmPassword', t)} onFocus={() => setFocus('confirmPassword', true)} onBlur={() => setFocus('confirmPassword', false)} />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  <MaterialCommunityIcons name={(showConfirm ? 'eye-off-outline' : 'eye-outline') as any} size={20} color="#bbb" />
                </TouchableOpacity>
              </View>
              {!!errors.confirmPassword && <View style={styles.errorRow}><MaterialCommunityIcons name={"alert-circle-outline" as any} size={13} color="#B71C1C" /><Text style={styles.errorText}>{errors.confirmPassword}</Text></View>}
              {!errors.confirmPassword && form.confirmPassword.length > 0 && form.password === form.confirmPassword && (
                <View style={styles.errorRow}><MaterialCommunityIcons name={"check-circle-outline" as any} size={13} color="#2E7D32" /><Text style={[styles.errorText, { color: '#2E7D32' }]}>Passwords match!</Text></View>
              )}
            </View>

            {/* Terms */}
            <TouchableOpacity style={styles.termsRow} onPress={() => { setAgreedToTerms(!agreedToTerms); setTermsError(''); }} activeOpacity={0.7}>
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <MaterialCommunityIcons name={"check" as any} size={14} color="#fff" />}
              </View>
              <Text style={styles.termsText}>I agree to the <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text></Text>
            </TouchableOpacity>
            {!!termsError && <View style={[styles.errorRow, { marginBottom: 8 }]}><MaterialCommunityIcons name={"alert-circle-outline" as any} size={13} color="#B71C1C" /><Text style={styles.errorText}>{termsError}</Text></View>}

            {/* Submit */}
            <TouchableOpacity style={[styles.submitButton, loading && { opacity: 0.7 }]} onPress={handleSignUp} activeOpacity={0.85} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <><MaterialCommunityIcons name={"account-plus" as any} size={20} color="#fff" /><Text style={styles.submitText}>Create Account</Text></>
              }
            </TouchableOpacity>

            {/* Login link */}
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login' as any)}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#B71C1C' },
  scroll: { flexGrow: 1 },
  headerBlock: { backgroundColor: '#B71C1C', paddingTop: 16, paddingBottom: 44, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  bgCircle1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(255,255,255,0.05)', top: -90, right: -60 },
  bgCircle2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.05)', top: 30, left: -50 },
  backButton: { position: 'absolute', top: 16, left: 20, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  logoWrapper: { marginTop: 12, marginBottom: 14 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 5 },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 36, flex: 1 },
  fieldGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 8, letterSpacing: 0.3 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 12, borderWidth: 1.5, borderColor: '#ececec', paddingHorizontal: 14, height: 52 },
  inputWrapperFocused: { borderColor: '#B71C1C', backgroundColor: '#fff', shadowColor: '#B71C1C', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  inputWrapperError: { borderColor: '#B71C1C', backgroundColor: '#fff5f5' },
  inputWrapperSuccess: { borderColor: '#2E7D32', backgroundColor: '#f1f8f1' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#1a1a1a', height: '100%' },
  eyeBtn: { padding: 4, marginLeft: 4 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  errorText: { fontSize: 12, color: '#B71C1C', fontWeight: '500' },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  strengthBars: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontWeight: '700', width: 48, textAlign: 'right' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16, marginTop: 4 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#ddd', backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: '#B71C1C', borderColor: '#B71C1C' },
  termsText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 20 },
  termsLink: { color: '#B71C1C', fontWeight: '700' },
  submitButton: { backgroundColor: '#B71C1C', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 14, gap: 8, shadowColor: '#B71C1C', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5, marginBottom: 24 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginPrompt: { fontSize: 14, color: '#888' },
  loginLink: { fontSize: 14, fontWeight: '800', color: '#B71C1C', textDecorationLine: 'underline' },
});