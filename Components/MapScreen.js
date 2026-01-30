// Components/MapScreen.js
// Map like your screenshot but WITHOUT map library:
// - Background is image map.webp
// - Clickable markers positioned by percentages
// - Tap marker => show preview card (image + title + swipe switch)
// - Swipe switch ON => navigate to LocationScreen with { placeId }
//
// Assets (.webp):
// - assets/map.webp
// - assets/bg.webp (fallback for preview if some place image is missing)
// - assets/place_*.webp (per place preview)

import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  ImageBackground,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const MAP_IMG = require('../assets/map.webp');
const BG = require('../assets/bg.webp'); // ✅ fallback вместо плейсхолдера
const PIN_IMG = require('../assets/pin.webp');

const DETAILS_SCREEN = 'Location';

const COLORS = {
  gold: '#D7C58A',
  switchOffBg: 'rgba(255,255,255,0.10)',
  switchOnBg: '#4A90E2',
  knob: 'rgba(245,245,245,0.95)',
};

// ✅ Реальные картинки по placeId (как ты делал в PlacesListScreen)
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

// Данные всех мест (из PlacesListScreen)
const PLACES_BY_CATEGORY = {
  viewpoints: [
    { id: 'monte_bre', title: 'Monte Brè', description: 'One of the most scenic viewpoints in Lugano with wide views over the lake and city.', fact: 'Monte Brè is considered one of the sunniest places in Switzerland.', address: 'Monte Brè, 6979 Lugano, Switzerland', imageKey: 'monte_bre' },
    { id: 'monte_san_salvatore', title: 'Monte San Salvatore', description: 'A dramatic mountain offering breathtaking panoramic views.', fact: 'It is often called "the sugar loaf of Switzerland" because of its shape.', address: 'Via delle Scuole 7, 6916 Lugano, Switzerland', imageKey: 'monte_san_salvatore' },
    { id: 'belvedere_gardens', title: 'Belvedere Gardens', description: 'A peaceful terrace overlooking the lake, surrounded by greenery.', fact: 'The gardens were created as a quiet escape from the city.', address: 'Viale Castagnola, 6900 Lugano, Switzerland', imageKey: 'belvedere_gardens' },
    { id: 'castagnola_viewpoint', title: 'Castagnola Viewpoint', description: 'A calm lakeside viewpoint with elegant villas and reflections on the water.', fact: 'The area has long attracted artists and writers.', address: 'Riva Albertolli, 6900 Lugano, Switzerland', imageKey: 'castagnola_viewpoint' },
    { id: 'parco_san_michele', title: 'Parco San Michele', description: 'A quiet park with elevated views above the city.', fact: 'It is mostly visited by locals at sunset.', address: 'Via San Michele, 6900 Lugano, Switzerland', imageKey: 'parco_san_michele' },
  ],
  old_town: [
    { id: 'piazza_della_riforma', title: 'Piazza della Riforma', description: 'The main square of Lugano, surrounded by cafés and historic buildings.', fact: 'Many city events and festivals take place here.', address: 'Piazza della Riforma, 6900 Lugano, Switzerland', imageKey: 'piazza_della_riforma' },
    { id: 'via_nassa', title: 'Via Nassa', description: 'An elegant shopping street with historic arcades.', fact: 'It dates back to medieval times and was once used by fishermen.', address: 'Via Nassa, 6900 Lugano, Switzerland', imageKey: 'via_nassa' },
    { id: 'santa_maria_angioli', title: 'Santa Maria degli Angioli', description: 'A historic church famous for its Renaissance frescoes.', fact: 'Its fresco is considered one of the most important in Switzerland.', address: 'Via Nassa 28, 6900 Lugano, Switzerland', imageKey: 'santa_maria_angioli' },
    { id: 'cathedral_saint_lawrence', title: 'Cathedral of Saint Lawrence', description: 'The main cathedral of Lugano, overlooking the city.', fact: 'The cathedral was rebuilt in the 15th century.', address: 'Piazza Luini 6, 6900 Lugano, Switzerland', imageKey: 'cathedral_saint_lawrence' },
    { id: 'contrada_verla', title: 'Contrada di Verla', description: 'A narrow historic street with authentic character.', fact: 'It preserves the original medieval layout of Lugano.', address: 'Contrada di Verla, 6900 Lugano, Switzerland', imageKey: 'contrada_verla' },
  ],
  lake: [
    { id: 'parco_ciani', title: 'Parco Ciani', description: 'A large lakeside park with open views and walking paths.', fact: 'It is one of the most photographed places in Lugano.', address: 'Viale Carlo Cattaneo, 6900 Lugano, Switzerland', imageKey: 'parco_ciani' },
    { id: 'lungolago', title: 'Lungolago', description: 'The main waterfront promenade along the lake.', fact: 'It connects several key areas of the city.', address: 'Riva Vincenzo Vela, 6900 Lugano, Switzerland', imageKey: 'lungolago' },
    { id: 'belvedere_park', title: 'Belvedere Park', description: 'A calm lakeside park with mountain views.', fact: 'The water often reflects the mountains on clear days.', address: 'Viale Castagnola, 6900 Lugano, Switzerland', imageKey: 'belvedere_park' },
    { id: 'cassina_agno_lakeside', title: 'Cassina d\'Agno Lakeside', description: 'A quieter lakeside area away from the city center.', fact: 'This spot is popular with locals rather than tourists.', address: 'Via Al Lago, 6990 Cassina d\'Agno, Switzerland', imageKey: 'cassina_agno_lakeside' },
    { id: 'gandria_village_walk', title: 'Gandria Village Walk', description: 'A scenic lakeside path leading to the village of Gandria.', fact: 'The path is carved into the rocks above the lake.', address: 'Sentiero di Gandria, 6978 Lugano, Switzerland', imageKey: 'gandria_village_walk' },
  ],
  cafes: [
    { id: 'grand_cafe_al_porto', title: 'Grand Café Al Porto', description: 'A classic café near the waterfront with outdoor seating.', fact: 'It has been a local meeting place for decades.', address: 'Via Pessina 14, 6900 Lugano, Switzerland', imageKey: 'grand_cafe_al_porto' },
    { id: 'caffe_vanini', title: 'Caffè Vanini', description: 'A historic café known for pastries and coffee.', fact: 'The café dates back to the 19th century.', address: 'Piazza della Riforma 7, 6900 Lugano, Switzerland', imageKey: 'caffe_vanini' },
    { id: 'grand_cafe_lobby', title: 'Ristorante Grand Café Lobby', description: 'An elegant restaurant for light meals and drinks.', fact: 'Its interior reflects classic Swiss hospitality style.', address: 'Via Giocondo Albertolli 5, 6900 Lugano, Switzerland', imageKey: 'grand_cafe_lobby' },
    { id: 'spaghetti_store', title: 'Spaghetti Store', description: 'A casual place serving simple Italian dishes.', fact: 'It is popular for quick lunches in the city center.', address: 'Via Nassa 15, 6900 Lugano, Switzerland', imageKey: 'spaghetti_store' },
    { id: 'manora_restaurant', title: 'Manora Restaurant', description: 'A relaxed restaurant with panoramic city views.', fact: 'It offers one of the best dining views in Lugano.', address: 'Via Pessina 16, 6900 Lugano, Switzerland', imageKey: 'manora_restaurant' },
  ],
};

// Функция для получения place по placeId
function getPlaceById(placeId) {
  for (const category in PLACES_BY_CATEGORY) {
    const place = PLACES_BY_CATEGORY[category].find(p => p.id === placeId);
    if (place) return place;
  }
  return null;
}

// ---- MARKERS: set x/y as % of screen (0..1) under your map.webp ----
// Все пины размещены на суше (нижняя часть карты, НЕ на воде)
// Координаты распределены так, чтобы пины не накладывались и не заходили на карточку превью
// Пины размещены чуть ниже и шире разбросаны по ширине
const MARKERS = [
  // viewpoints - на суше, более разбросаны
  { placeId: 'monte_bre', title: 'Monte Brè', x: 0.05, y: 0.52 },
  { placeId: 'monte_san_salvatore', title: 'Monte San Salvatore', x: 0.22, y: 0.48 },
  { placeId: 'belvedere_gardens', title: 'Belvedere Gardens', x: 0.38, y: 0.50 },
  { placeId: 'castagnola_viewpoint', title: 'Castagnola Viewpoint', x: 0.55, y: 0.46 },
  { placeId: 'parco_san_michele', title: 'Parco San Michele', x: 0.75, y: 0.52 },
  // old town - на суше, более разбросаны
  { placeId: 'piazza_della_riforma', title: 'Piazza della Riforma', x: 0.08, y: 0.58 },
  { placeId: 'via_nassa', title: 'Via Nassa', x: 0.28, y: 0.56 },
  { placeId: 'santa_maria_angioli', title: 'Santa Maria degli Angioli', x: 0.48, y: 0.60 },
  { placeId: 'cathedral_saint_lawrence', title: 'Cathedral of Saint Lawrence', x: 0.68, y: 0.54 },
  { placeId: 'contrada_verla', title: 'Contrada di Verla', x: 0.88, y: 0.58 },
  // lake - на суше, более разбросаны
  { placeId: 'parco_ciani', title: 'Parco Ciani', x: 0.12, y: 0.64 },
  { placeId: 'lungolago', title: 'Lungolago', x: 0.32, y: 0.68 },
  { placeId: 'belvedere_park', title: 'Belvedere Park', x: 0.52, y: 0.62 },
  { placeId: 'cassina_agno_lakeside', title: 'Cassina d\'Agno Lakeside', x: 0.72, y: 0.64 },
  { placeId: 'gandria_village_walk', title: 'Gandria Village Walk', x: 0.92, y: 0.60 },
  // cafes - на суше, более разбросаны
  { placeId: 'grand_cafe_al_porto', title: 'Grand Café Al Porto', x: 0.06, y: 0.70 },
  { placeId: 'caffe_vanini', title: 'Caffè Vanini', x: 0.26, y: 0.74 },
  { placeId: 'grand_cafe_lobby', title: 'Ristorante Grand Café Lobby', x: 0.46, y: 0.72 },
  { placeId: 'spaghetti_store', title: 'Spaghetti Store', x: 0.66, y: 0.76 },
  { placeId: 'manora_restaurant', title: 'Manora Restaurant', x: 0.86, y: 0.70 },
];

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

export default function MapScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState(MARKERS[0]);
  const [switchOn, setSwitchOn] = useState(false);

  const { width: W, height: H } = Dimensions.get('window');

  const previewImg = useMemo(() => {
    if (!selected) return BG;
    return PLACE_IMAGES[selected.placeId] || BG; // ✅ без плейсхолдера
  }, [selected]);

  const openSelected = () => {
    if (!selected) return;
    setSwitchOn(true);
    setTimeout(() => {
      setSwitchOn(false);
      const place = getPlaceById(selected.placeId);
      if (place) {
        // LocationScreen находится в PlacesStack, поэтому используем nested navigation
        // Передаем fromScreen для правильного возврата
        navigation.navigate('Places', {
          screen: 'Location',
          params: { place, fromScreen: 'Map' },
        });
      }
    }, 140);
  };

  const openNoteScreen = () => {
    navigation.navigate('AddNote');
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ImageBackground source={MAP_IMG} style={styles.map} resizeMode="cover">
        {/* Markers */}
        {MARKERS.map(m => {
          const left = m.x * W - 23; // 23 = half marker width (46/2)
          const top = m.y * H - 46;  // 46 = visual offset for pin
          const active = selected?.placeId === m.placeId;

          return (
            <TouchableOpacity
              key={m.placeId}
              activeOpacity={0.9}
              onPress={() => {
                setSelected(m);
                setSwitchOn(false);
              }}
              style={[
                styles.marker,
                { left, top, transform: [{ scale: active ? 1.06 : 1 }] },
              ]}
            >
              <Image source={PIN_IMG} style={styles.markerPin} resizeMode="contain" />
            </TouchableOpacity>
          );
        })}

        {/* Preview card */}
        {!!selected && (
          <View style={[styles.previewWrap, { top: insets.top + 66 }]}>
            <View style={styles.previewCard}>
              <Image source={previewImg} style={styles.previewImg} resizeMode="cover" />

              <LinearGradient
                colors={['rgba(0,0,0,0.00)', 'rgba(0,0,0,0.42)']}
                start={{ x: 0.3, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.previewShade}
                pointerEvents="none"
              />

              <View style={styles.previewBottomRow}>
                <Text style={styles.previewTitle}>{selected.title}</Text>

                <SwipeSwitch
                  value={switchOn}
                  onChange={next => {
                    if (!next) {
                      setSwitchOn(false);
                      return;
                    }
                    openSelected();
                  }}
                  width={128}
                  height={26}
                  label="browse to look"
                />
              </View>

              {/* Тап по карточке тоже открывает */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.previewTap}
                onPress={openSelected}
              />
            </View>
          </View>
        )}

        {/* Add Note Button */}
        <TouchableOpacity
          style={[styles.addNoteButton, { bottom: insets.bottom + 120 }]}
          onPress={openNoteScreen}
          activeOpacity={0.8}
        >
          <Text style={styles.addNoteButtonText}>+</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },

  marker: {
    position: 'absolute',
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 46,
    height: 46,
  },

  previewWrap: {
    position: 'absolute',
    left: 18,
    right: 18,
  },

  previewCard: {
    height: 145,
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },

  previewTap: { ...StyleSheet.absoluteFillObject },

  previewImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  previewShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
  },

  previewBottomRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  previewTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
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

  // Add Note Button
  addNoteButton: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    borderWidth: 2,
    borderColor: 'rgba(215,197,138,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  addNoteButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },

});
