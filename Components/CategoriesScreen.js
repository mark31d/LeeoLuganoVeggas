// Components/CategoriesScreen.js
// Categories — cards + custom swipe switch.
// FIX: no double borders, cards never cut by tabbar (ScrollView + proper bottom padding).

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Platform,
  TouchableOpacity,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/bg.webp');

const NEXT_SCREEN = 'PlacesList';

const TABBAR_SPACE = 130; // чуть больше, чтобы точно не залезало под твой кастомный таббар

const CATEGORIES = [
  {
    key: 'viewpoints',
    title: 'Viewpoints',
    desc: 'Panoramic spots with beautiful views\nover Lugano and the lake.',
  },
  {
    key: 'old_town',
    title: 'Old Town',
    desc: 'Historic streets, squares, and traditional\narchitecture.',
  },
  {
    key: 'lake',
    title: 'Lake & Waterfront',
    desc: 'Relaxed walks and scenic spots along\nLake Lugano.',
  },
  {
    key: 'cafes',
    title: 'Cafés & Food',
    desc: 'Selected cafés and food places for a\nrelaxed break.',
  },
];

const COLORS = {
  gold: '#D7C58A',
  white: '#FFFFFF',
  text2: 'rgba(255,255,255,0.85)',
  cardTop: 'rgba(255, 107, 53, 0.55)',
  cardBottom: 'rgba(204, 85, 0, 0.55)',
  switchOffBg: 'rgba(255,255,255,0.10)',
  switchOnBg: '#4A90E2',
  knob: 'rgba(245,245,245,0.95)',
};

function SwipeSwitch({
  value,
  onChange,
  width = 152, // чуть шире, чтобы надпись не резалась
  height = 28,
  disabled = false,
  label = 'browse to look',
}) {
  const knobSize = height - 6;
  const minX = 3;
  const maxX = width - knobSize - 3;

  const x = useRef(new Animated.Value(value ? maxX : minX)).current;

  React.useEffect(() => {
    Animated.spring(x, {
      toValue: value ? maxX : minX,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    }).start();
  }, [value, maxX, minX, x]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: (_, g) => !disabled && Math.abs(g.dx) > 3,
        onPanResponderGrant: () => x.stopAnimation(),
        onPanResponderMove: (_, g) => {
          if (disabled) return;
          const base = value ? maxX : minX;
          const next = Math.max(minX, Math.min(maxX, base + g.dx));
          x.setValue(next);
        },
        onPanResponderRelease: (_, g) => {
          if (disabled) return;
          const base = value ? maxX : minX;
          const shouldOn = base + g.dx > (minX + maxX) / 2;
          onChange?.(shouldOn);
        },
        onPanResponderTerminate: () => {
          Animated.spring(x, {
            toValue: value ? maxX : minX,
            useNativeDriver: true,
            speed: 18,
            bounciness: 6,
          }).start();
        },
      }),
    [disabled, maxX, minX, onChange, value, x]
  );

  const trackBg = value ? COLORS.switchOnBg : COLORS.switchOffBg;
  const labelOpacity = x.interpolate({
    inputRange: [minX, maxX],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      disabled={disabled}
      onPress={() => onChange?.(!value)}
      style={[
        styles.switchTrack,
        {
          width,
          height,
          borderRadius: height / 2,
          backgroundColor: trackBg,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.switchLabel,
          {
            opacity: labelOpacity,
            right: 10,
            maxWidth: width - (knobSize + 18), // чтобы не наезжало на кноб
          },
        ]}
      >
        {label}
      </Animated.Text>

      <Animated.View
        {...pan.panHandlers}
        style={[
          styles.switchKnob,
          {
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            transform: [{ translateX: x }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

export default function CategoriesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeKey, setActiveKey] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setActiveKey(null);
    }, [])
  );

  const goCategory = useCallback(
    key => {
      setTimeout(() => {
        navigation.navigate(NEXT_SCREEN, { categoryKey: key });
      }, 160);
    },
    [navigation]
  );

  const bottomPad = TABBAR_SPACE + Math.max(insets.bottom, 12) + 36;

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

        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: insets.top + 18,
            paddingBottom: bottomPad,
          }}
        >
          <Text style={styles.h1}>Choose the category</Text>
          <View style={{ height: 12 }} />

          {CATEGORIES.map(item => {
            const isOn = activeKey === item.key;

            return (
              <View key={item.key} style={styles.cardOuter}>
                {/* ОДНА оболочка с ОДНИМ бордером */}
                <View style={styles.cardShell}>
                  {/* Градиент как фон (чтобы не "съезжало" и не было второй обводки) */}
                  <LinearGradient
                    colors={[COLORS.cardTop, COLORS.cardBottom]}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />

                  {/* subtle gloss */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.00)']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.cardGloss}
                    pointerEvents="none"
                  />

                  <View style={styles.cardContent}>
                    <View style={styles.cardRow}>
                      <View style={{ flex: 1, paddingRight: 14 }}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardDesc}>{item.desc}</Text>
                      </View>

                      <View style={styles.switchWrap}>
                        <SwipeSwitch
                          value={isOn}
                          onChange={next => {
                            if (!next) {
                              setActiveKey(null);
                              return;
                            }
                            setActiveKey(item.key);
                            goCategory(item.key);
                          }}
                          width={152}
                          height={28}
                          label="browse to look"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.14)',
  },

  h1: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  cardOuter: {
    marginBottom: 18,
  },

  // ✅ Одна рамка, без "двойных" линий
  cardShell: {
    borderRadius: 34,
    overflow: 'hidden',

    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.10)',

    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  cardContent: {
    paddingHorizontal: 22,
    paddingVertical: 18,
  },

  cardGloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 26,
  },

  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 6,
  },

  cardDesc: {
    color: COLORS.text2,
    fontSize: 14.5,
    lineHeight: 20,
  },

  switchWrap: {
    paddingTop: 0,
    alignItems: 'flex-end',
  },

  // --- Switch ---
  switchTrack: {
    borderWidth: 1.6,
    borderColor: 'rgba(215,197,138,0.75)',
    justifyContent: 'center',
  },

  switchLabel: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '700',
  },

  switchKnob: {
    position: 'absolute',
    left: 0,
    top: 1,
    backgroundColor: COLORS.knob,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
