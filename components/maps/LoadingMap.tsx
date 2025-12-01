import { FONT_SIZES } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Loader2, MapPin } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View
} from 'react-native';

export function LoadingMap() {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const floatValue = useRef(new Animated.Value(0)).current;

  // Animación de spin del loader
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Animación de pulso del pin
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animación de flotación
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatValue, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const translateY = floatValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <LinearGradient
      colors={['#ecfeff', '#ccfbf1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        {/* Background effects */}
        <View style={styles.backgroundEffects}>
          <View style={styles.rippleEffect} />
          <View style={[styles.rippleEffect, styles.rippleEffect2]} />
          <View style={[styles.rippleEffect, styles.rippleEffect3]} />
        </View>

        {/* Main pin with animations */}
        <View style={styles.pinContainer}>
          <Animated.View
            style={[
              styles.pinCircle,
              {
                transform: [{ scale: pulseValue }],
              },
            ]}
          >
            <LinearGradient
              colors={['#22d3ee', '#0ea5e9']}
              style={styles.pinGradient}
            >
              <MapPin size={40} color="#ffffff" strokeWidth={1.5} />
            </LinearGradient>

            {/* Animated rings */}
            <View style={styles.ringContainer}>
              <Animated.View style={styles.ring} />
              <Animated.View style={[styles.ring, styles.ring2]} />
            </View>
          </Animated.View>

          {/* Loading spinner */}
          <Animated.View
            style={[
              styles.loaderContainer,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <LinearGradient
              colors={['#ffffff', '#f0f9ff']}
              style={styles.loaderCircle}
            >
              <Loader2 size={20} color="#0891b2" />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Text content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Cargando mapa</Text>
          <Text style={styles.subtitle}>La Paz, Bolivia</Text>
          
          {/* Loading dots animation */}
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    opacity: floatValue.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 0.3],
                    }),
                    transform: [
                      {
                        translateY: floatValue.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, -4, 0],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Additional decorative elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.decorativeDot, styles.decorativeDot1]} />
        <View style={[styles.decorativeDot, styles.decorativeDot2]} />
        <View style={[styles.decorativeDot, styles.decorativeDot3]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundEffects: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rippleEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  rippleEffect2: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
  },
  rippleEffect3: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(34, 211, 238, 0.02)',
  },
  pinContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  pinCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22d3ee',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  ringContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(34, 211, 238, 0.3)',
  },
  ring2: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
  },
  loaderCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: '#155e75',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: '#0e7490',
    marginBottom: 20,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0891b2',
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  decorativeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(34, 211, 238, 0.3)',
  },
  decorativeDot1: {
    top: '20%',
    left: '15%',
  },
  decorativeDot2: {
    top: '40%',
    right: '10%',
  },
  decorativeDot3: {
    bottom: '30%',
    left: '25%',
  },
});