// Components/OnboardingScreen.js
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/bg.webp');

const ASSIST_1 = require('../assets/onb_1.webp');
const ASSIST_2 = require('../assets/onb_2.webp');
const ASSIST_3 = require('../assets/onb_3.webp');
const ASSIST_4 = require('../assets/onb_4.webp');

const SLIDES = [
  { id: 's1', title: 'Feel the City', body: 'Discover the atmosphere, rhythm,\nand beauty of Lugano.', image: ASSIST_1, cta: 'Next' },
  { id: 's2', title: 'Explore the City', body: 'Places, cafés, and city highlights —\nsimple and offline.', image: ASSIST_2, cta: 'Next' },
  { id: 's3', title: 'Play & Learn', body: 'Fun quizzes,\nand interesting facts about the city.', image: ASSIST_3, cta: 'Next' },
  { id: 's4', title: 'Ready to Start?', body: 'Save your favorite places\nand explore Lugano your way.', image: ASSIST_4, cta: 'Start Exploring' },
];

const COLORS = {
  text: '#FFFFFF',
  text2: 'rgba(255,255,255,0.86)',
  gold: '#D7C58A',

  // оранжевая панель
  panelTop: '#FF6B35',
  panelBottom: '#CC5500',

  // оранжевая кнопка
  btnTop: 'rgba(255, 140, 66, 0.95)',
  btnBottom: 'rgba(255, 107, 53, 0.95)',
};

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [idx, setIdx] = useState(0);

  const slide = useMemo(() => SLIDES[idx], [idx]);

  const onNext = useCallback(async () => {
    if (idx < SLIDES.length - 1) {
      setIdx(v => v + 1);
      return;
    }
    try {
      await AsyncStorage.setItem('onboarding_seen', '1');
    } catch (e) {}
    navigation.replace('Main');
  }, [idx, navigation]);

  // ✅ safe-area для контента (чтобы кнопка/текст не лезли под home-indicator)
  const SAFE_CONTENT_BOTTOM = Math.max(insets.bottom, 18);

  // ✅ “уходим” ПОД линию (делаем немного больше, чем insets.bottom)
  const UNDERLAP =
    Platform.OS === 'ios'
      ? Math.max(insets.bottom, 24) + 18
      : Math.max(insets.bottom, 0);

  // ✅ высота панели (чтобы была “как в примере”, и +UNDERLAP чтобы градиент дотянулся вниз)
  const PANEL_MIN_HEIGHT = 260 + SAFE_CONTENT_BOTTOM + UNDERLAP;

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.dim} />

        {/* ассистент */}
        <View style={[styles.heroWrap, { paddingTop: insets.top + 14, paddingBottom: PANEL_MIN_HEIGHT - 30 }]}>
          <Image source={slide.image} style={styles.heroImg} resizeMode="contain" />
        </View>

        {/* ✅ панель: ВПРИТЫК к кромке + уходит ниже home-indicator */}
        <LinearGradient
          colors={[COLORS.panelTop, COLORS.panelBottom]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[
            styles.card,
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
            <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.88}>
              {slide.title}
            </Text>

            <Text style={styles.body}>{slide.body}</Text>

            <TouchableOpacity activeOpacity={0.9} onPress={onNext} style={styles.btn}>
              <LinearGradient
                colors={[COLORS.btnTop, COLORS.btnBottom]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.btnInner}
              >
                <Text style={styles.btnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9}>
                  {slide.cta}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },

  heroWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  heroImg: { width: '94%', height: '100%', top:40,},

  card: {
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
  },

  gloss: { position: 'absolute', left: 0, right: 0, top: 0, height: 26 },

  content: {
    width: '100%',
    paddingHorizontal: 22,
    alignItems: 'center',
  },

  title: {
    color: COLORS.text,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 0.2,
  },

  body: {
    color: COLORS.text2,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },

  btn: {
    width: '92%',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(215,197,138,0.80)',
    padding: 3,
    marginTop: 10,
  },
  btnInner: {
    height: 58,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: COLORS.text, fontSize: 18, fontWeight: '900' },
});
