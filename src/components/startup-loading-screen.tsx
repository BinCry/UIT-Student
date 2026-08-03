import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

const startupLogo = require('../../assets/startup-logo.png');

const MIN_LOGO_WIDTH = 220;
const MAX_LOGO_WIDTH = 360;
const HORIZONTAL_PADDING = 24;
const ENTRANCE_DURATION_MS = 1200;
const GLOW_CYCLE_DURATION_MS = 1200;

interface StartupLoadingScreenProps {
  onReadyToDisplay?: () => void;
}

export function StartupLoadingScreen({
  onReadyToDisplay,
}: StartupLoadingScreenProps) {
  const { width, height } = useWindowDimensions();
  const hasSignaledReadyRef = useRef(false);
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.95)).current;
  const glowOpacity = useRef(new Animated.Value(0.18)).current;
  const glowScale = useRef(new Animated.Value(0.94)).current;

  const signalReadyToDisplay = () => {
    if (hasSignaledReadyRef.current) {
      return;
    }

    hasSignaledReadyRef.current = true;
    onReadyToDisplay?.();
  };

  useEffect(() => {
    const entranceAnimation = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: ENTRANCE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: ENTRANCE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    const glowPulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.32,
            duration: GLOW_CYCLE_DURATION_MS / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 1.04,
            duration: GLOW_CYCLE_DURATION_MS / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowOpacity, {
            toValue: 0.18,
            duration: GLOW_CYCLE_DURATION_MS / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowScale, {
            toValue: 0.94,
            duration: GLOW_CYCLE_DURATION_MS / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    entranceAnimation.start();
    glowPulseAnimation.start();

    return () => {
      entranceAnimation.stop();
      glowPulseAnimation.stop();
      logoOpacity.stopAnimation();
      logoScale.stopAnimation();
      glowOpacity.stopAnimation();
      glowScale.stopAnimation();
    };
  }, [glowOpacity, glowScale, logoOpacity, logoScale]);

  const logoWidth = Math.max(
    MIN_LOGO_WIDTH,
    Math.min(
      width * 0.62,
      width - HORIZONTAL_PADDING * 2,
      height * 0.34,
      MAX_LOGO_WIDTH,
    ),
  );
  const glowSize = Math.max(logoWidth * 0.72, 180);

  return (
    <View
      style={styles.screen}
      testID="startup-loading-screen"
      onLayout={signalReadyToDisplay}
    >
      <View style={styles.stage}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowPrimary,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowSecondary,
            {
              width: glowSize * 0.7,
              height: glowSize * 0.7,
              borderRadius: (glowSize * 0.7) / 2,
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.logoWrap,
            {
              width: logoWidth,
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            accessibilityLabel="UIT startup logo"
            resizeMode="contain"
            source={startupLogo}
            style={styles.logo}
            testID="startup-loading-logo"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowPrimary: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 191, 255, 0.18)',
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 10,
  },
  glowSecondary: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 234, 255, 0.16)',
    shadowColor: '#00EAFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  logoWrap: {
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
  },
  logo: {
    height: '100%',
    width: '100%',
  },
});
