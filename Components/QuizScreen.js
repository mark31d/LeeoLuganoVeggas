// Components/QuizScreen.js
// Updated:
// ✅ Result screen вынесен в отдельный QuizResultsScreen.js
// ✅ Questions 1–12 EXACTLY as you sent (with hints + options + correct)
// Assets (.webp):
// - assets/bg.webp
// - assets/quiz_assistant_intro.webp
// - assets/parchment.webp

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  StatusBar,
  TouchableOpacity,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const BG = require('../assets/bg.webp');

// intro assistant image
const ASSISTANT_INTRO = require('../assets/quiz_assistant_intro.webp');

const PARCHMENT = require('../assets/parchment.webp');
const BACK_ICON = require('../assets/back.webp');

// change to your routes if needed
const CONTINUE_ROUTE_DEFAULT = 'CategoriesScreen';
const RESULTS_ROUTE = 'QuizResults';

const COLORS = {
  gold: '#D7C58A',
  white: '#FFFFFF',
  dim: 'rgba(0,0,0,0.18)',

  panelTop: '#FF6B35',
  panelBottom: '#CC5500',

  ansTop: '#FF6B35',
  ansBottom: '#CC5500',

  greenTop: '#4A90E2',
  greenBottom: '#2E5C8A',

  redTop: '#D9352E',
  redBottom: '#A91111',

  hintBg: 'rgba(215,197,138,0.28)',
  hintBg2: 'rgba(215,197,138,0.20)',
};

const QUIZ_TIME_SEC = 30;

// ✅ YOUR 12 QUESTIONS (exact)
const QUESTIONS = [
  {
    q: 'Which place offers one of the best panoramic views over Lugano?',
    hint: 'A sunny mountain above the city, popular for sunsets.',
    options: ['Monte Brè', 'Parco Ciani', 'Via Nassa', 'Piazza della Riforma'],
    answerIndex: 0,
  },
  {
    q: 'Which place is often called the “sugar loaf of Switzerland”?',
    hint: 'A steep mountain rising directly above the lake.',
    options: ['Monte San Salvatore', 'Belvedere Gardens', 'Gandria Village', 'Cathedral of Saint Lawrence'],
    answerIndex: 0,
  },
  {
    q: 'Where can you enjoy a calm walk surrounded by trees next to the lake?',
    hint: 'One of the most photographed parks in Lugano.',
    options: ['Parco Ciani', 'Castagnola Viewpoint', 'Via Nassa', 'Contrada di Verla'],
    answerIndex: 0,
  },
  {
    q: 'Which street is known for elegant arcades and shopping?',
    hint: 'A historic street dating back to medieval times.',
    options: ['Via Nassa', 'Piazza della Riforma', 'Lungolago', 'Cassina d’Agno'],
    answerIndex: 0,
  },
  {
    q: 'Which place is the main square of Lugano?',
    hint: 'A lively spot surrounded by cafés and city life.',
    options: ['Piazza della Riforma', 'Cathedral of Saint Lawrence', 'Belvedere Park', 'Monte Brè'],
    answerIndex: 0,
  },
  {
    q: 'Where can you see one of the most important Renaissance frescoes in Switzerland?',
    hint: 'A historic church near the old town.',
    options: ['Santa Maria degli Angioli', 'Cathedral of Saint Lawrence', 'Parco San Michele', 'Gandria Village'],
    answerIndex: 0,
  },
  {
    q: 'Which place offers elevated views and a quiet atmosphere, mostly visited by locals?',
    hint: 'A small park away from tourist crowds.',
    options: ['Parco San Michele', 'Belvedere Gardens', 'Lungolago', 'Via Nassa'],
    answerIndex: 0,
  },
  {
    q: 'Where can you enjoy a long walk along the lake promenade?',
    hint: 'A popular waterfront path connecting key areas of the city.',
    options: ['Lungolago', 'Cassina d’Agno', 'Monte Brè', 'Old Town'],
    answerIndex: 0,
  },
  {
    q: 'Which place is a scenic walk carved into rocks above the lake?',
    hint: 'A path leading to a charming lakeside village.',
    options: ['Gandria Village Walk', 'Belvedere Park', 'Parco Ciani', 'Via Nassa'],
    answerIndex: 0,
  },
  {
    q: 'Which place offers a calm lakeside atmosphere away from the city center?',
    hint: 'A spot more popular with locals than tourists.',
    options: ['Cassina d’Agno Lakeside', 'Piazza della Riforma', 'Monte San Salvatore', 'Parco Ciani'],
    answerIndex: 0,
  },
  {
    q: 'Which place is known for classic Swiss hospitality and light meals?',
    hint: 'An elegant café-restaurant near the city center.',
    options: ['Grand Café Lobby', 'Spaghetti Store', 'Caffè Vanini', 'Manora Restaurant'],
    answerIndex: 0,
  },
  {
    q: 'Which place offers one of the best dining views over Lugano?',
    hint: 'A restaurant located above the city.',
    options: ['Manora Restaurant', 'Grand Café Al Porto', 'Via Nassa', 'Parco San Michele'],
    answerIndex: 0,
  },
];

function CircleBack({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.backBtn}>
      <Image source={BACK_ICON} style={styles.backIcon} resizeMode="contain" />
    </TouchableOpacity>
  );
}

function ScorePill({ color, value }) {
  return (
    <View style={styles.scorePill}>
      <View style={[styles.scoreDot, { backgroundColor: color }]} />
      <Text style={styles.scoreValue}>{value}</Text>
    </View>
  );
}

function AnswerButton({ label, state, onPress, disabled }) {
  const grad =
    state === 'correct'
      ? [COLORS.greenTop, COLORS.greenBottom]
      : state === 'wrong'
      ? [COLORS.redTop, COLORS.redBottom]
      : [COLORS.ansTop, COLORS.ansBottom];

  return (
    <TouchableOpacity activeOpacity={0.92} disabled={disabled} onPress={onPress} style={styles.ansWrap}>
      <LinearGradient
        colors={grad}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.ansBtn, disabled && state === 'idle' ? { opacity: 0.92 } : null]}
      >
        <Text style={styles.ansText}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function QuizScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const continueRoute = route?.params?.continueRoute || CONTINUE_ROUTE_DEFAULT;

  // ✅ safe-area для контента (чтобы кнопка/текст не лезли под home-indicator)
  const SAFE_CONTENT_BOTTOM = Math.max(insets.bottom, 18);

  // ✅ "уходим" ПОД линию (делаем немного больше, чем insets.bottom)
  const UNDERLAP =
    Platform.OS === 'ios'
      ? Math.max(insets.bottom, 24) + 18
      : Math.max(insets.bottom, 0);

  // ✅ высота панели (чтобы была "как в примере", и +UNDERLAP чтобы градиент дотянулся вниз)
  const PANEL_MIN_HEIGHT = 260 + SAFE_CONTENT_BOTTOM + UNDERLAP;

  const [phase, setPhase] = useState('intro'); // intro | quiz
  const [index, setIndex] = useState(0);

  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);

  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_SEC);
  const [hintShown, setHintShown] = useState(false);

  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  const fade = useRef(new Animated.Value(1)).current;
  const timerIntervalRef = useRef(null);

  // refs to always have latest counts for финальный переход
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  useEffect(() => { correctRef.current = correct; }, [correct]);
  useEffect(() => { wrongRef.current = wrong; }, [wrong]);

  const total = QUESTIONS.length;
  const q = QUESTIONS[index];

  // Перемешиваем варианты ответов и обновляем индекс правильного ответа
  const shuffledQuestion = useMemo(() => {
    if (!q) return null;
    
    // Создаем массив с индексами для перемешивания
    const indices = q.options.map((_, i) => i);
    
    // Перемешиваем индексы (Fisher-Yates shuffle)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Создаем новый массив опций в перемешанном порядке
    const shuffledOptions = indices.map(i => q.options[i]);
    
    // Находим новый индекс правильного ответа
    const newAnswerIndex = indices.indexOf(q.answerIndex);
    
    return {
      ...q,
      options: shuffledOptions,
      answerIndex: newAnswerIndex,
    };
  }, [q, index]); // Перемешиваем при смене вопроса

  const resetRun = useCallback(() => {
    setIndex(0);
    setCorrect(0);
    setWrong(0);
    correctRef.current = 0;
    wrongRef.current = 0;

    setTimeLeft(QUIZ_TIME_SEC);
    setHintShown(false);
    setSelected(null);
    setLocked(false);
  }, []);

  const startQuiz = useCallback(() => {
    resetRun();
    setPhase('quiz');
  }, [resetRun]);

  // если пришли из результатов по "Start Again" -> сразу стартуем квиз
  useEffect(() => {
    if (route?.params?.startAtQuiz) {
      startQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.params?.startAtQuiz]);

  const finishQuiz = useCallback(
    (finalCorrect, finalWrong) => {
      // QuizResults находится в QuizStack, используем правильную навигацию
      navigation.navigate('QuizResults', {
        correct: finalCorrect,
        wrong: finalWrong,
        total,
        continueRoute,
      });
    },
    [navigation, total, continueRoute]
  );

  const goNext = useCallback(
    (finalCounts) => {
      const next = index + 1;

      if (next >= total) {
        const fc = finalCounts?.correct ?? correctRef.current;
        const fw = finalCounts?.wrong ?? wrongRef.current;
        finishQuiz(fc, fw);
        return;
      }

      // Плавное обновление только вопроса и ответов
      fade.setValue(0);
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      setIndex(next);
      setTimeLeft(QUIZ_TIME_SEC);
      setHintShown(false);
      setSelected(null);
      setLocked(false);
    },
    [finishQuiz, index, total, fade]
  );

  // timer: запускается на каждый вопрос
  useEffect(() => {
    if (phase !== 'quiz') return;
    if (locked) {
      // Останавливаем таймер если вопрос заблокирован
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    setTimeLeft(QUIZ_TIME_SEC);

    // Очищаем предыдущий интервал если есть
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev <= 1 ? 0 : prev - 1;
        // Когда время вышло, сразу обрабатываем переход
        if (next === 0) {
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          // Вызываем переход напрямую
          setLocked(true);
          const nextWrong = wrongRef.current + 1;
          wrongRef.current = nextWrong;
          setWrong(v => v + 1);
          
          setTimeout(() => {
            goNext({ correct: correctRef.current, wrong: nextWrong });
          }, 650);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, locked, goNext]);

  // time up -> wrong and next
  useEffect(() => {
    if (phase !== 'quiz') return;
    if (locked) return;
    if (timeLeft !== 0) return;

    // Время вышло - блокируем и переходим на следующий вопрос
    setLocked(true);
    const nextWrong = wrongRef.current + 1;
    wrongRef.current = nextWrong;
    setWrong(v => v + 1);

    const to = setTimeout(() => {
      goNext({ correct: correctRef.current, wrong: nextWrong });
    }, 650);

    return () => clearTimeout(to);
  }, [timeLeft, phase, locked, goNext]);

  const onPick = useCallback(
    pickIndex => {
      if (locked) return;
      if (!shuffledQuestion) return;
      setLocked(true);
      setSelected(pickIndex);

      const isCorrect = pickIndex === shuffledQuestion.answerIndex;

      const nextCorrect = correctRef.current + (isCorrect ? 1 : 0);
      const nextWrong = wrongRef.current + (isCorrect ? 0 : 1);

      correctRef.current = nextCorrect;
      wrongRef.current = nextWrong;

      if (isCorrect) setCorrect(v => v + 1);
      else setWrong(v => v + 1);

      setTimeout(() => {
        goNext({ correct: nextCorrect, wrong: nextWrong });
      }, 650);
    },
    [locked, shuffledQuestion, goNext]
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

        {/* INTRO */}
        {phase === 'intro' && (
          <View style={styles.fill}>
            <View style={[styles.topIntroRow, { paddingTop: insets.top + 10, paddingHorizontal: 16 }]}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()} 
                activeOpacity={0.9} 
                style={styles.topIntroContainer}
              >
                <Image source={BACK_ICON} style={styles.backIconInContainer} resizeMode="contain" />
                <Text style={styles.topIntroText} numberOfLines={1} ellipsizeMode="tail">
                  You are in game mode. To exit, click the arrow.
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.introHero}>
              <Image source={ASSISTANT_INTRO} style={styles.introAssistant} resizeMode="contain" />
            </View>

            <LinearGradient
              colors={[COLORS.panelTop, COLORS.panelBottom]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[
                styles.bottomPanel,
                {
                  bottom: -UNDERLAP, // <<< ключ: за нижнюю линию (как в Onboarding)
                  minHeight: PANEL_MIN_HEIGHT,
                  paddingBottom: SAFE_CONTENT_BOTTOM + 18, // контент выше safe-area
                },
              ]}
            >
              {/* subtle gloss */}
              <LinearGradient
                colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.00)']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gloss}
                pointerEvents="none"
              />
              
              <View style={styles.panelContent}>
                <Text style={styles.panelTitle}>City Quiz</Text>
                <Text style={styles.panelSubtitle}>
                  Twelve questions. One city.{"\n"}Discover how well you know it.
                </Text>

                <TouchableOpacity activeOpacity={0.9} onPress={startQuiz} style={styles.primaryBtnWrap}>
                  <View style={styles.primaryBtn}>
                    <Text style={styles.primaryBtnText}>Go</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* QUIZ */}
        {phase === 'quiz' && (
          <View style={styles.fill}>
            <View style={[styles.quizHeader, { paddingTop: insets.top + 10 }]}>
              <View style={styles.quizHeaderLeft}>
                <CircleBack onPress={() => setPhase('intro')} />
                <Text style={styles.progressText}>
                  {index + 1}/{total}
                </Text>
              </View>

              <View style={styles.quizHeaderRight}>
                <Text style={styles.timerText}>0:{String(timeLeft).padStart(2, '0')}</Text>
                <View style={styles.scoreStack}>
                  <ScorePill color={COLORS.greenTop} value={correct} />
                  <ScorePill color={COLORS.redTop} value={wrong} />
                </View>
              </View>
            </View>

            <ScrollView 
              style={styles.quizScroll}
              contentContainerStyle={styles.quizScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={[styles.quizBody, { opacity: fade }]} key={`quiz-content-${index}`}>
                <ImageBackground source={PARCHMENT} style={styles.parchment} imageStyle={styles.parchmentImg}>
                  <Text style={styles.questionText}>{q.q}</Text>
                </ImageBackground>

                {!hintShown ? (
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() => setHintShown(true)}
                    style={[styles.hintBtnWrap, styles.hintBtn]}
                    disabled={locked}
                  >
                    <Text style={styles.hintBtnText}>Hint</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.hintCard}>
                    <Text style={styles.hintCardText}>{q.hint}</Text>
                  </View>
                )}

                <View style={styles.answers}>
                  {shuffledQuestion?.options.map((opt, i) => {
                    const isCorrect = i === shuffledQuestion.answerIndex;
                    const isSelected = selected === i;

                    let state = 'idle';
                    if (locked) {
                      if (isSelected && isCorrect) state = 'correct';
                      else if (isSelected && !isCorrect) state = 'wrong';
                      else if (selected != null && isCorrect) state = 'correct';
                    }

                    return (
                      <AnswerButton
                        key={`${index}-${i}`}
                        label={opt}
                        state={state}
                        disabled={locked}
                        onPress={() => onPick(i)}
                      />
                    );
                  })}
                </View>
              </Animated.View>
            </ScrollView>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  bg: { flex: 1 },
  fill: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.dim },

  backBtn: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { width: 38, height: 38, tintColor: '#fff' },

  topIntroRow: { flexDirection: 'row', alignItems: 'center' },
  topIntroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingLeft: 12,
    paddingRight: 20,
  },
  backIconInContainer: {
    left:-10,
    width: 40,
    height: 40,
    tintColor: '#fff',
    marginRight: 5, // Отступ между иконкой и текстом
  },
  topIntroText: { 
    flex: 1,
    color: 'rgba(255,255,255,0.92)', 
    fontSize: 12, 
    fontWeight: '700',
  },

  introHero: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 140 },
  introAssistant: { width: '92%', height: '92%' },

  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 34, // Верхнее закругление
    borderTopRightRadius: 34, // Верхнее закругление
    borderBottomLeftRadius: 34, // Нижнее закругление
    borderBottomRightRadius: 34, // Нижнее закругление
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
    paddingTop: 0,
  },
  gloss: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 26,
  },
  panelContent: {
    paddingTop: 18,
    paddingHorizontal: 22,
  },

  panelTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  panelSubtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },

  primaryBtnWrap: { alignItems: 'center', marginTop: 6 },
  primaryBtn: {
    width: 280,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(215,197,138,0.80)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 22, fontWeight: '900' },

  quizHeader: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  quizHeaderRight: { alignItems: 'flex-end', gap: 6, marginTop: 6 },
  timerText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  scoreStack: { gap: 8 },
  scorePill: {
    width: 72,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.6,
    borderColor: 'rgba(215,197,138,0.75)',
    backgroundColor: 'rgba(0,0,0,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  scoreDot: { width: 18, height: 18, borderRadius: 9 },
  scoreValue: { color: '#fff', fontSize: 16, fontWeight: '900' },

  quizScroll: { flex: 1 },
  quizScrollContent: { flexGrow: 1, paddingBottom: 100 },
  quizBody: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 12 },

  parchment: {
    width: 300,
    maxWidth: 400,
    aspectRatio: 1.52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 18,
  },
  parchmentImg: { borderRadius: 10 },
  questionText: {
    color: 'rgba(0,0,0,0.55)',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 26,
  },

  hintBtnWrap: { width: '86%', maxWidth: 360, marginBottom: 18 },
  hintBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.hintBg,
    borderWidth: 2,
    borderColor: 'rgba(215,197,138,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  hintCard: {
    width: '86%',
    maxWidth: 360,
    borderRadius: 22,
    backgroundColor: COLORS.hintBg2,
    borderWidth: 2,
    borderColor: 'rgba(215,197,138,0.85)',
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  hintCardText: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center', lineHeight: 24 },

  answers: { width: '100%', paddingTop: 6, gap: 14, paddingHorizontal: 8 },
  ansWrap: { width: '100%' },
  ansBtn: {
    height: 64,
    
    borderRadius: 32,
    borderWidth: 1.2,
    borderColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
   

  },
  ansText: { color: '#fff', fontSize: 22, fontWeight: '900' , textAlign:'center'},
});
