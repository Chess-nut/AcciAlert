import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const { height } = Dimensions.get('window');

export default function GettingStartedScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#C0392B" />

      {/* Background decorative circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Logo card */}
      <View style={styles.logoCard}>
        <View style={styles.pulseRing} />
        <View style={styles.iconInner}>
          <MaterialCommunityIcons name="shield-check" size={72} color="#E74C3C" />
        </View>
      </View>

      {/* Title block */}
      <View style={styles.titleBlock}>
        <Text style={styles.appName}>AcciAlert</Text>
        <Text style={styles.tagline}>Road Safety & Emergency Response</Text>
        <View style={styles.divider} />
        <Text style={styles.description}>
          Report accidents, alert authorities, and{'\n'}
          keep your community safe — instantly.
        </Text>
      </View>

      {/* Feature pills */}
      <View style={styles.pillRow}>
        {['GPS Tracking', 'Real-time Alerts', 'Verified Reports'].map((item) => (
          <View key={item} style={styles.pill}>
            <Text style={styles.pillText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* CTA Button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={() => navigation?.navigate('Home') ?? console.log('Get Started')}
        >
          <MaterialCommunityIcons name="arrow-right-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.7}
          onPress={() => console.log('Sign In')}
        >
          <Text style={styles.secondaryButtonText}>Already have an account? <Text style={styles.signInLink}>Sign In</Text></Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        By continuing, you agree to our Terms of Service & Privacy Policy
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B71C1C',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },

  /* Background decoration */
  bgCircle1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 60,
    left: -60,
  },
  bgCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: height * 0.35,
    right: -30,
  },

  /* Badge */
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 32,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 0.3,
  },

  /* Logo */
  logoCard: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  /* Title block */
  titleBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    marginVertical: 16,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
  },

  /* Feature pills */
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 36,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  pillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  /* Buttons */
  buttonWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },
  signInLink: {
    color: '#fff',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  /* Footer */
  footer: {
    position: 'absolute',
    bottom: 24,
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
