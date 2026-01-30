// Components/PlacesListScreen.js
// Places list (by category) — like your screenshot:
// - blurred BG
// - back button + title
// - big rounded image cards
// - bottom left title
// - custom swipe switch "browse to look" on each card
// - swipe -> navigate to LocationScreen with { place, categoryKey }
//
// Assets (.webp):
// - assets/bg.webp
// - assets/place_monte_bre.webp
// - assets/place_monte_san_salvatore.webp
// - assets/place_belvedere_gardens.webp
// - assets/place_castagnola_viewpoint.webp
// - assets/place_parco_san_michele.webp
// - assets/place_piazza_della_riforma.webp
// - assets/place_via_nassa.webp
// - assets/place_santa_maria_angioli.webp
// - assets/place_cathedral_saint_lawrence.webp
// - assets/place_contrada_verla.webp
// - assets/place_parco_ciani.webp
// - assets/place_lungolago.webp
// - assets/place_belvedere_park.webp
// - assets/place_cassina_agno_lakeside.webp
// - assets/place_gandria_village_walk.webp
// - assets/place_grand_cafe_al_porto.webp
// - assets/place_caffe_vanini.webp
// - assets/place_grand_cafe_lobby.webp
// - assets/place_spaghetti_store.webp
// - assets/place_manora_restaurant.webp

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  StatusBar,
  Platform,
  TouchableOpacity,
  Animated,
  PanResponder,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/bg.webp');
const BACK_ICON = require('../assets/back.webp');

// поменяй если у тебя другое имя роута
const DETAILS_SCREEN = 'Location';

const COLORS = {
  gold: '#D7C58A',
  white: '#FFFFFF',
  text2: 'rgba(255,255,255,0.90)',
  shadow: 'rgba(0,0,0,0.35)',
  // switch
  switchOffBg: 'rgba(255,255,255,0.10)',
  switchOnBg: '#4A90E2',
  knob: 'rgba(245,245,245,0.95)',
};

const CATEGORY_TITLE = {
  viewpoints: 'Viewpoints',
  old_town: 'Old Town',
  lake: 'Lake & Waterfront',
  cafes: 'Cafés & Food',
};

// ✅ Картинки (локальные), под каждый imageKey
// Положи файлы в /assets с этими именами.
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

const PLACES_BY_CATEGORY = {
  old_town: [
    {
      id: 'piazza_della_riforma',
      title: 'Piazza della Riforma',
      description: 'The main square of Lugano, surrounded by cafés and historic buildings.',
      fact: 'Many city events and festivals take place here.',
      address: 'Piazza della Riforma, 6900 Lugano, Switzerland',
      imageKey: 'piazza_della_riforma',
    },
    {
      id: 'via_nassa',
      title: 'Via Nassa',
      description: 'An elegant shopping street with historic arcades.',
      fact: 'It dates back to medieval times and was once used by fishermen.',
      address: 'Via Nassa, 6900 Lugano, Switzerland',
      imageKey: 'via_nassa',
    },
    {
      id: 'santa_maria_angioli',
      title: 'Santa Maria degli Angioli',
      description: 'A historic church famous for its Renaissance frescoes.',
      fact: 'Its fresco is considered one of the most important in Switzerland.',
      address: 'Via Nassa 28, 6900 Lugano, Switzerland',
      imageKey: 'santa_maria_angioli',
    },
    {
      id: 'cathedral_saint_lawrence',
      title: 'Cathedral of Saint Lawrence',
      description: 'The main cathedral of Lugano, overlooking the city.',
      fact: 'The cathedral was rebuilt in the 15th century.',
      address: 'Piazza Luini 6, 6900 Lugano, Switzerland',
      imageKey: 'cathedral_saint_lawrence',
    },
    {
      id: 'contrada_verla',
      title: 'Contrada di Verla',
      description: 'A narrow historic street with authentic character.',
      fact: 'It preserves the original medieval layout of Lugano.',
      address: 'Contrada di Verla, 6900 Lugano, Switzerland',
      imageKey: 'contrada_verla',
    },
  ],

  viewpoints: [
    {
      id: 'monte_bre',
      title: 'Monte Brè',
      description: 'One of the most scenic viewpoints in Lugano with wide views over the lake and city.',
      fact: 'Monte Brè is considered one of the sunniest places in Switzerland.',
      address: 'Monte Brè, 6979 Lugano, Switzerland',
      imageKey: 'monte_bre',
    },
    {
      id: 'monte_san_salvatore',
      title: 'Monte San Salvatore',
      description: 'A dramatic mountain offering breathtaking panoramic views.',
      fact: 'It is often called “the sugar loaf of Switzerland” because of its shape.',
      address: 'Via delle Scuole 7, 6916 Lugano, Switzerland',
      imageKey: 'monte_san_salvatore',
    },
    {
      id: 'belvedere_gardens',
      title: 'Belvedere Gardens',
      description: 'A peaceful terrace overlooking the lake, surrounded by greenery.',
      fact: 'The gardens were created as a quiet escape from the city.',
      address: 'Viale Castagnola, 6900 Lugano, Switzerland',
      imageKey: 'belvedere_gardens',
    },
    {
      id: 'castagnola_viewpoint',
      title: 'Castagnola Viewpoint',
      description: 'A calm lakeside viewpoint with elegant villas and reflections on the water.',
      fact: 'The area has long attracted artists and writers.',
      address: 'Riva Albertolli, 6900 Lugano, Switzerland',
      imageKey: 'castagnola_viewpoint',
    },
    {
      id: 'parco_san_michele',
      title: 'Parco San Michele',
      description: 'A quiet park with elevated views above the city.',
      fact: 'It is mostly visited by locals at sunset.',
      address: 'Via San Michele, 6900 Lugano, Switzerland',
      imageKey: 'parco_san_michele',
    },
  ],

  lake: [
    {
      id: 'parco_ciani',
      title: 'Parco Ciani',
      description: 'A large lakeside park with open views and walking paths.',
      fact: 'It is one of the most photographed places in Lugano.',
      address: 'Viale Carlo Cattaneo, 6900 Lugano, Switzerland',
      imageKey: 'parco_ciani',
    },
    {
      id: 'lungolago',
      title: 'Lungolago',
      description: 'The main waterfront promenade along the lake.',
      fact: 'It connects several key areas of the city.',
      address: 'Riva Vincenzo Vela, 6900 Lugano, Switzerland',
      imageKey: 'lungolago',
    },
    {
      id: 'belvedere_park',
      title: 'Belvedere Park',
      description: 'A calm lakeside park with mountain views.',
      fact: 'The water often reflects the mountains on clear days.',
      address: 'Viale Castagnola, 6900 Lugano, Switzerland',
      imageKey: 'belvedere_park',
    },
    {
      id: 'cassina_agno_lakeside',
      title: 'Cassina d’Agno Lakeside',
      description: 'A quieter lakeside area away from the city center.',
      fact: 'This spot is popular with locals rather than tourists.',
      address: 'Via Al Lago, 6990 Cassina d’Agno, Switzerland',
      imageKey: 'cassina_agno_lakeside',
    },
    {
      id: 'gandria_village_walk',
      title: 'Gandria Village Walk',
      description: 'A scenic lakeside path leading to the village of Gandria.',
      fact: 'The path is carved into the rocks above the lake.',
      address: 'Sentiero di Gandria, 6978 Lugano, Switzerland',
      imageKey: 'gandria_village_walk',
    },
  ],

  cafes: [
    {
      id: 'grand_cafe_al_porto',
      title: 'Grand Café Al Porto',
      description: 'A classic café near the waterfront with outdoor seating.',
      fact: 'It has been a local meeting place for decades.',
      address: 'Via Pessina 14, 6900 Lugano, Switzerland',
      imageKey: 'grand_cafe_al_porto',
    },
    {
      id: 'caffe_vanini',
      title: 'Caffè Vanini',
      description: 'A historic café known for pastries and coffee.',
      fact: 'The café dates back to the 19th century.',
      address: 'Piazza della Riforma 7, 6900 Lugano, Switzerland',
      imageKey: 'caffe_vanini',
    },
    {
      id: 'grand_cafe_lobby',
      title: 'Ristorante Grand Café Lobby',
      description: 'An elegant restaurant for light meals and drinks.',
      fact: 'Its interior reflects classic Swiss hospitality style.',
      address: 'Via Giocondo Albertolli 5, 6900 Lugano, Switzerland',
      imageKey: 'grand_cafe_lobby',
    },
    {
      id: 'spaghetti_store',
      title: 'Spaghetti Store',
      description: 'A casual place serving simple Italian dishes.',
      fact: 'It is popular for quick lunches in the city center.',
      address: 'Via Nassa 15, 6900 Lugano, Switzerland',
      imageKey: 'spaghetti_store',
    },
    {
      id: 'manora_restaurant',
      title: 'Manora Restaurant',
      description: 'A relaxed restaurant with panoramic city views.',
      fact: 'It offers one of the best dining views in Lugano.',
      address: 'Via Pessina 16, 6900 Lugano, Switzerland',
      imageKey: 'manora_restaurant',
    },
  ],
};

function SwipeSwitch({
  value,
  onChange,
  width = 128,
  height = 26,
  disabled = false,
  label = 'browse to look',
}) {
  const knobSize = height - 6;
  const minX = 3;
  const maxX = width - knobSize - 3;

  const x = useRef(new Animated.Value(value ? maxX : minX)).current;

  useEffect(() => {
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
          const endPos = base + g.dx;
          const shouldOn = endPos > (minX + maxX) / 2;
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
          backgroundColor: value ? COLORS.switchOnBg : COLORS.switchOffBg,
        },
      ]}
    >
      {!value && (
        <Text numberOfLines={1} style={styles.switchLabel}>
          {label}
        </Text>
      )}

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

export default function PlacesListScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const categoryKey = route?.params?.categoryKey || 'viewpoints';
  const title = CATEGORY_TITLE[categoryKey] || 'Places';

  const places = PLACES_BY_CATEGORY[categoryKey] || [];
  const [activePlaceId, setActivePlaceId] = useState(null);

  const onOpenPlace = useCallback(
    place => {
      setActivePlaceId(place.id);
      setTimeout(() => {
        setActivePlaceId(null);
        navigation.navigate(DETAILS_SCREEN, { place, categoryKey, fromScreen: 'Places' });
      }, 140);
    },
    [navigation, categoryKey]
  );

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

        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85} style={styles.backBtn}>
            <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: 140 + Math.max(insets.bottom, 10) }]}
          showsVerticalScrollIndicator={false}
        >
          {places.map(p => {
            const isOn = activePlaceId === p.id;
            const img = PLACE_IMAGES[p.imageKey] || BG;

            return (
              <View key={p.id} style={styles.cardWrap}>
                <View style={styles.card}>
                  <Image source={img} style={styles.cardImg} resizeMode="cover" />

                  <LinearGradient
                    colors={['rgba(0,0,0,0.00)', 'rgba(0,0,0,0.45)']}
                    start={{ x: 0.2, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={styles.cardShade}
                    pointerEvents="none"
                  />

                  <View style={styles.cardBottomRow}>
                    <Text style={styles.cardTitle}>{p.title}</Text>

                    <SwipeSwitch
                      value={isOn}
                      onChange={next => {
                        if (!next) {
                          setActivePlaceId(null);
                          return;
                        }
                        onOpenPlace(p);
                      }}
                      width={128}
                      height={26}
                      label="browse to look"
                    />
                  </View>

                  {/* Тап по карточке тоже открывает */}
                  <TouchableOpacity activeOpacity={0.85} style={styles.cardTap} onPress={() => onOpenPlace(p)} />
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
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },

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

  headerTitle: { flex: 1, color: '#fff', fontSize: 28, fontWeight: '900' },

  list: { paddingTop: 10, paddingHorizontal: 18 },

  cardWrap: { marginBottom: 18 },

  card: {
    height: 160,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },

  cardTap: { ...StyleSheet.absoluteFillObject },

  cardImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },

  cardShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
  },

  cardBottomRow: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: COLORS.shadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    paddingRight: 10,
  },

  // Switch
  switchTrack: {
    borderWidth: 1.6,
    borderColor: 'rgba(215,197,138,0.75)',
    justifyContent: 'center',
  },

  switchLabel: {
    position: 'absolute',
    right: 10,
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
