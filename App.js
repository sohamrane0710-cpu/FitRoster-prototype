import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#F4F5F7',
  white: '#FFFFFF',
  primary: '#FA2A55',
  primaryDark: '#D91E48',
  softPink: '#FDECEF',
  softPinkBorder: '#FAD4DC',
  navy: '#181C28',
  navyMuted: '#9DA5B8',
  navyPink: '#F29AAE',
  text: '#141824',
  textSecondary: '#6A7181',
  textMuted: '#8E95A5',
  inputBg: '#F1F2F6',
  border: '#E5E7EE',
  blue: '#4D74C7',
  green: '#2E8B6E',
  trackBg: '#E6E8EF',
};

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const INITIAL_PRESETS = [
  {
    id: 'p1',
    type: 'saved',
    badge: 'YOUR SAVED PRESET',
    title: 'Upper body strength',
    meta: '5 exercises · 45 min · Last used 11 Nov',
    duration: '45 min',
    exercises: [
      {
        id: 'e1',
        name: 'Barbell bench press',
        sets: '3',
        reps: '10',
        rest: '90 sec',
        note: 'Controlled lowering, strong press.',
      },
      {
        id: 'e2',
        name: 'Incline dumbbell press',
        sets: '3',
        reps: '12',
        rest: '75 sec',
        note: 'Keep shoulder blades retracted.',
      },
      {
        id: 'e3',
        name: 'Seated cable row',
        sets: '3',
        reps: '12',
        rest: '60 sec',
        note: 'Pause 1 second at chest.',
      },
    ],
  },
  {
    id: 'p2',
    type: 'fitroster',
    badge: 'MADE BY FITROSTER',
    title: 'Full body foundations',
    meta: '6 exercises · 40 min · Beginner',
    duration: '40 min',
    exercises: [
      {
        id: 'e4',
        name: 'Goblet squat',
        sets: '3',
        reps: '12',
        rest: '60 sec',
        note: 'Chest tall, knees track toes.',
      },
      {
        id: 'e5',
        name: 'Push-ups',
        sets: '3',
        reps: '10',
        rest: '60 sec',
        note: 'Maintain a straight plank line.',
      },
      {
        id: 'e6',
        name: 'Romanian deadlift',
        sets: '3',
        reps: '10',
        rest: '90 sec',
        note: 'Hinge at hips with soft knees.',
      },
    ],
  },
  {
    id: 'p3',
    type: 'fitroster',
    badge: '',
    title: 'Strength & conditioning',
    meta: '7 exercises · 50 min · Intermediate',
    duration: '50 min',
    isPreviewStyle: true,
    exercises: [
      {
        id: 'e7',
        name: 'Back squat',
        sets: '4',
        reps: '6',
        rest: '120 sec',
        note: 'Brace core before descending.',
      },
      {
        id: 'e8',
        name: 'Kettlebell swings',
        sets: '4',
        reps: '15',
        rest: '60 sec',
        note: 'Explosive hip drive.',
      },
    ],
  },
];

const EXERCISE_PROGRESS_DATA = {
  'Barbell bench press': {
    current: '40 kg',
    delta: '+10 kg since 4 Nov',
    subtitle: 'Best logged load at 10 reps · Last 2 weeks',
    yLabels: ['40', '35', '30'],
    min: 30,
    max: 40,
    points: [30, 32.5, 35, 37.5, 40],
  },
  'Incline dumbbell press': {
    current: '24 kg',
    delta: '+4 kg since 4 Nov',
    subtitle: 'Best logged load at 12 reps · Last 2 weeks',
    yLabels: ['25', '22', '19'],
    min: 19,
    max: 25,
    points: [20, 21, 22, 23, 24],
  },
  'Seated cable row': {
    current: '55 kg',
    delta: '+5 kg since 4 Nov',
    subtitle: 'Best logged load at 12 reps · Last 2 weeks',
    yLabels: ['60', '55', '50'],
    min: 50,
    max: 60,
    points: [50, 52, 52.5, 54, 55],
  },
};

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
function AppHeader({ roleLabel, title }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Text style={styles.brandSmall}>FitRoster</Text>
        <Text style={styles.roleBadge}>{roleLabel}</Text>
      </View>
      <Text style={styles.screenTitle}>{title}</Text>
    </View>
  );
}

function BottomTabBar({ activeTab, onSelectTab }) {
  const tabs = ['Home', 'Workout', 'Nutrition', 'Progress'];
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onSelectTab(tab)}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ToastBanner({ message }) {
  if (!message) return null;
  return (
    <View style={styles.toast}>
      <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

// Pure React Native line chart (Expo Snack safe, zero external chart libraries)
function SimpleLineChart({
  points,
  min,
  max,
  yLabels,
  xLabels = ['4 Nov', '11 Nov', '18 Nov'],
  goalValue = null,
}) {
  const [chartWidth, setChartWidth] = useState(240);
  const chartHeight = 96;
  const padX = 12;
  const padY = 12;
  const usableW = Math.max(chartWidth - padX * 2, 40);
  const usableH = chartHeight - padY * 2;
  const range = Math.max(max - min, 1);

  const coords = points.map((val, idx) => {
    const x =
      points.length === 1
        ? padX + usableW / 2
        : padX + (idx / (points.length - 1)) * usableW;
    const clamped = Math.min(Math.max(val, min), max);
    const y = padY + (1 - (clamped - min) / range) * usableH;
    return { x, y };
  });

  const goalY =
    goalValue !== null
      ? padY + (1 - (Math.min(Math.max(goalValue, min), max) - min) / range) * usableH
      : null;

  return (
    <View style={styles.chartWrapper}>
      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          {yLabels.map((lbl) => (
            <Text key={lbl} style={styles.axisLabel}>
              {lbl}
            </Text>
          ))}
        </View>

        <View
          style={[styles.chartPlot, { height: chartHeight }]}
          onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
        >
          {/* Horizontal grid lines */}
          {[0, 0.5, 1].map((ratio, i) => (
            <View
              key={i}
              style={[
                styles.gridLine,
                { top: padY + ratio * usableH },
              ]}
            />
          ))}

          {/* Optional dashed green goal line */}
          {goalY !== null && (
            <View style={[styles.goalLineRow, { top: goalY }]}>
              {Array.from({ length: 24 }).map((_, i) => (
                <View key={i} style={styles.goalDash} />
              ))}
            </View>
          )}

          {/* Connecting line segments */}
          {coords.map((pt, i) => {
            if (i === coords.length - 1) return null;
            const next = coords[i + 1];
            const dx = next.x - pt.x;
            const dy = next.y - pt.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const midX = (pt.x + next.x) / 2;
            const midY = (pt.y + next.y) / 2;

            return (
              <View
                key={`seg-${i}`}
                style={[
                  styles.lineSegment,
                  {
                    width: length,
                    left: midX - length / 2,
                    top: midY - 1,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}

          {/* Data dots */}
          {coords.map((pt, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.chartDot,
                { left: pt.x - 3.5, top: pt.y - 3.5 },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.xAxis}>
        {xLabels.map((lbl) => (
          <Text key={lbl} style={styles.axisLabel}>
            {lbl}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  // Navigation & role state
  const [screen, setScreen] = useState('login_role');
  const [role, setRole] = useState('coach'); // 'coach' | 'athlete'
  const [emailInput, setEmailInput] = useState('');
  const [toast, setToast] = useState('');

  // Workout Builder & Presets state
  const [workoutName, setWorkoutName] = useState('Upper body strength');
  const [workoutDuration, setWorkoutDuration] = useState('45 min');
  const [exercises, setExercises] = useState([
    {
      id: 'ex-1',
      name: 'Barbell bench press',
      sets: '3',
      reps: '10',
      rest: '90 sec',
      note: 'Controlled lowering, strong press.',
    },
  ]);
  const [presets, setPresets] = useState(INITIAL_PRESETS);
  const [presetTab, setPresetTab] = useState('all'); // 'all' | 'saved' | 'fitroster'
  const [previewPresetId, setPreviewPresetId] = useState(null);

  // Athlete workout logging state
  const [completedSets, setCompletedSets] = useState(1);
  const totalSets = 9;

  // Nutrition state (shared between Coach Nutrition, Athlete Home, Athlete Nutrition, Progress)
  const [proteinGoal, setProteinGoal] = useState('150');
  const [carbsGoal, setCarbsGoal] = useState('250');
  const [fatGoal, setFatGoal] = useState('80');
  const [nutritionNote, setNutritionNote] = useState(
    'Include protein at every meal. Fuel with carbs before training.'
  );
  const [loggedMeals, setLoggedMeals] = useState([
    { id: 'm1', name: 'Oats & whey protein', kcal: 540, p: 42, c: 65, f: 12 },
    { id: 'm2', name: 'Grilled chicken rice bowl', kcal: 972, p: 63, c: 100, f: 36 },
  ]);
  const [newMealName, setNewMealName] = useState('');
  const [newMealKcal, setNewMealKcal] = useState('');

  // Coach Athletes state
  const [inviteEmail, setInviteEmail] = useState('');
  const [athletes, setAthletes] = useState([
    { id: 'a1', name: 'Alex Morgan', plan: 'Strength plan', status: 'Connected' },
    { id: 'a2', name: 'Jamie Rivera', plan: 'Conditioning plan', status: 'Connected' },
  ]);
  const [pendingRequests, setPendingRequests] = useState([
    { id: 'r1', name: 'Taylor Brooks', subtitle: 'Wants to connect with you' },
  ]);
  const [selectedAthlete, setSelectedAthlete] = useState('Alex Morgan');

  // Body-weight check-in state (shared with Progress)
  const [weightInput, setWeightInput] = useState('78.0');
  const [checkInDateInput, setCheckInDateInput] = useState('18 Nov');
  const [goalWeightInput, setGoalWeightInput] = useState('75.0');
  const [currentWeight, setCurrentWeight] = useState(78.0);
  const [goalWeight, setGoalWeight] = useState(75.0);
  const [checkIns, setCheckIns] = useState([
    { id: 'c1', date: '18 Nov', weight: 78.0 },
    { id: 'c2', date: '14 Nov', weight: 78.6 },
  ]);

  // Progress screen exercise selector
  const [selectedProgressEx, setSelectedProgressEx] = useState('Barbell bench press');
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  // Settings & permissions state
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(false);
  const [healthSync, setHealthSync] = useState(false);

  // Athlete Coach modal
  const [showCoachModal, setShowCoachModal] = useState(false);

  // Computed Nutrition totals
  const pTarget = parseInt(proteinGoal, 10) || 0;
  const cTarget = parseInt(carbsGoal, 10) || 0;
  const fTarget = parseInt(fatGoal, 10) || 0;
  const kcalTarget = pTarget * 4 + cTarget * 4 + fTarget * 9;

  const consumedKcal = loggedMeals.reduce((sum, m) => sum + m.kcal, 0);
  const consumedP = loggedMeals.reduce((sum, m) => sum + m.p, 0);
  const consumedC = loggedMeals.reduce((sum, m) => sum + m.c, 0);
  const consumedF = loggedMeals.reduce((sum, m) => sum + m.f, 0);
  const remainingKcal = Math.max(kcalTarget - consumedKcal, 0);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? '' : prev));
    }, 2400);
  };

  // Bottom tab navigation logic
  const handleTabPress = (tab) => {
    if (tab === 'Home') {
      setScreen(role === 'coach' ? 'coach_home' : 'athlete_home');
    } else if (tab === 'Workout') {
      setScreen(role === 'coach' ? 'coach_workout_builder' : 'athlete_workout');
    } else if (tab === 'Nutrition') {
      setScreen(role === 'coach' ? 'coach_nutrition' : 'athlete_nutrition');
    } else if (tab === 'Progress') {
      setScreen('progress');
    }
  };

  // Determine which tab is highlighted
  const getActiveTab = () => {
    if (
      screen === 'coach_home' ||
      screen === 'athlete_home' ||
      screen === 'coach_athletes' ||
      screen === 'settings' ||
      screen === 'athlete_bodyweight'
    ) {
      return 'Home';
    }
    if (
      screen === 'coach_workout_builder' ||
      screen === 'coach_workout_presets' ||
      screen === 'athlete_workout'
    ) {
      return 'Workout';
    }
    if (screen === 'coach_nutrition' || screen === 'athlete_nutrition') {
      return 'Nutrition';
    }
    if (screen === 'progress') {
      return 'Progress';
    }
    return 'Home';
  };

  // ─── SCREEN 1: FIRST LOGIN PAGE (ROLE SELECTION) ────────────────────────────
  if (screen === 'login_role') {
    return (
      <SafeAreaView style={styles.authSafe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.authContainer}>
          <Text style={styles.authBrandTop}>FitRoster</Text>

          <View style={styles.authCenterBlock}>
            <Text style={styles.welcomeTitle}>
              Welcome to <Text style={{ color: COLORS.primary }}>FitRoster</Text>
            </Text>
            <Text style={styles.welcomeSub}>Choose your role to log in.</Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 28 }]}
              activeOpacity={0.85}
              onPress={() => {
                setRole('coach');
                setScreen('login_email');
              }}
            >
              <Text style={styles.primaryBtnText}>Log in as Coach</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outlineBtn, { marginTop: 14 }]}
              activeOpacity={0.85}
              onPress={() => {
                setRole('athlete');
                setScreen('login_email');
              }}
            >
              <Text style={styles.outlineBtnText}>Log in as Student</Text>
            </TouchableOpacity>

            <Text style={styles.studentHint}>Student accounts are for athletes.</Text>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── SCREEN 2: SECOND LOGIN PAGE (CREATE ACCOUNT / EMAIL) ───────────────────
  if (screen === 'login_email') {
    const completeLogin = () => {
      setScreen(role === 'coach' ? 'coach_home' : 'athlete_home');
    };

    return (
      <SafeAreaView style={styles.authSafe}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.authContainer}>
          <TouchableOpacity
            style={styles.backRoleBtn}
            onPress={() => setScreen('login_role')}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.textSecondary} />
            <Text style={styles.backRoleText}>
              {role === 'coach' ? 'Coach login' : 'Student login'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.authBrandTop, { marginTop: 28 }]}>FitRoster</Text>

          <View style={styles.authCenterBlock}>
            <Text style={styles.createTitle}>Create an account</Text>
            <Text style={styles.createSub}>
              Enter your email to sign up for this app
            </Text>

            <TextInput
              style={styles.authInput}
              placeholder="email@domain.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailInput}
              onChangeText={setEmailInput}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 14 }]}
              activeOpacity={0.85}
              onPress={completeLogin}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.85}
              onPress={completeLogin}
            >
              <AntDesign name="google" size={18} color="#DB4437" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By clicking continue, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── SCREEN RENDERERS (MAIN APP) ────────────────────────────────────────────
  const renderCoachHome = () => (
    <>
      <AppHeader roleLabel="COACH" title="Your coaching hub" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>MONDAY, 18 NOVEMBER</Text>
          <Text style={styles.heroTitle}>Stronger, together.</Text>
          <Text style={styles.heroSub}>
            Manage plans, fuel and progress for your team.
          </Text>
          <Text style={styles.heroMeta}>
            {athletes.length} athletes · 2 workouts due today
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Plan your team's day</Text>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => setScreen('coach_workout_builder')}
        >
          <Text style={styles.cardTitle}>Workout plans</Text>
          <Text style={styles.cardSub}>Build exercises, sets and reps.</Text>
          <Text style={styles.pinkLink}>Create workout  →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => setScreen('coach_nutrition')}
        >
          <Text style={styles.cardTitle}>Nutrition goals</Text>
          <Text style={styles.cardSub}>Set calories and daily macro targets.</Text>
          <Text style={styles.pinkLink}>Manage nutrition  →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.softPinkBtn}
          activeOpacity={0.8}
          onPress={() => setScreen('coach_athletes')}
        >
          <Text style={styles.softPinkBtnText}>
            Athletes · {athletes.length} connected
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.softPinkBtn}
          activeOpacity={0.8}
          onPress={() => setScreen('settings')}
        >
          <Text style={styles.softPinkBtnText}>Settings & permissions</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );

  const renderCoachWorkoutBuilder = () => {
    const updateExercise = (id, field, value) => {
      setExercises((prev) =>
        prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
      );
    };

    const addExercise = () => {
      const nextNum = exercises.length + 1;
      setExercises((prev) => [
        ...prev,
        {
          id: `ex-${Date.now()}`,
          name: nextNum === 2 ? 'Incline dumbbell press' : `Exercise ${nextNum}`,
          sets: '3',
          reps: '12',
          rest: '60 sec',
          note: 'Focus on full range of motion.',
        },
      ]);
      showToast('Exercise added to workout');
    };

    const saveAsPreset = () => {
      const newPreset = {
        id: `p-${Date.now()}`,
        type: 'saved',
        badge: 'YOUR SAVED PRESET',
        title: workoutName.trim() || 'Custom workout',
        meta: `${exercises.length} exercises · ${workoutDuration} · Saved just now`,
        duration: workoutDuration,
        exercises: exercises.map((e) => ({ ...e })),
      };
      setPresets((prev) => [newPreset, ...prev]);
      showToast('Saved to My presets');
    };

    return (
      <>
        <AppHeader roleLabel="COACH" title="Build a workout" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.tinyPinkLabel}>FOR {selectedAthlete.toUpperCase()}</Text>
            <Text style={styles.tinyGrayLabel}>WORKOUT NAME</Text>
            <TextInput
              style={styles.grayInput}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="Workout name"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.cardFooterMeta}>
              Monday, 18 Nov · {workoutDuration}
            </Text>
          </View>

          {exercises.map((ex, idx) => (
            <View key={ex.id} style={styles.card}>
              <View style={styles.exerciseTitleRow}>
                <Text style={styles.exerciseNumber}>
                  {String(idx + 1).padStart(2, '0')}
                </Text>
                <TextInput
                  style={styles.exerciseNameInput}
                  value={ex.name}
                  onChangeText={(val) => updateExercise(ex.id, 'name', val)}
                />
                {exercises.length > 1 && (
                  <TouchableOpacity
                    onPress={() =>
                      setExercises((prev) => prev.filter((item) => item.id !== ex.id))
                    }
                  >
                    <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.macroLabelsRow}>
                <Text style={[styles.tinyColLabel, { flex: 1 }]}>Sets</Text>
                <Text style={[styles.tinyColLabel, { flex: 1 }]}>Reps</Text>
                <Text style={[styles.tinyColLabel, { flex: 1.4 }]}>Rest</Text>
              </View>

              <View style={styles.setsRowBox}>
                <TextInput
                  style={[styles.setsInput, { flex: 1 }]}
                  value={ex.sets}
                  keyboardType="numeric"
                  onChangeText={(val) => updateExercise(ex.id, 'sets', val)}
                />
                <TextInput
                  style={[styles.setsInput, { flex: 1 }]}
                  value={ex.reps}
                  keyboardType="numeric"
                  onChangeText={(val) => updateExercise(ex.id, 'reps', val)}
                />
                <TextInput
                  style={[styles.setsInput, { flex: 1.4 }]}
                  value={ex.rest}
                  onChangeText={(val) => updateExercise(ex.id, 'rest', val)}
                />
              </View>

              <Text style={styles.coachNoteText}>Coach note: {ex.note}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.softPinkBtn} activeOpacity={0.8} onPress={addExercise}>
            <Text style={styles.softPinkBtnText}>+ Add exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.softPinkBtn}
            activeOpacity={0.8}
            onPress={() => setScreen('coach_workout_presets')}
          >
            <Text style={styles.softPinkBtnText}>Use a preset</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.softPinkBtn} activeOpacity={0.8} onPress={saveAsPreset}>
            <Text style={styles.softPinkBtnText}>Save as new preset</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 4 }]}
            activeOpacity={0.85}
            onPress={() => showToast(`Assigned "${workoutName}" to ${selectedAthlete}`)}
          >
            <Text style={styles.primaryBtnText}>Assign workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </>
    );
  };

  const renderCoachWorkoutPresets = () => {
    const filteredPresets =
      presetTab === 'all'
        ? presets
        : presets.filter((p) => p.type === presetTab);

    const applyPreset = (preset) => {
      setWorkoutName(preset.title);
      setWorkoutDuration(preset.duration);
      setExercises(preset.exercises.map((e, i) => ({ ...e, id: `loaded-${Date.now()}-${i}` })));
      setScreen('coach_workout_builder');
      showToast(`Loaded "${preset.title}"`);
    };

    return (
      <>
        <AppHeader roleLabel="COACH" title="Workout presets" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageSubtext}>Start with a plan. Make it your own.</Text>

          <View style={styles.segmentBar}>
            <TouchableOpacity
              style={[
                styles.segmentPill,
                presetTab === 'saved' && styles.segmentPillActive,
              ]}
              onPress={() => setPresetTab(presetTab === 'saved' ? 'all' : 'saved')}
            >
              <Text style={styles.segmentText}>My presets</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentPill,
                presetTab === 'fitroster' && styles.segmentPillActive,
              ]}
              onPress={() =>
                setPresetTab(presetTab === 'fitroster' ? 'all' : 'fitroster')
              }
            >
              <Text style={styles.segmentText}>FitRoster presets</Text>
            </TouchableOpacity>
          </View>

          {filteredPresets.map((preset) => {
            const isPreviewOpen = previewPresetId === preset.id;
            return (
              <View key={preset.id} style={styles.card}>
                {!!preset.badge && (
                  <Text
                    style={[
                      styles.presetBadge,
                      preset.type === 'fitroster' && { color: COLORS.primaryDark },
                    ]}
                  >
                    {preset.badge}
                  </Text>
                )}
                <Text style={styles.cardTitle}>{preset.title}</Text>
                <Text style={styles.cardSub}>{preset.meta}</Text>

                {preset.isPreviewStyle ? (
                  <>
                    <TouchableOpacity
                      onPress={() =>
                        setPreviewPresetId(isPreviewOpen ? null : preset.id)
                      }
                    >
                      <Text style={styles.pinkLink}>
                        {isPreviewOpen ? 'Hide preview  ↑' : 'Preview preset  →'}
                      </Text>
                    </TouchableOpacity>
                    {isPreviewOpen && (
                      <View style={styles.previewBox}>
                        {preset.exercises.map((ex, i) => (
                          <Text key={ex.id} style={styles.previewItem}>
                            {i + 1}. {ex.name} ({ex.sets} × {ex.reps})
                          </Text>
                        ))}
                        <TouchableOpacity
                          style={[styles.softPinkBtn, { marginTop: 10, marginBottom: 0 }]}
                          onPress={() => applyPreset(preset)}
                        >
                          <Text style={styles.softPinkBtnText}>Use this preset</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                ) : (
                  <TouchableOpacity
                    style={[styles.softPinkBtn, { marginTop: 12, marginBottom: 0 }]}
                    activeOpacity={0.8}
                    onPress={() => applyPreset(preset)}
                  >
                    <Text style={styles.softPinkBtnText}>
                      {preset.type === 'saved'
                        ? 'Use saved preset'
                        : 'Use FitRoster preset'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          <Text style={styles.helperFootnote}>
            Presets copy exercises, sets and reps into your plan. You can edit them before assigning.
          </Text>
        </ScrollView>
      </>
    );
  };

  const renderCoachNutrition = () => (
    <>
      <AppHeader roleLabel="COACH" title="Nutrition goals" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>
            {selectedAthlete.toUpperCase()} · DAILY TARGETS
          </Text>
          <Text style={styles.heroTitle}>Fuel the next session.</Text>
          <Text style={styles.heroSub}>
            Your athlete will see these goals in Nutrition.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Daily macro goals</Text>

          <View style={styles.macroInputBox}>
            <Text style={styles.macroInputLabel}>Protein</Text>
            <View style={styles.macroValueRow}>
              <TextInput
                style={styles.macroValueInput}
                value={proteinGoal}
                keyboardType="numeric"
                onChangeText={setProteinGoal}
              />
              <Text style={styles.macroUnit}>g</Text>
            </View>
          </View>

          <View style={styles.macroInputBox}>
            <Text style={styles.macroInputLabel}>Carbohydrates</Text>
            <View style={styles.macroValueRow}>
              <TextInput
                style={styles.macroValueInput}
                value={carbsGoal}
                keyboardType="numeric"
                onChangeText={setCarbsGoal}
              />
              <Text style={styles.macroUnit}>g</Text>
            </View>
          </View>

          <View style={styles.macroInputBox}>
            <Text style={styles.macroInputLabel}>Fat</Text>
            <View style={styles.macroValueRow}>
              <TextInput
                style={styles.macroValueInput}
                value={fatGoal}
                keyboardType="numeric"
                onChangeText={setFatGoal}
              />
              <Text style={styles.macroUnit}>g</Text>
            </View>
          </View>

          <Text style={styles.energyTargetText}>
            Energy target: {kcalTarget.toLocaleString()} kcal / day
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.macroInputLabel}>Nutrition note</Text>
          <TextInput
            style={styles.noteMultiline}
            value={nutritionNote}
            onChangeText={setNutritionNote}
            multiline
          />
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={() => showToast('Nutrition goals saved for ' + selectedAthlete)}
        >
          <Text style={styles.primaryBtnText}>Save nutrition goals</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );

  const renderCoachAthletes = () => {
    const sendInvite = () => {
      if (!inviteEmail.trim()) {
        showToast('Enter an athlete email first');
        return;
      }
      showToast(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail('');
    };

    const acceptRequest = (req) => {
      setAthletes((prev) => [
        ...prev,
        { id: req.id, name: req.name, plan: 'Starter plan', status: 'Connected' },
      ]);
      setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
      showToast(`${req.name} connected`);
    };

    const declineRequest = (req) => {
      setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
      showToast(`Declined ${req.name}'s request`);
    };

    return (
      <>
        <AppHeader roleLabel="COACH" title="Your athletes" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.pageSubtext}>
            {athletes.length} connected athletes
          </Text>

          <TouchableOpacity
            style={[styles.primaryBtn, { marginBottom: 14 }]}
            activeOpacity={0.85}
            onPress={() => showToast('Enter an email below to invite an athlete')}
          >
            <Text style={styles.primaryBtnText}>+ Add new athlete</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 10 }]}>Invite by email</Text>
            <TextInput
              style={styles.grayInput}
              placeholder="athlete@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={inviteEmail}
              onChangeText={setInviteEmail}
            />
            <TouchableOpacity
              style={[styles.softPinkBtn, { marginTop: 10, marginBottom: 0 }]}
              activeOpacity={0.8}
              onPress={sendInvite}
            >
              <Text style={styles.softPinkBtnText}>Send invitation</Text>
            </TouchableOpacity>
          </View>

          {athletes.map((ath) => (
            <TouchableOpacity
              key={ath.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedAthlete(ath.name);
                setScreen('progress');
              }}
            >
              <Text style={styles.cardTitle}>{ath.name}</Text>
              <Text style={styles.cardSub}>
                {ath.plan} · {ath.status}
              </Text>
              <Text style={styles.pinkLink}>View athlete  →</Text>
            </TouchableOpacity>
          ))}

          {pendingRequests.map((req) => (
            <View key={req.id} style={styles.card}>
              <Text style={styles.cardTitle}>{req.name}</Text>
              <Text style={styles.cardSub}>{req.subtitle}</Text>
              <TouchableOpacity
                style={[styles.softPinkBtn, { marginTop: 12, marginBottom: 10 }]}
                activeOpacity={0.8}
                onPress={() => acceptRequest(req)}
              >
                <Text style={styles.softPinkBtnText}>Accept request</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => declineRequest(req)}>
                <Text style={styles.declineText}>Decline request</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </>
    );
  };

  const renderAthleteHome = () => {
    const workoutPct = Math.min((completedSets / totalSets) * 100, 100);
    const kcalPct = Math.min((consumedKcal / Math.max(kcalTarget, 1)) * 100, 100);

    return (
      <>
        <AppHeader roleLabel="ATHLETE" title="Your daily game plan" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>MONDAY, 18 NOVEMBER</Text>
            <Text style={styles.heroTitle}>Let's get stronger, Alex.</Text>
            <Text style={styles.heroSub}>
              Coach Jordan Lee has your plan ready.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{workoutName}</Text>
            <Text style={styles.cardSub}>
              {exercises.length > 1 ? exercises.length : 3} exercises · {totalSets} sets · {workoutDuration}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillPink, { width: `${workoutPct}%` }]} />
            </View>
            <Text style={styles.progressCaption}>
              {completedSets} of {totalSets} sets completed
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 12 }]}
              activeOpacity={0.85}
              onPress={() => setScreen('athlete_workout')}
            >
              <Text style={styles.primaryBtnText}>Continue workout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Fuel your day</Text>
            <Text style={styles.kcalStatPink}>
              {consumedKcal.toLocaleString()} / {kcalTarget.toLocaleString()} kcal
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillPink, { width: `${kcalPct}%` }]} />
            </View>
            <Text style={styles.progressCaption}>
              {remainingKcal.toLocaleString()} kcal remaining · {loggedMeals.length} meals logged
            </Text>
            <TouchableOpacity
              style={[styles.softPinkBtn, { marginTop: 12, marginBottom: 0 }]}
              activeOpacity={0.8}
              onPress={() => setScreen('athlete_nutrition')}
            >
              <Text style={styles.softPinkBtnText}>Log a meal</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.softPinkBtn}
            activeOpacity={0.8}
            onPress={() => setScreen('athlete_bodyweight')}
          >
            <Text style={styles.softPinkBtnText}>+ Add body weight</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.softPinkBtn}
            activeOpacity={0.8}
            onPress={() => setShowCoachModal(true)}
          >
            <Text style={styles.softPinkBtnText}>My coach · Jordan Lee</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.softPinkBtn}
            activeOpacity={0.8}
            onPress={() => setScreen('settings')}
          >
            <Text style={styles.softPinkBtnText}>Settings & permissions</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={showCoachModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCoachModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.tinyPinkLabel}>CONNECTED COACH</Text>
              <Text style={[styles.cardTitle, { fontSize: 18, marginTop: 4 }]}>
                Coach Jordan Lee
              </Text>
              <Text style={[styles.cardSub, { marginTop: 6, lineHeight: 20 }]}>
                Jordan can view your logged workouts, daily meal macros, and body-weight progress graph.
              </Text>
              <TouchableOpacity
                style={[styles.softPinkBtn, { marginTop: 16, marginBottom: 8 }]}
                onPress={() => {
                  setShowCoachModal(false);
                  setScreen('settings');
                }}
              >
                <Text style={styles.softPinkBtnText}>Manage permissions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setShowCoachModal(false)}
              >
                <Text style={styles.primaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  };

  const renderAthleteBodyweight = () => {
    const startWeight = 80.0;
    const toGoal = Math.max(currentWeight - goalWeight, 0).toFixed(1);

    const saveWeight = () => {
      const parsedW = parseFloat(weightInput);
      const parsedG = parseFloat(goalWeightInput);
      if (isNaN(parsedW) || isNaN(parsedG)) {
        showToast('Enter valid numbers for weight and goal');
        return;
      }
      setCurrentWeight(parsedW);
      setGoalWeight(parsedG);
      setCheckIns((prev) => [
        { id: `c-${Date.now()}`, date: checkInDateInput || 'Today', weight: parsedW },
        ...prev,
      ]);
      showToast('Weight & goal saved');
    };

    return (
      <>
        <AppHeader roleLabel="ATHLETE" title="Log body weight" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>YOUR BODY-WEIGHT GOAL</Text>
            <Text style={styles.heroTitle}>
              {currentWeight.toFixed(1)} kg  →  {goalWeight.toFixed(1)} kg
            </Text>
            <Text style={styles.heroSub}>
              Started at {startWeight.toFixed(1)} kg · {toGoal} kg to your goal
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Add a check-in</Text>

            <Text style={styles.tinyGrayLabel}>WEIGHT (kg)</Text>
            <TextInput
              style={[styles.grayInput, styles.boldInputText]}
              value={weightInput}
              keyboardType="decimal-pad"
              onChangeText={setWeightInput}
            />

            <Text style={[styles.tinyGrayLabel, { marginTop: 12 }]}>CHECK-IN DATE</Text>
            <TextInput
              style={styles.grayInput}
              value={checkInDateInput}
              onChangeText={setCheckInDateInput}
            />

            <Text style={[styles.tinyGrayLabel, { marginTop: 12 }]}>
              YOUR GOAL WEIGHT (kg)
            </Text>
            <TextInput
              style={[styles.grayInput, styles.boldInputText]}
              value={goalWeightInput}
              keyboardType="decimal-pad"
              onChangeText={setGoalWeightInput}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 16 }]}
              activeOpacity={0.85}
              onPress={saveWeight}
            >
              <Text style={styles.primaryBtnText}>Save weight & goal</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 10 }]}>Recent check-ins</Text>
            {checkIns.map((item) => (
              <View key={item.id} style={styles.checkInRow}>
                <Text style={styles.checkInDate}>{item.date}</Text>
                <Text style={styles.checkInWeight}>{item.weight.toFixed(1)} kg</Text>
              </View>
            ))}
          </View>

          <Text style={styles.helperFootnote}>
            Only you can add or edit your weight. You and your coach can view the goal graph in Progress.
          </Text>
        </ScrollView>
      </>
    );
  };

  // Matching Athlete Workout logger (so Athlete "Workout" tab & "Continue workout" are fully functional)
  const renderAthleteWorkout = () => (
    <>
      <AppHeader roleLabel="ATHLETE" title={workoutName} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>TODAY'S SESSION</Text>
          <Text style={styles.heroTitle}>
            {completedSets} of {totalSets} sets completed
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: '#2B3144', marginTop: 12 }]}>
            <View
              style={[
                styles.progressFillPink,
                { width: `${Math.min((completedSets / totalSets) * 100, 100)}%` },
              ]}
            />
          </View>
        </View>

        {exercises.map((ex, i) => (
          <View key={ex.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {String(i + 1).padStart(2, '0')}  {ex.name}
            </Text>
            <Text style={styles.cardSub}>
              {ex.sets} sets · {ex.reps} reps · Rest {ex.rest}
            </Text>
            <Text style={[styles.coachNoteText, { marginTop: 6 }]}>
              Coach note: {ex.note}
            </Text>
            <TouchableOpacity
              style={[styles.softPinkBtn, { marginTop: 12, marginBottom: 0 }]}
              onPress={() => {
                if (completedSets < totalSets) {
                  setCompletedSets((prev) => prev + 1);
                  showToast('Set logged!');
                } else {
                  showToast('All sets completed!');
                }
              }}
            >
              <Text style={styles.softPinkBtnText}>+ Log completed set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            setCompletedSets(totalSets);
            showToast('Workout marked complete!');
            setScreen('progress');
          }}
        >
          <Text style={styles.primaryBtnText}>Finish workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );

  // Matching Athlete Nutrition logger (so Athlete "Nutrition" tab & "Log a meal" are fully functional)
  const renderAthleteNutrition = () => {
    const addMeal = () => {
      const kcal = parseInt(newMealKcal, 10);
      if (!newMealName.trim() || isNaN(kcal)) {
        showToast('Enter meal name and calories');
        return;
      }
      setLoggedMeals((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          name: newMealName.trim(),
          kcal,
          p: Math.round((kcal * 0.3) / 4),
          c: Math.round((kcal * 0.45) / 4),
          f: Math.round((kcal * 0.25) / 9),
        },
      ]);
      setNewMealName('');
      setNewMealKcal('');
      showToast('Meal logged!');
    };

    return (
      <>
        <AppHeader roleLabel="ATHLETE" title="Daily nutrition" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>COACH TARGETS</Text>
            <Text style={styles.heroTitle}>
              {consumedKcal.toLocaleString()} / {kcalTarget.toLocaleString()} kcal
            </Text>
            <Text style={styles.heroSub}>{nutritionNote}</Text>
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 10 }]}>Log a meal</Text>
            <TextInput
              style={styles.grayInput}
              placeholder="Meal name (e.g. Greek yogurt & berries)"
              placeholderTextColor={COLORS.textMuted}
              value={newMealName}
              onChangeText={setNewMealName}
            />
            <TextInput
              style={[styles.grayInput, { marginTop: 10 }]}
              placeholder="Calories (kcal)"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
              value={newMealKcal}
              onChangeText={setNewMealKcal}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 12 }]}
              onPress={addMeal}
            >
              <Text style={styles.primaryBtnText}>Add meal</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 8 }]}>Logged today</Text>
            {loggedMeals.map((m) => (
              <View key={m.id} style={styles.checkInRow}>
                <Text style={styles.checkInDate}>{m.name}</Text>
                <Text style={styles.checkInWeight}>{m.kcal} kcal</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </>
    );
  };

  const renderProgress = () => {
    const exData = EXERCISE_PROGRESS_DATA[selectedProgressEx];
    const weightDelta = (currentWeight - 80.0).toFixed(1);
    const weightToGoal = Math.max(currentWeight - goalWeight, 0).toFixed(1);
    const weightPoints = [80.0, 79.5, 79.1, 78.6, currentWeight];

    const kcalPct = Math.min(Math.round((consumedKcal / Math.max(kcalTarget, 1)) * 100), 100);
    const pPct = Math.min(Math.round((consumedP / Math.max(pTarget, 1)) * 100), 100);
    const cPct = Math.min(Math.round((consumedC / Math.max(cTarget, 1)) * 100), 100);
    const fPct = Math.min(Math.round((consumedF / Math.max(fTarget, 1)) * 100), 100);

    return (
      <>
        <AppHeader roleLabel="COACH / ATHLETE" title="Your progress" />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.pinkBanner}>
            <Text style={styles.pinkBannerTitle}>
              {selectedAthlete} · Week of 16–22 Nov
            </Text>
            <Text style={styles.pinkBannerSub}>
              Same progress view for coach and athlete
            </Text>
          </View>

          {/* Exercise progression */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 10 }]}>
              Exercise progression
            </Text>

            <TouchableOpacity
              style={styles.dropdownPill}
              onPress={() => setShowExercisePicker((prev) => !prev)}
            >
              <Text style={styles.dropdownText}>{selectedProgressEx}</Text>
              <Ionicons
                name={showExercisePicker ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={COLORS.text}
              />
            </TouchableOpacity>

            {showExercisePicker && (
              <View style={styles.dropdownMenu}>
                {Object.keys(EXERCISE_PROGRESS_DATA).map((name) => (
                  <TouchableOpacity
                    key={name}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setSelectedProgressEx(name);
                      setShowExercisePicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        name === selectedProgressEx && {
                          color: COLORS.primary,
                          fontWeight: '700',
                        },
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.statRow}>
              <Text style={styles.statBigPink}>{exData.current}</Text>
              <Text style={styles.statDeltaPink}>{exData.delta}</Text>
            </View>
            <Text style={styles.statSub}>{exData.subtitle}</Text>

            <SimpleLineChart
              points={exData.points}
              min={exData.min}
              max={exData.max}
              yLabels={exData.yLabels}
            />

            <Text style={styles.chartCaption}>
              Based on saved sets only. Compare the same exercise and rep count to see weight increases.
            </Text>
          </View>

          {/* Body-weight progress */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Body-weight progress</Text>
            <View style={styles.statRow}>
              <Text style={styles.statBigDark}>{currentWeight.toFixed(1)} kg</Text>
              <Text style={styles.statBigDark}>Goal {goalWeight.toFixed(1)} kg</Text>
            </View>
            <Text style={styles.statSub}>
              {weightDelta} kg from start · {weightToGoal} kg to goal
            </Text>

            <SimpleLineChart
              points={weightPoints}
              min={75}
              max={81}
              yLabels={['81', '78', '75']}
              goalValue={goalWeight}
            />

            <Text style={styles.legendText}>
              Pink: logged weight   Dashed green: goal
            </Text>
            <Text style={styles.chartCaption}>
              Athlete check-ins · Latest {checkIns[0]?.date || '18 Nov'}
              {'\n'}Visible to the athlete and connected coach.
            </Text>
          </View>

          {/* Workout completion dark card */}
          <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>WORKOUT COMPLETION</Text>
            <Text style={styles.heroTitle}>3 of 4 workouts</Text>
            <Text style={styles.heroSub}>75% of this week's plan completed</Text>
            <View style={[styles.progressTrack, { backgroundColor: '#E5E7EE', marginTop: 12 }]}>
              <View style={[styles.progressFillPink, { width: '75%' }]} />
            </View>
          </View>

          {/* Today's nutrition */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today's nutrition</Text>
            <Text style={[styles.kcalStatPink, { marginTop: 6, marginBottom: 14 }]}>
              {consumedKcal.toLocaleString()} / {kcalTarget.toLocaleString()} kcal · {kcalPct}%
            </Text>

            <View style={styles.macroBarRow}>
              <Text style={styles.macroBarLabel}>Protein</Text>
              <Text style={styles.macroBarStat}>
                {consumedP} / {pTarget} g · {pPct}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillPink, { width: `${pPct}%` }]} />
            </View>

            <View style={[styles.macroBarRow, { marginTop: 12 }]}>
              <Text style={styles.macroBarLabel}>Carbohydrates</Text>
              <Text style={styles.macroBarStat}>
                {consumedC} / {cTarget} g · {cPct}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillBlue, { width: `${cPct}%` }]} />
            </View>

            <View style={[styles.macroBarRow, { marginTop: 12 }]}>
              <Text style={styles.macroBarLabel}>Fat</Text>
              <Text style={styles.macroBarStat}>
                {consumedF} / {fTarget} g · {fPct}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFillGreen, { width: `${fPct}%` }]} />
            </View>
          </View>

          {/* Today at a glance */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, { marginBottom: 10 }]}>Today at a glance</Text>
            <View style={styles.glanceRow}>
              <Text style={styles.glanceLabel}>Workout</Text>
              <Text style={styles.glanceVal}>
                {completedSets} / {totalSets} sets logged
              </Text>
            </View>
            <View style={styles.glanceRow}>
              <Text style={styles.glanceLabel}>Nutrition</Text>
              <Text style={styles.glanceVal}>
                {loggedMeals.length} meals logged · {remainingKcal.toLocaleString()} kcal left
              </Text>
            </View>
          </View>
        </ScrollView>
      </>
    );
  };

  const renderSettings = () => (
    <>
      <AppHeader roleLabel="COACH / ATHLETE" title="Settings & permissions" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Account</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() =>
              Alert.alert(
                'Profile & Account',
                `Signed in as ${emailInput || 'alex@fitroster.app'} (${role.toUpperCase()})`
              )
            }
          >
            <Text style={styles.settingLabel}>Profile & account</Text>
            <Text style={styles.settingValue}>Manage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              const nextRole = role === 'coach' ? 'athlete' : 'coach';
              setRole(nextRole);
              showToast(`Switched active role to ${nextRole === 'coach' ? 'Coach' : 'Athlete'}`);
            }}
          >
            <Text style={styles.settingLabel}>Login role</Text>
            <Text style={[styles.settingValue, { color: COLORS.primaryDark }]}>
              {role === 'coach' ? 'Coach (tap to switch)' : 'Athlete (tap to switch)'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setNotificationsOn((v) => !v)}
          >
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingValue}>{notificationsOn ? 'On' : 'Off'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Permissions</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setWorkoutReminders((v) => !v)}
          >
            <Text style={styles.settingLabel}>Workout reminders</Text>
            <Text style={styles.settingValue}>{workoutReminders ? 'On' : 'Off'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setMealReminders((v) => !v)}
          >
            <Text style={styles.settingLabel}>Meal reminders</Text>
            <Text style={styles.settingValue}>{mealReminders ? 'On' : 'Off'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setHealthSync((v) => !v)}
          >
            <Text style={styles.settingLabel}>Health data sync</Text>
            <Text style={styles.settingValue}>{healthSync ? 'On' : 'Off'}</Text>
          </TouchableOpacity>

          <Text style={[styles.helperFootnote, { marginTop: 10, marginBottom: 0 }]}>
            Only share data you choose. Device access is requested when you enable a feature.
          </Text>
        </View>

        <View style={styles.pinkInfoCard}>
          <Text style={styles.pinkInfoTitle}>Your connection, your control</Text>
          <Text style={styles.pinkInfoBody}>
            Connected coaches can view workout logs, meal macros and progress. Manage or remove connections from Home.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.8}
          onPress={() => setScreen('login_role')}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );

  const renderCurrentScreen = () => {
    switch (screen) {
      case 'coach_home':
        return renderCoachHome();
      case 'coach_workout_builder':
        return renderCoachWorkoutBuilder();
      case 'coach_workout_presets':
        return renderCoachWorkoutPresets();
      case 'coach_nutrition':
        return renderCoachNutrition();
      case 'coach_athletes':
        return renderCoachAthletes();
      case 'athlete_home':
        return renderAthleteHome();
      case 'athlete_bodyweight':
        return renderAthleteBodyweight();
      case 'athlete_workout':
        return renderAthleteWorkout();
      case 'athlete_nutrition':
        return renderAthleteNutrition();
      case 'progress':
        return renderProgress();
      case 'settings':
        return renderSettings();
      default:
        return renderCoachHome();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {renderCurrentScreen()}
        <ToastBanner message={toast} />
        <BottomTabBar activeTab={getActiveTab()} onSelectTab={handleTabPress} />
      </View>
    </SafeAreaView>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Auth screens
  authSafe: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  authContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
  },
  backRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  backRoleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginLeft: 2,
  },
  authBrandTop: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 56,
    letterSpacing: -0.3,
  },
  authCenterBlock: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  welcomeSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  studentHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 16,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  createSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    marginBottom: 22,
    textAlign: 'center',
  },
  authInput: {
    width: '100%',
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  googleBtn: {
    width: '100%',
    height: 46,
    borderRadius: 10,
    backgroundColor: '#EFEFEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  termsText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 22,
    lineHeight: 17,
    paddingHorizontal: 12,
  },
  termsLink: {
    color: COLORS.text,
    fontWeight: '600',
  },

  // Main Header
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandSmall: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  roleBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.7,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  // Scroll & Cards
  scrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: COLORS.navy,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  heroEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.navyPink,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 12.5,
    color: COLORS.navyMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  heroMeta: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  pageSubtext: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  cardFooterMeta: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 10,
  },
  pinkLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 10,
  },

  // Buttons
  primaryBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 14.5,
    fontWeight: '700',
  },
  outlineBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: COLORS.primary,
    fontSize: 14.5,
    fontWeight: '700',
  },
  softPinkBtn: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.softPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  softPinkBtnText: {
    color: COLORS.primaryDark,
    fontSize: 13.5,
    fontWeight: '700',
  },
  logoutBtn: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  logoutText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },

  // Inputs & Forms
  tinyPinkLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tinyGrayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  grayInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.text,
  },
  boldInputText: {
    fontWeight: '700',
    fontSize: 16,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginRight: 8,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: 2,
  },
  macroLabelsRow: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  tinyColLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  setsRowBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  setsInput: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: 2,
  },
  coachNoteText: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 10,
  },

  // Presets
  segmentBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.softPink,
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  segmentPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentPillActive: {
    backgroundColor: COLORS.white,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  presetBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  previewBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  previewItem: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  helperFootnote: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 12,
  },

  // Nutrition Goals
  macroInputBox: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  macroInputLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  macroValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macroValueInput: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 44,
    paddingVertical: 0,
  },
  macroUnit: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 2,
  },
  energyTargetText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 4,
  },
  noteMultiline: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
    marginTop: 4,
  },

  // Athletes
  declineText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Progress & Charts
  pinkBanner: {
    backgroundColor: COLORS.softPink,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  pinkBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  pinkBannerSub: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dropdownPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.text,
  },
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionText: {
    fontSize: 13,
    color: COLORS.text,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginTop: 4,
  },
  statBigPink: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  statDeltaPink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  statBigDark: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  statSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 10,
  },
  chartWrapper: {
    marginVertical: 8,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  yAxis: {
    width: 26,
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  chartPlot: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ECEEF3',
  },
  goalLineRow: {
    position: 'absolute',
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalDash: {
    width: 4,
    height: 1.5,
    backgroundColor: COLORS.green,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.primary,
  },
  chartDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 30,
    paddingRight: 6,
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  chartCaption: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 16,
  },

  // Progress Bars
  kcalStatPink: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginTop: 4,
  },
  progressTrack: {
    height: 7,
    borderRadius: 99,
    backgroundColor: COLORS.trackBg,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFillPink: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: COLORS.primary,
  },
  progressFillBlue: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: COLORS.blue,
  },
  progressFillGreen: {
    height: '100%',
    borderRadius: 99,
    backgroundColor: COLORS.green,
  },
  progressCaption: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  macroBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroBarLabel: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  macroBarStat: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  glanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  glanceLabel: {
    fontSize: 12.5,
    color: COLORS.textMuted,
  },
  glanceVal: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Body-weight check-ins
  checkInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkInDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  checkInWeight: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Settings
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLabel: {
    fontSize: 13.5,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pinkInfoCard: {
    backgroundColor: COLORS.softPink,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  pinkInfoTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  pinkInfoBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },

  // Bottom Tab Bar
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF2',
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: COLORS.softPink,
  },
  tabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },

  // Toast & Modal
  toast: {
    position: 'absolute',
    bottom: 72,
    alignSelf: 'center',
    backgroundColor: COLORS.navy,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 36, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
  },
});
