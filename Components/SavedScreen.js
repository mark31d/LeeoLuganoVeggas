// Components/SavedScreen.js
// Saved places screen — как на твоих скринах:
// - blurred BG
// - если пусто: маленький toast "No saved places yet" по центру
// - если есть: список больших rounded-карточек + swipe switch "browse to look"
// - переход на экран деталей по placeId
//
// Assets (.webp):
// - assets/bg.webp
// - (опционально) assets/place_*.webp (замени под свои)
//
// ВАЖНО: используй тот же STORAGE_KEY в LocationScreen (когда жмёшь сердечко),
// чтобы SavedScreen видел сохранённые места.

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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const BG = require('../assets/bg.webp');

// поменяй на свой экран деталей локации (у тебя это LocationScreen.js)
const DETAILS_SCREEN = 'Location';

// ключ для сохранённых мест (объект { placeId: true }) - такой же как в LocationScreen
const FAV_KEY = '@lugano_favorites_v1';
const NOTES_KEY = '@lugano_notes_v1';

// ✅ Картинки (локальные), под каждый imageKey
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
      fact: 'It is often called "the sugar loaf of Switzerland" because of its shape.',
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
      title: "Cassina d'Agno Lakeside",
      description: 'A quieter lakeside area away from the city center.',
      fact: 'This spot is popular with locals rather than tourists.',
      address: "Via Al Lago, 6990 Cassina d'Agno, Switzerland",
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
      address: 'Piazza della Riforma, 6900 Lugano, Switzerland',
      imageKey: 'caffe_vanini',
    },
    {
      id: 'grand_cafe_lobby',
      title: 'Ristorante Grand Café Lobby',
      description: 'An elegant café with lake views.',
      fact: 'It offers a refined atmosphere for coffee and meals.',
      address: 'Via Nassa 23, 6900 Lugano, Switzerland',
      imageKey: 'grand_cafe_lobby',
    },
    {
      id: 'spaghetti_store',
      title: 'Spaghetti Store',
      description: 'A casual Italian restaurant in the city center.',
      fact: 'It specializes in fresh pasta dishes.',
      address: 'Via Pessina 4, 6900 Lugano, Switzerland',
      imageKey: 'spaghetti_store',
    },
    {
      id: 'manora_restaurant',
      title: 'Manora Restaurant',
      description: 'A popular restaurant with a variety of dishes.',
      fact: 'It is known for its buffet-style service.',
      address: 'Via Nassa 19, 6900 Lugano, Switzerland',
      imageKey: 'manora_restaurant',
    },
  ],
};

// Функция для получения места по ID
function getPlaceById(placeId) {
  for (const category in PLACES_BY_CATEGORY) {
    const place = PLACES_BY_CATEGORY[category].find(p => p.id === placeId);
    if (place) return place;
  }
  return null;
}

const COLORS = {
  gold: '#D7C58A',
  white: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.35)',
  // switch
  switchOffBg: 'rgba(255,255,255,0.10)',
  switchOnBg: '#4A90E2',
  knob: 'rgba(245,245,245,0.95)',
  toastBg: 'rgba(0,0,0,0.55)',
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

async function readFavorites() {
  try {
    const raw = await AsyncStorage.getItem(FAV_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // LocationScreen сохраняет объект { placeId: true }
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export default function SavedScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [favorites, setFavorites] = useState({});
  const [activePlace, setActivePlace] = useState(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const favs = await readFavorites();
        if (alive) setFavorites(favs);
        
        // Загружаем заметки
        try {
          const notesRaw = await AsyncStorage.getItem(NOTES_KEY);
          const notesArray = notesRaw ? JSON.parse(notesRaw) : [];
          if (alive) setNotes(notesArray);
        } catch (e) {
          if (alive) setNotes([]);
        }
      })();
      return () => {
        alive = false;
      };
    }, [])
  );

  const savedPlaces = useMemo(() => {
    // Преобразуем объект favorites { placeId: true } в массив мест
    const placeIds = Object.keys(favorites).filter(id => favorites[id]);
    return placeIds
      .map(placeId => getPlaceById(placeId))
      .filter(Boolean); // Убираем null если место не найдено
  }, [favorites]);

  const onOpenPlace = useCallback(
    place => {
      if (!place) return;
      setActivePlace(place.id);
      setTimeout(() => {
        setActivePlace(null);
        // Location находится в PlacesStack, поэтому используем nested navigation
        navigation.navigate('Places', {
          screen: 'Location',
          params: { place, fromScreen: 'Saved' },
        });
      }, 160);
    },
    [navigation]
  );

  const isEmpty = showNotes ? notes.length === 0 : savedPlaces.length === 0;

  const formatNoteDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const updatedNotes = notes.filter(n => n.id !== noteId);
      setNotes(updatedNotes);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (e) {
      console.error('Failed to delete note', e);
    }
  };

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

        {/* Header with Tabs */}
        <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
          <TouchableOpacity
            style={[styles.tabButton, !showNotes && styles.tabButtonActive]}
            onPress={() => setShowNotes(false)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabButtonText, !showNotes && styles.tabButtonTextActive]}>
              Places
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, showNotes && styles.tabButtonActive]}
            onPress={() => setShowNotes(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabButtonText, showNotes && styles.tabButtonTextActive]}>
              Notes
            </Text>
          </TouchableOpacity>
        </View>

        {isEmpty ? (
          <View style={styles.emptyWrap} pointerEvents="none">
            <View style={styles.toast}>
              <Text style={styles.toastText}>
                {showNotes ? 'No notes yet' : 'No saved places yet'}
              </Text>
            </View>
          </View>
        ) : showNotes ? (
          <ScrollView
            contentContainerStyle={[
              styles.list,
              {
                paddingTop: 12,
                paddingBottom: 130 + Math.max(insets.bottom, 10),
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {notes.map(note => (
              <View key={note.id} style={styles.noteCard}>
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
                  style={styles.noteGloss}
                  pointerEvents="none"
                />

                <View style={styles.noteCardContent}>
                  <View style={styles.noteCardHeader}>
                    <Text style={styles.noteCardTitle}>{note.title}</Text>
                    <View style={styles.noteCardActions}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('AddNote', { note })}
                        style={styles.editButton}
                      >
                        <Text style={styles.editButtonText}>✎</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => deleteNote(note.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {note.date && (
                    <Text style={styles.noteCardDate}>{formatNoteDate(note.date)}</Text>
                  )}

                  {note.image && (
                    <Image source={{ uri: note.image }} style={styles.noteCardImage} />
                  )}

                  {note.text && (
                    <Text style={styles.noteCardText}>{note.text}</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={[
              styles.list,
              {
                paddingTop: 12,
                paddingBottom: 130 + Math.max(insets.bottom, 10),
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {savedPlaces.map(place => {
              const isOn = activePlace === place.id;
              const img = (place.imageKey && PLACE_IMAGES[place.imageKey]) || BG;

              return (
                <TouchableOpacity
                  key={place.id}
                  activeOpacity={0.95}
                  onPress={() => onOpenPlace(place)}
                  style={styles.cardWrap}
                >
                  <View style={styles.card}>
                    <Image source={img} style={styles.cardImg} resizeMode="cover" />

                    <LinearGradient
                      colors={['rgba(0,0,0,0.00)', 'rgba(0,0,0,0.42)']}
                      start={{ x: 0.25, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={styles.cardShade}
                      pointerEvents="none"
                    />

                    <View style={styles.cardBottomRow}>
                      <Text style={styles.cardTitle}>{place.title}</Text>

                      <SwipeSwitch
                        value={isOn}
                        onChange={next => {
                          if (!next) {
                            setActivePlace(null);
                            return;
                          }
                          onOpenPlace(place);
                        }}
                        width={128}
                        height={26}
                        label="browse to look"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.10)' },

  // Header with Tabs
  header: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingBottom: 12,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 107, 53, 0.30)',
    borderColor: 'rgba(255, 107, 53, 0.60)',
  },
  tabButtonText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '800',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 90, // чтобы визуально было чуть выше таббара
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.toastBg,
  },
  toastText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    fontWeight: '700',
  },

  // List
  list: {
    paddingHorizontal: 18,
  },
  cardWrap: {
    marginBottom: 18,
  },
  card: {
    height: 136,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cardImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 86,
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
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: COLORS.shadow,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
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

  // Note Card
  noteCard: {
    marginBottom: 18,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(215,197,138,0.55)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
    overflow: 'hidden',
    minHeight: 120,
  },
  noteGloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 50,
  },
  noteCardContent: {
    padding: 20,
  },
  noteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteCardTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginRight: 12,
  },
  noteCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '300',
  },
  noteCardDate: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  noteCardImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  noteCardText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
});
