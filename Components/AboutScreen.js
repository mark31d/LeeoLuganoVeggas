// Components/AboutScreen.js
// About Lugano — collapsed/expanded (Read more) like your screenshot.
// FIX: gradient is a background (absolute), card height is stable, nothing gets cut.

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  Share,
  Linking,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/bg.webp');
const SHARE_ICON = require('../assets/share.webp');
const STORAGE_KEY = 'about_expanded';

const TABBAR_SPACE = 110;     // место под таббар (если он overlay)
const PREVIEW_LINES = 8;      // чтобы Read more всегда помещался

export default function AboutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { height: H } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);
  const [expandedFact, setExpandedFact] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        setExpanded(v === '1');
      } catch (e) {}
    })();
  }, []);

  const setAndStore = useCallback(async v => {
    setExpanded(v);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch (e) {}
  }, []);

  const onShare = useCallback(async () => {
    try {
      const textToShare = expanded ? fullText : preview;
      const msg = `${title}\n\n${textToShare}\n\nDiscover more about Lugano with Leeo Lugano Veggas!`;
      await Share.share({ message: msg });
    } catch (e) {}
  }, [expanded, fullText, preview, title]);

  const onOpenMaps = useCallback(async () => {
    const url = 'https://www.google.com/maps/search/?api=1&query=Lugano,+Switzerland';
    try {
      const can = await Linking.canOpenURL(url);
      if (!can) {
        Alert.alert('Maps', 'Cannot open maps on this device.');
        return;
      }
      Linking.openURL(url);
    } catch (e) {
      Alert.alert('Error', 'Failed to open maps.');
    }
  }, []);

  const onExplorePlaces = useCallback(() => {
    navigation.navigate('Places', { screen: 'Categories' });
  }, [navigation]);

  const onOpenPlace = useCallback((placeId) => {
    // Находим место по ID
    const allPlaces = [
      { id: 'monte_bre', title: 'Monte Brè', category: 'viewpoints' },
      { id: 'piazza_della_riforma', title: 'Piazza della Riforma', category: 'old_town' },
      { id: 'parco_ciani', title: 'Parco Ciani', category: 'lake' },
    ];
    const place = allPlaces.find(p => p.id === placeId);
    if (place) {
      navigation.navigate('Places', {
        screen: 'PlacesList',
        params: { categoryKey: place.category },
      });
    }
  }, [navigation]);

  // Статистика города
  const cityStats = useMemo(() => [
    { label: 'Population', value: '63,000' },
    { label: 'Area', value: '75.8 km²' },
    { label: 'Language', value: 'Italian' },
    { label: 'Currency', value: 'CHF' },
  ], []);

  // Интересные факты
  const interestingFacts = useMemo(() => [
    { id: 'fact1', title: 'Sunniest City', text: 'Lugano receives over 2,100 hours of sunshine per year, making it one of the sunniest cities in Switzerland.' },
    { id: 'fact2', title: 'Palm Trees', text: 'Lugano is one of the few places in Switzerland where palm trees grow naturally, thanks to its mild Mediterranean climate.' },
    { id: 'fact3', title: 'Lake Views', text: 'The city is built around Lake Lugano, which spans both Switzerland and Italy, offering stunning views from every angle.' },
    { id: 'fact4', title: 'Cultural Hub', text: 'Despite its small size, Lugano hosts numerous festivals, art exhibitions, and cultural events throughout the year.' },
  ], []);

  // Рекомендации по времени посещения
  const bestTimeToVisit = useMemo(() => [
    { season: 'Spring', months: 'Mar - May', description: 'Mild weather, blooming gardens, perfect for walking tours' },
    { season: 'Summer', months: 'Jun - Aug', description: 'Warmest months, ideal for lake activities and outdoor dining' },
    { season: 'Autumn', months: 'Sep - Nov', description: 'Pleasant temperatures, fewer crowds, beautiful fall colors' },
    { season: 'Winter', months: 'Dec - Feb', description: 'Cooler but still mild, Christmas markets, peaceful atmosphere' },
  ], []);

  // Популярные места
  const popularPlaces = useMemo(() => [
    { id: 'monte_bre', title: 'Monte Brè', category: 'viewpoints' },
    { id: 'piazza_della_riforma', title: 'Piazza della Riforma', category: 'old_town' },
    { id: 'parco_ciani', title: 'Parco Ciani', category: 'lake' },
  ], []);


  const title = 'About Lugano';

  const preview = useMemo(
    () =>
      `At the crossroads of Swiss precision and Italian charm, Lugano offers a unique blend of cultures.\nHere, Italian flows naturally in conversations, espresso is savored without haste, and the rhythm of life slows to a more contemplative tempo compared to other Swiss urban centers.\n\nNestled along the pristine shores of Lake Lugano, with rolling hills and unexpected palm trees dotting the landscape — yes, tropical palms in Switzerland — the city radiates warmth, openness, and tranquility. It's renowned as one of the country's most sun-drenched destinations.`,
    []
  );

  const fullText = useMemo(
    () =>
      `At the crossroads of Swiss precision and Italian charm, Lugano offers a unique blend of cultures.\nHere, Italian flows naturally in conversations, espresso is savored without haste, and the rhythm of life slows to a more contemplative tempo compared to other Swiss urban centers.\n\nNestled along the pristine shores of Lake Lugano, with rolling hills and unexpected palm trees dotting the landscape — yes, tropical palms in Switzerland — the city radiates warmth, openness, and tranquility. It's renowned as one of the country's most sun-drenched destinations.\n\nBeyond its compact size lies a rich cultural heartbeat: vibrant festivals, melodic music scenes, inspiring art galleries, and picturesque piazzas designed for leisurely strolls. This is a place where ancient cobblestone streets invite exploration, lakeside benches offer moments of reflection, and mountain vistas provide endless inspiration.\nLugano moves at its own pace.\nPerhaps that's what makes it truly special.`,
    []
  );

  // доступная высота под карточку (чтобы она не залезала на таббар)
  const topPad = insets.top + 16;
  const bottomPad = Math.max(insets.bottom, 20) + TABBAR_SPACE;
  const available = Math.max(320, H - topPad - bottomPad);

  // как на твоём примере: collapsed меньше, expanded больше, но оба всегда полностью на экране
  const collapsedH = Math.min(available, Math.round(available * 0.52));
  const expandedH = Math.min(available, Math.round(available * 0.78));

  const cardHeight = expanded ? expandedH : collapsedH;

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
          contentContainerStyle={[styles.scrollContainer, { paddingTop: topPad, paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.cardWrap]}>
            <View style={[styles.cardBorder, { height: cardHeight }]}>
              {/* FIX: gradient как ФОН, не как контейнер */}
              <LinearGradient
                colors={['rgba(255, 107, 53, 0.80)', 'rgba(204, 85, 0, 0.90)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />

              {/* subtle gloss */}
              <LinearGradient
                colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.00)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gloss}
                pointerEvents="none"
              />

              <View style={styles.cardContent}>
                {/* Тап по заголовку в expanded => свернуть */}
                <Pressable
                  onPress={() => expanded && setAndStore(false)}
                  hitSlop={10}
                >
                  <Text style={styles.title}>{title}</Text>
                </Pressable>

                {expanded ? (
                  // expanded: скроллится ТОЛЬКО текст, карточка не "съезжает"
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 6 }}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    <Text style={styles.body}>{fullText}</Text>
                  </ScrollView>
                ) : (
                  // collapsed: текст + Read more всегда виден
                  <View style={{ flex: 1 }}>
                    <Text
                      style={styles.body}
                      numberOfLines={PREVIEW_LINES}
                      ellipsizeMode="tail"
                    >
                      {preview}
                    </Text>

                    <Pressable
                      onPress={() => setAndStore(true)}
                      hitSlop={10}
                      style={styles.readMoreWrap}
                    >
                      <Text style={styles.readMore}>Read more...</Text>
                    </Pressable>
                  </View>
                )}

                {/* Action buttons */}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onExplorePlaces}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>Explore Places</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onOpenMaps}
                    style={styles.actionBtn}
                  >
                    <Text style={styles.actionBtnText}>View Map</Text>
                  </TouchableOpacity>

                  <View style={{ flex: 1 }} />

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={onShare}
                    style={styles.iconBtn}
                  >
                    <Image source={SHARE_ICON} style={styles.iconImg} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Отдельный контейнер для новых функций */}
          {expanded && (
            <View style={[styles.cardWrap, { marginTop: 16 }]}>
              <View style={styles.featuresCard}>
                <LinearGradient
                  colors={['rgba(255, 107, 53, 0.80)', 'rgba(204, 85, 0, 0.90)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <LinearGradient
                  colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.00)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={styles.gloss}
                  pointerEvents="none"
                />
                <View style={styles.featuresCardContent}>
                  {/* City Statistics */}
                  <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>City Stats</Text>
                    <View style={styles.statsGrid}>
                      {cityStats.map((stat, idx) => (
                        <View key={idx} style={styles.statCard}>
                          <Text style={styles.statValue}>{stat.value}</Text>
                          <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Interesting Facts */}
                  <View style={styles.factsSection}>
                    <Text style={styles.sectionTitle}>Did You Know?</Text>
                    {interestingFacts.map((fact) => (
                      <TouchableOpacity
                        key={fact.id}
                        activeOpacity={0.8}
                        onPress={() => setExpandedFact(expandedFact === fact.id ? null : fact.id)}
                        style={styles.factCard}
                      >
                        <View style={styles.factCardHeader}>
                          <Text style={styles.factCardTitle}>{fact.title}</Text>
                        </View>
                        {expandedFact === fact.id && (
                          <Text style={styles.factCardText}>{fact.text}</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Best Time to Visit */}
                  <View style={styles.seasonSection}>
                    <Text style={styles.sectionTitle}>Best Time to Visit</Text>
                    {bestTimeToVisit.map((item, idx) => (
                      <View key={idx} style={styles.seasonCard}>
                        <View style={styles.seasonHeader}>
                          <Text style={styles.seasonName}>{item.season}</Text>
                          <Text style={styles.seasonMonths}>{item.months}</Text>
                        </View>
                        <Text style={styles.seasonDesc}>{item.description}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Popular Places */}
                  <View style={styles.placesSection}>
                    <Text style={styles.sectionTitle}>Popular Places</Text>
                    {popularPlaces.map((place) => (
                      <TouchableOpacity
                        key={place.id}
                        activeOpacity={0.8}
                        onPress={() => onOpenPlace(place.id)}
                        style={styles.placeCard}
                      >
                        <Text style={styles.placeCardText}>{place.title}</Text>
                        <Text style={styles.placeCardArrow}>→</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
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
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },

  scrollContainer: {
    paddingHorizontal: 16,
  },

  cardWrap: {
    alignItems: 'center',
    width: '100%',
  },

  featuresCard: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(215,197,138,0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
    overflow: 'hidden',
    minHeight: 400,
  },

  featuresCardContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
  },

  cardBorder: {
    width: '100%',
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(215,197,138,0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
    overflow: 'hidden',
  },

  cardContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 22,
  },

  gloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 50,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 14,
    letterSpacing: 0.2,
  },

  body: {
    color: 'rgba(255,255,255,0.94)',
    fontSize: 16,
    lineHeight: 24,
  },

  readMoreWrap: {
    marginTop: 10,
    alignSelf: 'flex-end', // как на примере — справа снизу
  },

  readMore: {
    fontWeight: '800',
    color: 'rgba(255,255,255,0.95)',
  },

  actionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },

  actionBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionBtnText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 12.5,
    fontWeight: '800',
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconImg: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: 'rgba(255,255,255,0.95)',
  },

  iconBtnText: {
    fontSize: 16,
  },

  // New features styles
  statsSection: {
    marginTop: 20,
    marginBottom: 16,
  },

  sectionTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  statValue: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },

  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
  },

  factsSection: {
    marginTop: 20,
    marginBottom: 16,
  },

  factCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  factCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  factCardTitle: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },

  factCardText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },

  seasonSection: {
    marginTop: 20,
    marginBottom: 16,
  },

  seasonCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  seasonName: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    fontWeight: '800',
  },

  seasonMonths: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
  },

  seasonDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 16,
  },

  placesSection: {
    marginTop: 20,
    marginBottom: 16,
  },

  placeCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  placeCardText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  placeCardArrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    fontWeight: '800',
  },
});
