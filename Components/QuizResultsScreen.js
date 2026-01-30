// Components/QuizResultsScreen.js
// ✅ Result texts EXACTLY by ranges: 0–4 / 5–8 / 9–12
// Assets (.webp):
// - assets/bg.webp
// - assets/quiz_result_low.webp
// - assets/quiz_result_mid.webp
// - assets/quiz_result_high.webp

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/bg.webp');
const BACK_ICON = require('../assets/back.webp');

const RESULT_LOW = require('../assets/quiz_result_low.webp');
const RESULT_MID = require('../assets/quiz_result_mid.webp');
const RESULT_HIGH = require('../assets/quiz_result_high.webp');

const CONTINUE_ROUTE_DEFAULT = 'CategoriesScreen';
const QUIZ_ROUTE = 'QuizScreen';

const COLORS = {
  dim: 'rgba(0,0,0,0.18)',
  panelTop: '#FF6B35',
  panelBottom: '#CC5500',
};

function CircleBack({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.backBtn}>
      <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
    </TouchableOpacity>
  );
}

export default function QuizResultsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();

  // ✅ safe-area для контента (чтобы кнопка/текст не лезли под home-indicator)
  const SAFE_CONTENT_BOTTOM = Math.max(insets.bottom, 18);

  // ✅ "уходим" ПОД линию (делаем немного больше, чем insets.bottom)
  const UNDERLAP =
    Platform.OS === 'ios'
      ? Math.max(insets.bottom, 24) + 18
      : Math.max(insets.bottom, 0);

  // ✅ высота панели (чтобы была "как в примере", и +UNDERLAP чтобы градиент дотянулся вниз)
  const PANEL_MIN_HEIGHT = 260 + SAFE_CONTENT_BOTTOM + UNDERLAP;

  const correct = Number(route?.params?.correct ?? 0);
  const total = Number(route?.params?.total ?? 12);
  const continueRoute = route?.params?.continueRoute || CONTINUE_ROUTE_DEFAULT;

  const resultImage = useMemo(() => {
    if (correct <= 4) return RESULT_LOW;
    if (correct <= 8) return RESULT_MID;
    return RESULT_HIGH;
  }, [correct]);

  const resultTitle = useMemo(() => `You score :  ${correct}/${total}`, [correct, total]);

  // ✅ EXACT texts by ranges (0–4 / 5–8 / 9–12)
  const resultText = useMemo(() => {
    if (correct <= 4) {
      return 'You are just beginning to discover the city.\nTake your time and explore Lugano at your own pace.';
    }
    if (correct <= 8) {
      return 'You know many of Lugano’s highlights.\nA few more discoveries will complete the picture.';
    }
    return 'You truly understand the rhythm and atmosphere of the city.\nLugano feels familiar to you.';
  }, [correct]);

  const leftBtn = correct <= 4 ? 'Start Exploring' : 'Continue Exploring';

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground
        source={BG}
        style={styles.bg}
        resizeMode="cover"
        blurRadius={Platform.OS === 'ios' ? 14 : 10}
      >
        <View style={styles.dim} />

        <View style={[styles.resultTop, { paddingTop: insets.top + 10, paddingHorizontal: 16 }]}>
          <CircleBack 
            onPress={() => {
              // Проверяем, можем ли вернуться назад, иначе переходим на QuizMain
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('QuizMain');
              }
            }} 
          />
        </View>

        <View style={[styles.resultHero, { paddingTop: insets.top + 14, paddingBottom: PANEL_MIN_HEIGHT - 30 }]}>
          <Image source={resultImage} style={styles.resultAssistant} resizeMode="contain" />
        </View>

        <LinearGradient
          colors={[COLORS.panelTop, COLORS.panelBottom]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.bottomPanel,
            {
              bottom: -UNDERLAP, // <<< ключ: за нижнюю линию
              minHeight: PANEL_MIN_HEIGHT,
              paddingBottom: SAFE_CONTENT_BOTTOM + 18, // контент выше safe-area
            },
          ]}
        >
          {/* блеск */}
          <LinearGradient
            colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.00)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gloss}
            pointerEvents="none"
          />

          <View style={[styles.content, { paddingTop: 18 }]}>
            <Text style={styles.resultScore}>{resultTitle}</Text>
            <Text style={styles.resultDesc}>{resultText}</Text>

            <View style={styles.resultBtnsRow}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  // Выходим из QuizStack и возвращаемся на последний экран где был пользователь до квиза
                  const parent = navigation.getParent();
                  if (parent) {
                    parent.goBack();
                  } else {
                    navigation.navigate('Main');
                  }
                }}
                style={[styles.secondaryBtnWrap, { flex: 1 }]}
              >
                <View style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>{leftBtn}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  // Квиз сразу начинается без intro
                  navigation.replace('QuizMain', { continueRoute, startAtQuiz: true, _ts: Date.now() });
                }}
                style={[styles.secondaryBtnWrap, { flex: 1 }]}
              >
                <View style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Start Again</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.dim },

  backBtn: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 11,
    elevation: 11, // для Android
  },
  backIcon: { width: 38, height: 38, tintColor: '#fff' },

  resultTop: { 
    flexDirection: 'row', 
    alignItems: 'center',
    zIndex: 10,
    position: 'relative',
  },
  resultHero: { 
    flex: 1, 
    justifyContent: 'flex-end', 
    alignItems: 'center',
    zIndex: 1,
    position: 'relative',
  },
  resultAssistant: { width: '150%', height: '150%', top: 70, },

  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: 0,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    overflow: 'hidden',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(215,197,138,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.26,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
    zIndex: 5, // Панель поверх ассистента
  },
  gloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 26,
  },
  content: {
    paddingHorizontal: 22,
  },

  resultScore: { color: '#fff', fontSize: 34, fontWeight: '900', marginBottom: 8 },
  resultDesc: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 18,
  },

  resultBtnsRow: { flexDirection: 'row', gap: 14, marginTop: 8 },
  secondaryBtnWrap: { alignItems: 'center' },
  secondaryBtn: {
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(215,197,138,0.80)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center' },
});
