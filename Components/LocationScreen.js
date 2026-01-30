// Components/LocationScreen.js
// FIX:
// - НЕ режется контент внутри карточки (outer shadow + inner clip)
// - картинка такая же как в Places (поддержка require / {uri} / "https://...")
// - share.webp + heart.webp
// - экран скроллится, чтобы ничего не пряталось под таббаром
// - Map preview выключен по умолчанию (можно включать long press на "Open at maps")

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Platform,
  TouchableOpacity,
  Image,
  Share,
  Linking,
  Alert,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

const BG = require('../assets/bg.webp');
const SHARE_ICON = require('../assets/share.webp');
const HEART_ICON = require('../assets/heart.webp');
const BACK_ICON = require('../assets/back.webp');
const PARCHMENT = require('../assets/parchment.webp');

const TABBAR_SPACE = 110;
const FAV_KEY = '@lugano_favorites_v1';

// Картинки мест (такие же как в PlacesListScreen)
const PLACE_IMAGES = {
  // viewpoints
  monte_bre: require('../assets/place_monte_bre.webp'),
  monte_san_salvatore: require('../assets/place_monte_san_salvatore.webp'),
  belvedere_gardens: require('../assets/place_belvedere_gardens.webp'),
  castagnola_viewpoint: require('../assets/place_castagnola_viewpoint.webp'),
  parco_san_michele: require('../assets/place_parco_san_michele.webp'),
  // old town
  piazza_della_riforma: require('../assets/place_piazza_della_riforma.webp'),
  via_nassa: require('../assets/place_via_nassa.webp'),
  santa_maria_angioli: require('../assets/place_santa_maria_angioli.webp'),
  cathedral_saint_lawrence: require('../assets/place_cathedral_saint_lawrence.webp'),
  contrada_verla: require('../assets/place_contrada_verla.webp'),
  // lake
  parco_ciani: require('../assets/place_parco_ciani.webp'),
  lungolago: require('../assets/place_lungolago.webp'),
  belvedere_park: require('../assets/place_belvedere_park.webp'),
  cassina_agno_lakeside: require('../assets/place_cassina_agno_lakeside.webp'),
  gandria_village_walk: require('../assets/place_gandria_village_walk.webp'),
  // cafes
  grand_cafe_al_porto: require('../assets/place_grand_cafe_al_porto.webp'),
  caffe_vanini: require('../assets/place_caffe_vanini.webp'),
  grand_cafe_lobby: require('../assets/place_grand_cafe_lobby.webp'),
  spaghetti_store: require('../assets/place_spaghetti_store.webp'),
  manora_restaurant: require('../assets/place_manora_restaurant.webp'),
};

const COLORS = {
  gold: '#D7C58A',
  dim: 'rgba(0,0,0,0.12)',
  cardBorder: 'rgba(255,255,255,0.14)',
  // оранжевые тона как в Onboarding
  cardBg: 'rgba(255, 107, 53, 0.35)',
  infoBg: 'rgba(255, 107, 53, 0.55)',
  infoBg2: 'rgba(204, 85, 0, 0.60)',
  text: 'rgba(255,255,255,0.92)',
  text2: 'rgba(255,255,255,0.86)',
};

function encode(str = '') {
  return encodeURIComponent(str);
}

function getMapsOpenUrl(address) {
  return `https://www.google.com/maps/search/?api=1&query=${encode(address)}`;
}

function getMapsEmbedUrl(address) {
  // Используем обычный URL карты Google Maps
  const encodedAddr = encode(address);
  // Используем режим просмотра, который лучше работает в WebView
  return `https://www.google.com/maps?q=${encodedAddr}&output=embed`;
}

// поддержка require / {uri} / "https://..."
function normalizeImageSource(v, fallback) {
  if (!v) return fallback;
  if (typeof v === 'number') return v; // require(...)
  if (typeof v === 'string') return { uri: v };
  if (typeof v === 'object' && v.uri) return v;
  return fallback;
}

export default function LocationScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { height: H } = useWindowDimensions();

  const place = route?.params?.place || null;
  const fromScreen = route?.params?.fromScreen || 'Places'; // 'Map' или 'Places'

  const title = place?.title || 'Location';
  const description = place?.description || '';
  const fact = place?.fact || '';
  const address = place?.address || '';

  // Берем картинку: сначала по imageKey из PLACE_IMAGES (как в PlacesListScreen),
  // потом пробуем другие поля, если imageKey нет
  const imageSource = useMemo(() => {
    // Если есть imageKey, берем из PLACE_IMAGES
    if (place?.imageKey && PLACE_IMAGES[place.imageKey]) {
      return PLACE_IMAGES[place.imageKey];
    }

    // Иначе пробуем другие поля (для совместимости)
    const raw =
      place?.image ??
      place?.img ??
      place?.photo ??
      place?.cover ??
      place?.imageUri ??
      place?.imageURL ??
      place?.imageUrl;
    return normalizeImageSource(raw, BG);
  }, [place]);

  const [showFact, setShowFact] = useState(false);

  // чтобы не ломать верстку — карта выключена (как на твоем макете)
  const [showMap, setShowMap] = useState(false);

  const [favorites, setFavorites] = useState({});
  const isFav = !!(place?.id && favorites[place.id]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FAV_KEY);
        if (raw) setFavorites(JSON.parse(raw));
      } catch (e) { }
    })();
  }, []);

  const saveFav = useCallback(async next => {
    try {
      setFavorites(next);
      await AsyncStorage.setItem(FAV_KEY, JSON.stringify(next));
    } catch (e) { }
  }, []);

  const toggleFav = useCallback(() => {
    if (!place?.id) return;
    const next = { ...favorites };
    if (next[place.id]) delete next[place.id];
    else next[place.id] = true;
    saveFav(next);
  }, [favorites, place, saveFav]);

  const onShare = useCallback(async () => {
    try {
      const maps = address ? getMapsOpenUrl(address) : '';
      const msg = `${title}\n${address}\n\n${description}\n\n${maps}`;
      await Share.share({ message: msg });
    } catch (e) { }
  }, [address, description, title]);

  const onOpenMaps = useCallback(async () => {
    if (!address) return;
    const url = getMapsOpenUrl(address);
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert('Maps', 'Cannot open maps on this device.');
      return;
    }
    Linking.openURL(url);
  }, [address]);

  const bottomPad = TABBAR_SPACE + Math.max(insets.bottom, 12) + 24;

  // картинка чуть компактнее, чтобы всё влезало как на макете
  const cardImgH = useMemo(() => {
    const headerApprox = insets.top + 14 + 38 + 12;
    const available = H - headerApprox - bottomPad;
    const h = showFact ? available * 0.32 : available * 0.38;
    return Math.round(Math.min(250, Math.max(180, h)));
  }, [H, bottomPad, insets.top, showFact]);

  const factLabel = showFact ? 'Tap to close interesting fact' : 'Tap to get interesting fact';

  if (!place) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff' }}>No place data</Text>
      </View>
    );
  }

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

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <TouchableOpacity
            onPress={() => {
              // Если пришли из MapScreen, возвращаемся на Map таб
              if (fromScreen === 'Map') {
                navigation.navigate('Map');
              } else {
                // Иначе обычный goBack (для Places)
                navigation.goBack();
              }
            }}
            activeOpacity={0.85}
            style={styles.backBtn}
          >
            <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
          </TouchableOpacity>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>

          <View style={{ width: 38 }} />
        </View>


        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad }]}
        >

          <View style={styles.cardOuter}>
            <View style={styles.cardClip}>
              <Image source={imageSource} style={[styles.cardImg, { height: cardImgH }]} resizeMode="cover" />

              <LinearGradient
                colors={[COLORS.infoBg, COLORS.infoBg2]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={styles.info}
              >
                <ScrollView
                  style={styles.infoScroll}
                  contentContainerStyle={styles.infoScrollContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  <Text style={styles.desc}>
                    {description}
                  </Text>

                  <View style={styles.addressRow}>
                    <Text style={styles.pin}>⌖</Text>
                    <Text style={styles.addressText}>
                      {address}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.actionsRow}>
                  {/* Open at maps: tap -> preview */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setShowMap(v => !v)}
                    style={styles.mapsBtn}
                  >
                    <Text style={styles.mapsBtnText}>Open at maps</Text>
                  </TouchableOpacity>

                  <View style={{ flex: 1 }} />

                  <TouchableOpacity activeOpacity={0.9} onPress={onShare} style={styles.iconBtn}>
                    <Image source={SHARE_ICON} style={styles.iconImg} />
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.9} onPress={toggleFav} style={[
                    styles.iconBtn,
                    isFav && styles.iconBtnActive
                  ]}>
                    <Image
                      source={HEART_ICON}
                      style={[styles.iconImg, { tintColor: isFav ? '#FFFFFF' : undefined }]}
                    />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>

          {/* Fact button (как на макете: тёмный текст на золотом) */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => setShowFact(v => !v)} style={styles.factBtnShell}>
            <LinearGradient
              colors={['rgba(215,197,138,0.70)', 'rgba(215,197,138,0.35)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.factBtn}
            >
              <Text style={styles.factBtnText}>{factLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Fact card */}
          {showFact && (
            <View style={styles.factCard}>
              <View style={styles.factShadow}>
                <ImageBackground
                  source={PARCHMENT}
                  style={styles.factPaper}
                  resizeMode="cover"
                >
                  <View style={styles.factTextWrap}>
                    <Text style={styles.factText}>
                      {fact}
                    </Text>
                  </View>
                </ImageBackground>
              </View>
            </View>
          )}

          {/* Map preview (optional) */}
          {showMap && (
            <View style={styles.mapOuter}>
              <View style={styles.mapClip}>
                <WebView
                  source={{ uri: getMapsEmbedUrl(address) }}
                  style={styles.web}
                  javaScriptEnabled
                  domStorageEnabled
                  originWhitelist={['*']}
                  onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                    // Скрываем карту при ошибке, чтобы не показывать ошибку пользователю
                    setShowMap(false);
                  }}
                  onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView HTTP error: ', nativeEvent);
                  }}
                  onShouldStartLoadWithRequest={(request) => {
                    // Блокируем переходы на кастомные схемы (maps:, geo:, etc.)
                    const url = request.url;
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                      return true;
                    }
                    // Если это кастомная схема, пытаемся открыть через Linking
                    if (url.startsWith('maps:') || url.startsWith('geo:') || url.startsWith('comgooglemaps:')) {
                      Linking.openURL(url).catch(() => {
                        // Если не удалось открыть, открываем через обычный URL
                        onOpenMaps();
                      });
                      return false;
                    }
                    return false;
                  }}
                  renderError={(errorName) => (
                    <View style={styles.webViewError}>
                      <Text style={styles.webViewErrorText}>Unable to load map</Text>
                      <TouchableOpacity onPress={onOpenMaps} style={styles.webViewErrorBtn}>
                        <Text style={styles.webViewErrorBtnText}>Open in Maps App</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
                <View pointerEvents="none" style={styles.mapMask} />
              </View>
            </View>
          )}
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.dim },

  header: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 38,
    height: 38,
    tintColor: '#fff',
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 22, fontWeight: '900' },

  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 18,
    gap: 14,
  },

  // --- Card (outer shadow, inner clip) ---
  cardOuter: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    overflow: 'hidden',
  },
  cardClip: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardImg: { width: '100%' },

  info: {
    flex: 1,
  },

  infoScroll: {
    flex: 1,
    maxHeight: 200,
  },

  infoScrollContent: {
    paddingBottom: 8,
  },

  desc: {
    color: COLORS.text,
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: '700',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },

  addressRow: {
    marginTop: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 0,
  },
  pin: { color: COLORS.text, fontSize: 16, marginTop: -1 },
  addressText: { flex: 1, color: COLORS.text, fontSize: 12.5, fontWeight: '700' },

  actionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },

  mapsBtn: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapsBtnText: { color: COLORS.text, fontSize: 12.5, fontWeight: '800' },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: '#D9352E',
    borderColor: 'rgba(217, 53, 46, 0.8)',
  },
  iconImg: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: 'rgba(255,255,255,0.95)', // если у иконок уже белый цвет — можешь убрать эту строку
  },

  // --- Fact button ---
  factBtnShell: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.6,
    borderColor: 'rgba(215,197,138,0.85)',
  },
  factBtn: {

    alignItems: 'center',
    justifyContent: 'center',
  },
  factBtnText: {
    padding: 12,
    color: 'white',
    fontSize: 15,
    fontWeight: '900',
  },

  // --- Fact card ---
  factCard: { alignItems: 'center', justifyContent: 'center' },

  factPaper: {
    width: 290,
    height: 170,
    resizeMode: 'contain'
  },
  factTextWrap: {

  },
  factText: {
    textAlign: 'center',
    color: 'rgba(0,0,0,0.62)',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 50,
    padding: 10,
  },

  // --- Map (outer shadow, inner clip) ---
  mapOuter: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  mapClip: {
    borderRadius: 28,
    overflow: 'hidden',
    height: 400,
  },
  web: { flex: 1 },
  mapMask: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.08)' },
  webViewError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
  },
  webViewErrorText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  webViewErrorBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  webViewErrorBtnText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
  },
});
