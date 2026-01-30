// Components/Loader.js (WebView loader + PNG logo)
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Animated,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const BG = require('../assets/bg.webp');
const LOGO = require('../assets/logo.webp'); // <-- твой PNG с текстом внутри

const LOADER_HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <style>
    html, body { width:100%; height:100%; margin:0; background:transparent; overflow:hidden; }
    body { display:flex; align-items:center; justify-content:center; -webkit-tap-highlight-color:transparent; }

    /* From Uiverse.io by Donewenfu */
    .loader {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
    }

    .jimu-primary-loading:before,
    .jimu-primary-loading:after {
      position: absolute;
      top: 0;
      content: '';
    }

    .jimu-primary-loading:before {
      left: -30px;
    }

    .jimu-primary-loading:after {
      left: 30px;
      -webkit-animation-delay: 0.32s !important;
      animation-delay: 0.32s !important;
    }

    .jimu-primary-loading:before,
    .jimu-primary-loading:after,
    .jimu-primary-loading {
      background: #FF6B35;
      -webkit-animation: loading-keys-app-loading 0.8s infinite ease-in-out;
      animation: loading-keys-app-loading 0.8s infinite ease-in-out;
      width: 20px;
      height: 48px;
    }

    .jimu-primary-loading {
      text-indent: -9999em;
      margin: auto;
      position: absolute;
      right: calc(50% - 10px);
      top: calc(50% - 24px);
      -webkit-animation-delay: 0.16s !important;
      animation-delay: 0.16s !important;
    }

    @-webkit-keyframes loading-keys-app-loading {
      0%,
      80%,
      100% {
        opacity: .75;
        box-shadow: 0 0 #FF6B35;
        height: 48px;
      }
      40% {
        opacity: 1;
        box-shadow: 0 -12px #FF6B35;
        height: 60px;
      }
    }

    @keyframes loading-keys-app-loading {
      0%,
      80%,
      100% {
        opacity: .75;
        box-shadow: 0 0 #FF6B35;
        height: 48px;
      }
      40% {
        opacity: 1;
        box-shadow: 0 -12px #FF6B35;
        height: 60px;
      }
    }
  </style>
</head>
<body>
  <div class="loader">
    <div class="justify-content-center jimu-primary-loading"></div>
  </div>
</body>
</html>`;

const Loader = ({ navigation }) => {
  const loaderOpacity = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Анимация появления WebView loader
    Animated.timing(loaderOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // WebView loader работает 5 секунд, потом исчезает
    const t1 = setTimeout(() => {
      Animated.timing(loaderOpacity, { toValue: 0, duration: 350, useNativeDriver: true }).start();
    }, 5000);

    // После исчезновения анимации появляется лого
    const t2 = setTimeout(() => {
      Animated.timing(logoOpacity, { toValue: 1, duration: 450, useNativeDriver: true }).start();
    }, 5400);

    // Дальше: onboarding или main
    const t3 = setTimeout(async () => {
      try {
        const seen = await AsyncStorage.getItem('onboarding_seen');
        navigation.replace(seen === '1' ? 'Main' : 'Onboarding');
      } catch {
        navigation.replace('Onboarding');
      }
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [navigation, loaderOpacity, logoOpacity]);

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.dim} />

        {/* WEBVIEW LOADER */}
        <Animated.View style={[styles.center, { opacity: loaderOpacity }]}>
          <WebView
            originWhitelist={['*']}
            source={{ html: LOADER_HTML }}
            style={styles.webview}
            containerStyle={styles.webview}
            scrollEnabled={false}
            bounces={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
            opaque={false}
            {...(Platform.OS === 'ios' ? { backgroundColor: 'transparent' } : {})}
          />
        </Animated.View>

        {/* PNG LOGO */}
        <Animated.View style={[styles.center, { opacity: logoOpacity }]}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </ImageBackground>
    </View>
  );
};

export default Loader;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },

  center: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  webview: {
    width: 220,
    height: 220,
    backgroundColor: 'transparent',
  },

  // размер отображения (не "правит" PNG, просто как он стоит на экране)
  logo: {
    width: 260,
    height: 260,
    borderRadius: 25,
    overflow: 'hidden',
  },
});
