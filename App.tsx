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
  const [canGoBack, setCanGoBack] = useState(false);
  const [isStartupScreenVisible, setIsStartupScreenVisible] = useState(true);
  const [sourceUri, setSourceUri] = useState(portalUrl);

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
    const timeoutId = setTimeout(() => {
      setIsStartupScreenVisible(false);
    }, STARTUP_MINIMUM_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

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
