import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  SafeAreaView,
  StatusBar as NativeStatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { StartupLoadingScreen } from './src/components/startup-loading-screen';
import { portalUrl } from './src/config/portalUrl';

void SplashScreen.preventAutoHideAsync();

const androidStatusBarHeight =
  Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0;
const STARTUP_MINIMUM_MS = 1500;

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const hasHiddenNativeSplashRef = useRef(false);
  const hasMarkedAppReadyRef = useRef(false);
  const minimumVisibleUntilRef = useRef(Date.now() + STARTUP_MINIMUM_MS);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isInitialPageLoaded, setIsInitialPageLoaded] = useState(false);
  const [isStartupScreenVisible, setIsStartupScreenVisible] = useState(true);
  const [sourceUri, setSourceUri] = useState(portalUrl);
  const isAppReady = isInitialPageLoaded;

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!canGoBack) {
          return false;
        }

        webViewRef.current?.goBack();
        return true;
      },
    );

    return () => {
      subscription.remove();
    };
  }, [canGoBack]);

  useEffect(() => {
    if (!isStartupScreenVisible || !isAppReady) {
      return;
    }

    const remaining = minimumVisibleUntilRef.current - Date.now();
    if (remaining <= 0) {
      setIsStartupScreenVisible(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsStartupScreenVisible(false);
    }, remaining);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isAppReady, isStartupScreenVisible]);

  useEffect(() => {
    if (isStartupScreenVisible || hasHiddenNativeSplashRef.current) {
      return;
    }

    hasHiddenNativeSplashRef.current = true;
    void SplashScreen.hideAsync();
  }, [isStartupScreenVisible]);

  const handleStartupScreenReady = () => {
    if (hasHiddenNativeSplashRef.current) {
      return;
    }

    hasHiddenNativeSplashRef.current = true;
    void SplashScreen.hideAsync();
  };

  const markAppReady = () => {
    if (hasMarkedAppReadyRef.current) {
      return;
    }

    hasMarkedAppReadyRef.current = true;
    setIsInitialPageLoaded(true);
  };

  return (
    <View style={styles.root}>
      <ExpoStatusBar style={isStartupScreenVisible ? 'dark' : 'auto'} />
      <SafeAreaView style={styles.container}>
        <WebView
          ref={webViewRef}
          source={{ uri: sourceUri }}
          onNavigationStateChange={(navigationState: WebViewNavigation) => {
            setCanGoBack(navigationState.canGoBack);
          }}
          onOpenWindow={(event) => {
            const { targetUrl } = event.nativeEvent;

            if (targetUrl) {
              setSourceUri(targetUrl);
            }
          }}
          onLoadEnd={markAppReady}
          onError={markAppReady}
          onHttpError={markAppReady}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          javaScriptCanOpenWindowsAutomatically
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
          style={styles.webView}
        />
      </SafeAreaView>
      {isStartupScreenVisible ? (
        <StartupLoadingScreen onReadyToDisplay={handleStartupScreenReady} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: androidStatusBarHeight,
  },
  webView: {
    flex: 1,
  },
});
