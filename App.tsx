import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  SafeAreaView,
  StatusBar as NativeStatusBar,
  StyleSheet,
} from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';

import { portalUrl } from './src/config/portalUrl';

const androidStatusBarHeight =
  Platform.OS === 'android' ? NativeStatusBar.currentHeight ?? 0 : 0;

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="auto" />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: androidStatusBarHeight,
  },
  webView: {
    flex: 1,
  },
});
