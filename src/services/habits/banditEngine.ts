import { VETTED_HABIT_LIBRARY, type HabitDefinition } from './habitLibrary';
import type { HealthProfile } from '../vault/types';
import type { Checkin } from '../../types';

export interface BanditArmStat {
  habitId: string;
  alpha: number; // successes / positive rewards + prior
  beta: number; // failures / negative rewards + prior
  completionsCount: number;
  helpfulCount: number;
  unhelpfulCount: number;
  trendBonusCount: number;
  lastSelectedDate?: string;
  lastCompletedDate?: string;
}

export interface UserBanditState {
  userId: string;
  firstActiveDate: string;
  totalDaysLogged: number;
  arms: Record<string, BanditArmStat>; // habitId -> stats
  dailyPicks: Record<string, string[]>; // dateKey (YYYY-MM-DD) -> [habitId1, habitId2, habitId3]
  completedToday: Record<string, string[]>; // dateKey -> [completedHabitIds]
  feedbackToday: Record<string, Record<string, 'helped' | 'not_for_me'>>; // dateKey -> habitId -> status
  lastUpdated: string;
}

export interface SelectedHabitItem {
  habit: HabitDefinition;
  isCompleted: boolean;
  userFeedback?: 'helped' | 'not_for_me';
  isExploration: boolean;
  whyThisHabitEn: string;
  whyThisHabitTa: string;
  whyThisHabitHi: string;
  healthProfileChip?: string;
}

/**
 * Samples a random number from a Beta(alpha, beta) distribution
 * using the standard Gamma-based approach.
 */
function sampleBeta(alpha: number, beta: number): number {
  const u = sampleGamma(alpha, 1);
  const v = sampleGamma(beta, 1);
  if (u + v === 0) return 0.5;
  return u / (u + v);
}

// Marsaglia and Tsang method for Gamma(k, 1)
function sampleGamma(k: number, theta: number = 1): number {
  if (k < 1) {
    const u = Math.random();
    return (sampleGamma(k + 1, 1) * Math.pow(u, 1 / k)) * theta;
  }
  const d = k - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let z = 0;
    let u = 0;
    let v = 0;
    do {
      // standard normal sample
      const u1 = Math.random();
      const u2 = Math.random();
      z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      v = 1 + c * z;
    } while (v <= 0);
    v = v * v * v;
    u = Math.random();
    if (u < 1 - 0.0331 * z * z * z * z) {
      return d * v * theta;
    }
    if (Math.log(u) < 0.5 * z * z + d * (1 - v + Math.log(v))) {
      return d * v * theta;
    }
  }
}

export function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadUserBanditState(userId: string): UserBanditState {
  const key = `momcare_bandit_stats_${userId}`;
  const today = getTodayDateKey();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.arms) {
        return parsed;
      }
    }
  } catch {}

  // Initialize fresh bandit state with default Beta(2, 2) priors
  const initialArms: Record<string, BanditArmStat> = {};
  for (const h of VETTED_HABIT_LIBRARY) {
    initialArms[h.id] = {
      habitId: h.id,
      alpha: 2.0,
      beta: 2.0,
      completionsCount: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      trendBonusCount: 0,
    };
  }

  const newState: UserBanditState = {
    userId,
    firstActiveDate: today,
    totalDaysLogged: 1,
    arms: initialArms,
    dailyPicks: {},
    completedToday: {},
    feedbackToday: {},
    lastUpdated: new Date().toISOString(),
  };

  saveUserBanditState(newState);
  return newState;
}

export function saveUserBanditState(state: UserBanditState): void {
  const key = `momcare_bandit_stats_${state.userId}`;
  try {
    state.lastUpdated = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(state));
  } catch {}
}

export function resetUserBanditPersonalization(userId: string): UserBanditState {
  const key = `momcare_bandit_stats_${userId}`;
  localStorage.removeItem(key);
  return loadUserBanditState(userId);
}

/**
 * Filter library strictly ensuring:
 * 1. Pregnancy week range
 * 2. Contraindications matching HealthProfile (e.g. bed rest, high BP)
 * 3. Never suggests medicines or off-library items
 */
export function filterSafeHabits(
  pregnancyWeek: number,
  healthProfile?: HealthProfile | null,
  triageLevel: 'green' | 'yellow' | 'red' = 'green'
): HabitDefinition[] {
  // SAFETY: If triage is yellow or red, stop all exploration and return strictly rest/hydration habits!
  if (triageLevel === 'red' || triageLevel === 'yellow') {
    return VETTED_HABIT_LIBRARY.filter(
      (h) => h.category === 'rest' || h.id === 'habit_warm_water_hydration'
    );
  }

  const userRestrictions = new Set<string>();
  if (healthProfile?.doctorRestrictions) {
    for (const r of healthProfile.doctorRestrictions) {
      const lower = r.toLowerCase();
      if (lower.includes('bed rest')) userRestrictions.add('bed_rest');
      if (lower.includes('high bp') || lower.includes('hypertension')) userRestrictions.add('high_bp');
      if (lower.includes('preeclampsia')) userRestrictions.add('preeclampsia');
      if (lower.includes('bleeding')) userRestrictions.add('vaginal_bleeding');
      if (lower.includes('pelvic rest') || lower.includes('cervix')) userRestrictions.add('cervical_shortening');
    }
  }

  return VETTED_HABIT_LIBRARY.filter((habit) => {
    // Week check
    if (pregnancyWeek < habit.minWeek || pregnancyWeek > habit.maxWeek) {
      return false;
    }
    // Contraindications check
    for (const contra of habit.contraindications) {
      if (userRestrictions.has(contra)) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Selects 3 habits for Today's Focus using Thompson Sampling
 * (max 1 exploration, 2 top performers) or rule-based cold-start.
 */
export function chooseTodaysHabits(
  state: UserBanditState,
  pregnancyWeek: number,
  healthProfile?: HealthProfile | null,
  recentCheckins: Checkin[] = [],
  triageLevel: 'green' | 'yellow' | 'red' = 'green'
): SelectedHabitItem[] {
  const todayKey = getTodayDateKey();
  const safeHabits = filterSafeHabits(pregnancyWeek, healthProfile, triageLevel);
  if (safeHabits.length === 0) return [];

  // Check if today already has stored picks
  let chosenIds = state.dailyPicks[todayKey];

  const daysActive = Math.max(1, state.totalDaysLogged);
  const isColdStart = daysActive <= 7;

  if (!chosenIds || chosenIds.length !== 3) {
    if (isColdStart) {
      // Cold-start rule-based picks based on pregnancy week and profile
      const picked: HabitDefinition[] = [];

      // 1. Hydration or iron (nutrition)
      const nutritionPick = safeHabits.find(
        (h) => h.id === 'habit_warm_water_hydration' || h.id === 'habit_iron_rich_food'
      );
      if (nutritionPick) picked.push(nutritionPick);

      // 2. Rest / mindfulness
      const restPick = safeHabits.find(
        (h) => (h.category === 'rest' || h.category === 'mindfulness') && !picked.includes(h)
      );
      if (restPick) picked.push(restPick);

      // 3. Vitamin / gentle movement (if not contraindicated)
      const thirdPick = safeHabits.find((h) => !picked.includes(h));
      if (thirdPick) picked.push(thirdPick);

      chosenIds = picked.map((p) => p.id);
    } else {
      // Thompson Sampling
      // Calculate sampled reward for each safe habit
      const scored = safeHabits.map((habit) => {
        const arm = state.arms[habit.id] || {
          habitId: habit.id,
          alpha: 2.0,
          beta: 2.0,
          completionsCount: 0,
          helpfulCount: 0,
          unhelpfulCount: 0,
          trendBonusCount: 0,
        };
        const sample = sampleBeta(arm.alpha, arm.beta);
        const isExplorationCandidate = arm.completionsCount < 3;
        return { habit, sample, isExplorationCandidate, arm };
      });

      // Sort by Thompson sample descending
      scored.sort((a, b) => b.sample - a.sample);

      // Allow AT MOST 1 exploration candidate, and 2 top exploitation performers
      const finalSelection: HabitDefinition[] = [];
      let explorationCount = 0;

      for (const item of scored) {
        if (finalSelection.length >= 3) break;
        if (item.isExplorationCandidate) {
          if (explorationCount < 1) {
            finalSelection.push(item.habit);
            explorationCount++;
          }
        } else {
          finalSelection.push(item.habit);
        }
      }

      // If still under 3, fill with top remaining
      for (const item of scored) {
        if (finalSelection.length >= 3) break;
        if (!finalSelection.some((h) => h.id === item.habit.id)) {
          finalSelection.push(item.habit);
        }
      }

      chosenIds = finalSelection.map((h) => h.id);
    }

    // Persist daily picks
    state.dailyPicks[todayKey] = chosenIds;
    saveUserBanditState(state);
  }

  // Build full SelectedHabitItem objects with explainability
  const todayCompleted = state.completedToday[todayKey] || [];
  const todayFeedback = state.feedbackToday[todayKey] || {};

  return chosenIds.map((habitId) => {
    const def = VETTED_HABIT_LIBRARY.find((h) => h.id === habitId) || VETTED_HABIT_LIBRARY[0];
    const arm = state.arms[habitId];
    const isCompleted = todayCompleted.includes(habitId);
    const userFeedback = todayFeedback[habitId];
    const isExploration = (arm?.completionsCount || 0) < 3;

    // Build explainability string
    let whyEn = '';
    let whyTa = '';
    let whyHi = '';

    if (arm && arm.completionsCount >= 2) {
      whyEn = `You completed this ${arm.completionsCount} times and found it helpful for maternal wellness.`;
      whyTa = `இதை நீங்கள் ${arm.completionsCount} முறை முடித்து நலம் பெற்றீர்கள்.`;
      whyHi = `आपने इसे ${arm.completionsCount} बार पूरा किया और इससे आपको अच्छा महसूस हुआ।`;
    } else if (healthProfile?.latestHemoglobin?.isLow && def.id === 'habit_iron_rich_food') {
      whyEn = `Selected to naturally support your hemoglobin levels reported in your Health Vault.`;
      whyTa = `உங்கள் ஹெல்த் வால்ட் ஹீமோகுளோபின் குறிப்பிற்கு ஏற்ப தேர்ந்தெடுக்கப்பட்டது.`;
      whyHi = `हेल्थ वॉल्ट में हीमोग्लोबिन स्तर को प्राकृतिक रूप से सुधारने के लिए चुना गया।`;
    } else if (def.id === 'habit_left_side_rest') {
      whyEn = `Recommended for Week ${pregnancyWeek} to improve placental blood flow while resting.`;
      whyTa = `வாரம் ${pregnancyWeek}-ல் குழந்தைக்கான இரத்த ஓட்டத்தை அதிகரிக்க பரிந்துரைக்கப்பட்டது.`;
      whyHi = `हफ्ता ${pregnancyWeek} में प्लेसेंटा तक रक्त संचार बेहतर करने के लिए अनुशंसित।`;
    } else {
      whyEn = `Vetted clinical guideline for Week ${pregnancyWeek} maternal and fetal care.`;
      whyTa = `வாரம் ${pregnancyWeek}-க்கான மருத்துவர் அங்கீகரித்த தாய்மை வழிகாட்டல்.`;
      whyHi = `हफ्ता ${pregnancyWeek} के लिए स्वीकृत सुरक्षित मातृत्व आदत।`;
    }

    let chip = '';
    if (healthProfile?.isVaultUnlocked) {
      if (def.id === 'habit_iron_rich_food' && healthProfile.latestHemoglobin) {
        chip = `Vault: Hb ${healthProfile.latestHemoglobin.value} g/dL`;
      } else if (healthProfile.doctorRestrictions.length > 0) {
        chip = `Vault: Doctor Note Safe`;
      }
    }

    return {
      habit: def,
      isCompleted,
      userFeedback,
      isExploration,
      whyThisHabitEn: whyEn,
      whyThisHabitTa: whyTa,
      whyThisHabitHi: whyHi,
      healthProfileChip: chip || undefined,
    };
  });
}

/**
 * Updates bandit rewards:
 * +1 on completion
 * +0.5 on "This helped"
 * -0.5 on "Not for me"
 * +0.3 trend bonus if related measure improved
 */
export function recordHabitCompletion(
  state: UserBanditState,
  habitId: string,
  completed: boolean
): UserBanditState {
  const todayKey = getTodayDateKey();
  if (!state.completedToday[todayKey]) {
    state.completedToday[todayKey] = [];
  }

  const arm = state.arms[habitId] || {
    habitId,
    alpha: 2.0,
    beta: 2.0,
    completionsCount: 0,
    helpfulCount: 0,
    unhelpfulCount: 0,
    trendBonusCount: 0,
  };

  if (completed) {
    if (!state.completedToday[todayKey].includes(habitId)) {
      state.completedToday[todayKey].push(habitId);
      arm.alpha += 1.0;
      arm.completionsCount += 1;
      arm.lastCompletedDate = todayKey;
    }
  } else {
    state.completedToday[todayKey] = state.completedToday[todayKey].filter((id) => id !== habitId);
    if (arm.alpha > 2.0) arm.alpha -= 1.0;
    if (arm.completionsCount > 0) arm.completionsCount -= 1;
  }

  state.arms[habitId] = arm;
  saveUserBanditState(state);
  return { ...state };
}

export function recordHabitFeedback(
  state: UserBanditState,
  habitId: string,
  feedback: 'helped' | 'not_for_me'
): UserBanditState {
  const todayKey = getTodayDateKey();
  if (!state.feedbackToday[todayKey]) {
    state.feedbackToday[todayKey] = {};
  }

  const arm = state.arms[habitId] || {
    habitId,
    alpha: 2.0,
    beta: 2.0,
    completionsCount: 0,
    helpfulCount: 0,
    unhelpfulCount: 0,
    trendBonusCount: 0,
  };

  const prev = state.feedbackToday[todayKey][habitId];
  if (prev === feedback) return state; // no change

  // Revert previous if any
  if (prev === 'helped') {
    arm.alpha = Math.max(1.0, arm.alpha - 0.5);
    arm.helpfulCount = Math.max(0, arm.helpfulCount - 1);
  } else if (prev === 'not_for_me') {
    arm.beta = Math.max(1.0, arm.beta - 0.5);
    arm.unhelpfulCount = Math.max(0, arm.unhelpfulCount - 1);
  }

  // Apply new
  if (feedback === 'helped') {
    arm.alpha += 0.5;
    arm.helpfulCount += 1;
  } else {
    arm.beta += 0.5;
    arm.unhelpfulCount += 1;
  }

  state.feedbackToday[todayKey][habitId] = feedback;
  state.arms[habitId] = arm;
  saveUserBanditState(state);
  return { ...state };
}

/**
 * Checks for 2-3 day trend bonus (e.g. sleep hours improved after bedtime habit)
 */
export function evaluateTrendBonus(
  state: UserBanditState,
  recentCheckins: Checkin[]
): UserBanditState {
  if (recentCheckins.length < 3) return state;

  const latest = recentCheckins[0];
  const prior = recentCheckins[1];

  // If sleep improved from poor to good/okay, reward screen-free or walk habit
  if (prior.sleep === 'poor' && (latest.sleep === 'good' || latest.sleep === 'okay')) {
    const sleepHabit = state.arms['habit_screen_free_wind_down'];
    if (sleepHabit && sleepHabit.completionsCount > 0) {
      sleepHabit.alpha += 0.3;
      sleepHabit.trendBonusCount += 1;
    }
  }

  // If energy improved from low to normal/high, reward iron/hydration habit
  if (prior.energy === 'low' && (latest.energy === 'normal' || latest.energy === 'high')) {
    const ironHabit = state.arms['habit_iron_rich_food'];
    if (ironHabit && ironHabit.completionsCount > 0) {
      ironHabit.alpha += 0.3;
      ironHabit.trendBonusCount += 1;
    }
  }

  saveUserBanditState(state);
  return { ...state };
}
