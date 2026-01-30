// Components/CustomTabBar.js
// Pill tab bar: rounded capsule + 5 circular buttons with gold stroke.
// Icons are images (prefer white line icons with transparent background).
//
// Usage in Tabs:
// <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />} ... />

import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// paths: assets/<name>.webp  (меняй названия под свои)
const ICONS = {
  About: require('../assets/tab_about.webp'),      // i
  Places: require('../assets/tab_places.webp'),    // pin
  Map: require('../assets/tab_profile.webp'),      // person pin для Map
  Quiz: require('../assets/tab_quiz.webp'),        // brain
  Saved: require('../assets/tab_saved.webp'),      // heart
};

const COLORS = {
  gold: '#D7C58A',
  icon: '#FFFFFF',
  // capsule gradient (оранжевый как в Onboarding)
  capTop: '#FF6B35',
  capBottom: '#CC5500',
  // circle fill (оранжевый как фон капсулы)
  circleFill: 'rgba(255, 107, 53, 0.6)',
  // circle fill active (светлее)
  circleFillActive: 'rgba(255, 140, 66, 0.8)',
};

const BORDER_W = 1.5;
const RADIUS = 32;

export default function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const routes = useMemo(() => state.routes, [state.routes]);

  // Скрываем таб бар если текущий экран - Quiz
  const currentRoute = state.routes[state.index];
  const isQuizScreen = currentRoute?.name === 'Quiz';

  if (isQuizScreen) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      {/* ✅ Внешний контейнер: ТОЛЬКО бордер + тень (без градиента) */}
      <View style={styles.capsuleOuter}>
        {/* ✅ Внутренний слой: градиент (без borderWidth), чтобы не было двойного бордера */}
        <LinearGradient
          colors={[COLORS.capTop, COLORS.capBottom]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.capsuleInner}
        >
          {/* subtle gloss */}
          <LinearGradient
            colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.00)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.gloss}
            pointerEvents="none"
          />

          <View style={styles.row}>
            {routes.map((route, index) => {
              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              const iconSrc =
                ICONS[route.name] ||
                // fallback если названия экранов другие
                ICONS[descriptors[route.key]?.options?.tabBarLabel] ||
                ICONS[descriptors[route.key]?.options?.title];

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={descriptors[route.key]?.options?.tabBarAccessibilityLabel}
                  testID={descriptors[route.key]?.options?.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  activeOpacity={0.9}
                  style={styles.item}
                >
                  <View
                    style={[
                      styles.circle,
                      isFocused ? styles.circleActive : styles.circleInactive,
                      { backgroundColor: isFocused ? COLORS.circleFillActive : COLORS.circleFill },
                    ]}
                  >
                    {iconSrc && (
                      <Image
                        source={iconSrc}
                        style={[
                          styles.icon,
                          { tintColor: COLORS.icon, opacity: isFocused ? 1 : 0.95 },
                        ]}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },

  // ✅ Внешняя капсула: один-единственный бордер + тень
  capsuleOuter: {
    width: '95%',
    height: 80,
    borderRadius: RADIUS,

    borderWidth: BORDER_W,
    borderColor: 'rgba(215,197,138,0.55)',

    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,

    overflow: 'hidden',
  },

  // ✅ Внутри: только градиент, без бордера
  capsuleInner: {
    flex: 1,
    borderRadius: RADIUS - BORDER_W,
    justifyContent: 'center',
    alignItems: 'center',
  },

  gloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 26,
    borderTopLeftRadius: RADIUS - BORDER_W,
    borderTopRightRadius: RADIUS - BORDER_W,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },

  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  circleInactive: {
    width: 65,
    height: 56,
    borderRadius: 50,
    borderWidth: 1.6,
    borderColor: 'rgba(215,197,138,0.75)',
  },

  circleActive: {
    width: 65,
    height: 56,
    borderRadius: 50,
    borderWidth: 2.2,
    borderColor: 'rgba(215,197,138,0.95)',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.22 : 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },

  icon: {
    width: 24,
    height: 24,
  },
});
