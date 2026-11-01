import type { Language } from '../../translations';

export type AppActionType =
  | 'navigate_home'
  | 'navigate_checkin'
  | 'navigate_baby'
  | 'navigate_ask'
  | 'navigate_reports'
  | 'navigate_doctor_summary'
  | 'navigate_circle'
  | 'navigate_learn'
  | 'navigate_vitals'
  | 'navigate_symptoms'
  | 'navigate_profile'
  | 'navigate_settings'
  | 'select_pregnancy_week'
  | 'select_baby_tab'
  | 'switch_device_mode'
  | 'set_theme'
  | 'set_mode'
  | 'set_language'
  | 'start_checkin'
  | 'start_breathing'
  | 'start_vitals_check'
  | 'start_symptom_log'
  | 'print_doctor_summary'
  | 'download_data'
  | 'open_demo_scenarios'
  | 'open_presentation'
  | 'show_call_doctor'
  | 'show_ambulance'
  | 'navigate_vault'
  | 'logout';

export interface AppAction {
  type: AppActionType;
  descriptionEn: string;
  descriptionTa: string;
  descriptionHi: string;
  payload?: any;
  isEmergencyImmediate?: boolean;
}

// ALLOWED FIXED ACTIONS LIST ONLY
export const ALLOWED_ACTION_TYPES: AppActionType[] = [
  'navigate_home',
  'navigate_checkin',
  'navigate_baby',
  'navigate_ask',
  'navigate_reports',
  'navigate_doctor_summary',
  'navigate_circle',
  'navigate_learn',
  'navigate_vitals',
  'navigate_symptoms',
  'navigate_profile',
  'navigate_settings',
  'select_pregnancy_week',
  'select_baby_tab',
  'switch_device_mode',
  'set_theme',
  'set_mode',
  'set_language',
  'start_checkin',
  'start_breathing',
  'start_vitals_check',
  'start_symptom_log',
  'print_doctor_summary',
  'download_data',
  'open_demo_scenarios',
  'open_presentation',
  'show_call_doctor',
  'show_ambulance',
  'navigate_vault',
  'logout',
];

/**
 * PART 3: Fixed Safety Check (Runs first, NO AI)
 * Checks for danger words in English, Tamil, and Hindi.
 */
export function checkFixedDangerKeywords(text: string): {
  isDanger: boolean;
  dangerReason: string;
} {
  const lower = text.toLowerCase();

  // 1. Vaginal Bleeding / இரத்தப்போக்கு / खून
  const bleedingKeywords = [
    'bleeding',
    'heavy bleeding',
    'blood clot',
    'blood clots',
    'spotting blood',
    'bleeding red',
    'இரத்தப்போக்கு',
    'ரத்தப்போக்கு',
    'இரத்தம் கசிவு',
    'ரத்தம் வருது',
    'खून',
    'रक्तस्राव',
    'खून आ रहा',
  ];
  if (bleedingKeywords.some((k) => lower.includes(k))) {
    return {
      isDanger: true,
      dangerReason: 'vaginal_bleeding',
    };
  }

  // 2. Baby not moving / குழந்தை அசைவு இல்லை / बच्चा हिल नहीं रहा
  const movementKeywords = [
    'baby not moving',
    "haven't felt baby",
    'no movement',
    'movement stopped',
    'baby moving less',
    'decreased movement',
    'fetal movement stopped',
    'குழந்தை அசைவு இல்லை',
    'அசைவு தெரியவில்லை',
    'குழந்தை அசையவில்லை',
    'அசைவு நின்றுவிட்டது',
    'குழந்தை உதைக்கவில்லை',
    'बच्चा हिल नहीं रहा',
    'हलचल बंद',
    'हलचल कम',
    'बच्चे की हलचल नहीं',
  ];
  if (movementKeywords.some((k) => lower.includes(k))) {
    return {
      isDanger: true,
      dangerReason: 'decreased_movement',
    };
  }

  // 3. Seizure or fainting / வலிப்பு, மயக்கம் / दौरा, बेहोश
  const seizureKeywords = [
    'seizure',
    'fit',
    'fits',
    'convulsion',
    'fainted',
    'fainting',
    'passed out',
    'blackout',
    'வலிப்பு',
    'மயக்கம்',
    'மயங்கிவிட்டேன்',
    'தள்ளாட்டம்',
    'दौरा',
    'बेहोश',
    'बेहोशी',
    'चक्कर खाकर गिरना',
  ];
  if (seizureKeywords.some((k) => lower.includes(k))) {
    return {
      isDanger: true,
      dangerReason: 'seizure_fainting',
    };
  }

  // 4. Water leaking / தண்ணீர் கசிவு / पानी निकलना
  const waterKeywords = [
    'water leaking',
    'water broke',
    'fluid leak',
    'leaking fluid',
    'gush of fluid',
    'amniotic fluid',
    'தண்ணீர் கசிவு',
    'பனிக்குடம் உடைந்த',
    'நீர் கசிவு',
    'தண்ணீர் வெளியேறுதல்',
    'पानी निकलना',
    'पानी छूटना',
    'एमनियोटिक फ्लूइड',
    'पानी बहना',
  ];
  if (waterKeywords.some((k) => lower.includes(k))) {
    return {
      isDanger: true,
      dangerReason: 'water_leaking',
    };
  }

  // 5. Severe belly pain / கடுமையான வயிற்று வலி / तेज़ पेट दर्द
  const bellyPainKeywords = [
    'severe belly pain',
    'severe abdominal pain',
    'severe stomach pain',
    'severe pelvic pain',
    'sharp belly pain',
    'cramping severe',
    'கடுமையான வயிற்று வலி',
    'அடிவயிற்று வலி',
    'தாங்க முடியாத வலி',
    'तेज़ पेट दर्द',
    'अत्यधिक पेट दर्द',
    'पेट में असहनीय दर्द',
    'तेज पेट दर्द',
  ];
  if (bellyPainKeywords.some((k) => lower.includes(k))) {
    return {
      isDanger: true,
      dangerReason: 'severe_belly_pain',
    };
  }

  // 6. Blurred vision with headache
  const hasVisionIssue =
    lower.includes('blurred vision') ||
    lower.includes('blurry vision') ||
    lower.includes('flashing light') ||
    lower.includes('spots in eye') ||
    lower.includes('மங்கலான பார்வை') ||
    lower.includes('பார்வை மங்குதல்') ||
    lower.includes('धुंधली दृष्टि') ||
    lower.includes('आंखों के आगे अंधेरा');

  const hasHeadache =
    lower.includes('headache') ||
    lower.includes('severe head') ||
    lower.includes('தலைவலி') ||
    lower.includes('கடுமையான தலைவலி') ||
    lower.includes('सिरदर्द') ||
    lower.includes('तेज सिरदर्द');

  if (hasVisionIssue && hasHeadache) {
    return {
      isDanger: true,
      dangerReason: 'preeclampsia_headache_vision',
    };
  }

  // 7. Difficulty breathing
  const breathingKeywords = [
    'difficulty breathing',
    'hard to breathe',
    'cannot breathe',
    'struggling to breathe',
    'shortness of breath severe',
    'மூச்சு திணறல்',
    'மூச்சு விட முடியவில்லை',
    'மூச்சு வாங்குதல்',
    'सांस लेने में तकलीफ',
    'सांस फूलना',
    'सांस नहीं आ रही',
  ];
  if (breathingKeywords.some((k) => lower.includes(k))) {
    return {
      isDanger: true,
      dangerReason: 'difficulty_breathing',
    };
  }

  return { isDanger: false, dangerReason: '' };
}

/**
 * Hardcoded Red Emergency Message in her language (Part 3)
 */
export function getFixedEmergencyText(lang: Language): string {
  if (lang === 'ta') {
    return 'இது அவசர நிலையாக இருக்கலாம். தயவுசெய்து உடனடியாக உங்கள் மருத்துவரை அழைக்கவும், அல்லது ஆம்புலன்ஸுக்கு 108 / 112 என்ற எண்ணை அழைக்கவும். தாமதிக்க வேண்டாம்.';
  }
  if (lang === 'hi') {
    return 'यह गंभीर हो सकता है। कृपया तुरंत अपने डॉक्टर या अस्पताल को फोन करें, या एम्बुलेंस के लिए 108 / 112 पर कॉल करें। बिल्कुल भी देर न करें।';
  }
  return 'This may be serious. Please call your doctor or hospital right now, or call 108 / 112 for an ambulance. Do not wait.';
}

/**
 * PART 4: Fast Keyword Rule Recognition for Commands (No AI)
 * Ensures questions like "what is baby development?" or "dark circles" are NOT triggered as commands.
 */
export function parseLocalCommand(text: string): AppAction | null {
  const lower = text.trim().toLowerCase();

  // Safeguard: Questions should NOT trigger commands
  const questionWords = [
    'what is',
    'what are',
    'why is',
    'why do',
    'how to',
    'when to',
    'can i',
    'tell me about',
    'explain',
    'என்ன',
    'எப்போது',
    'எப்படி',
    'ஏன்',
    'என்னவென்று',
    'क्या है',
    'कैसे',
    'क्यों',
    'कब',
    'बताओ',
  ];
  const isQuestion = questionWords.some((q) => lower.startsWith(q) || lower.includes(` ${q} `) || lower.endsWith('?'));

  // Negative words like "dark circles" or "tamil food" shouldn't trigger "dark mode" or "language"
  if (lower.includes('dark circles') || lower.includes('dark circle') || lower.includes('கருவளையம்')) {
    return null;
  }
  if (lower.includes('tamil food') || lower.includes('hindi movie')) {
    return null;
  }

  // 1. Emergency immediate call commands (NO YES/NO, executed immediately)
  if (
    lower.includes('call doctor') ||
    lower.includes('call my doctor') ||
    lower.includes('மருத்துவரை அழைக்கவும்') ||
    lower.includes('டாக்டரை அழைக்கவும்') ||
    lower.includes('डॉक्टर को कॉल') ||
    lower.includes('डॉक्टर को फोन')
  ) {
    return {
      type: 'show_call_doctor',
      descriptionEn: 'Call your doctor',
      descriptionTa: 'உங்கள் மருத்துவரை அழைக்கவும்',
      descriptionHi: 'अपने डॉक्टर को फोन करें',
      isEmergencyImmediate: true,
    };
  }

  if (
    lower.includes('call ambulance') ||
    lower.includes('call 108') ||
    lower.includes('call 112') ||
    lower.includes('ஆம்புலன்ஸ்') ||
    lower.includes('எமர்ஜென்சி') ||
    lower.includes('एम्बुलेंस') ||
    lower.includes('108 पर कॉल')
  ) {
    return {
      type: 'show_ambulance',
      descriptionEn: 'Call emergency ambulance (108 / 112)',
      descriptionTa: 'அவசர ஆம்புலன்ஸ் (108 / 112)',
      descriptionHi: 'आपातकालीन एम्बुलेंस (108 / 112)',
      isEmergencyImmediate: true,
    };
  }

  // If it's a question, do not match navigation commands
  if (isQuestion) {
    return null;
  }

  // 2. Baby Development & Specific Tabs
  if (
    lower.includes('show mom tab') ||
    lower.includes('mom tab') ||
    lower.includes('அம்மா பிரிவு') ||
    lower.includes('माँ टैब')
  ) {
    return {
      type: 'navigate_baby',
      payload: { tab: 'mom' },
      descriptionEn: 'open Baby Development (Mom tab)',
      descriptionTa: 'குழந்தை வளர்ச்சி (அம்மா பிரிவு) திறக்கவா',
      descriptionHi: 'शिशु विकास (माँ टैब) खोलें',
    };
  }

  if (
    lower.includes('show care tab') ||
    lower.includes('care tab') ||
    lower.includes('பராமரிப்பு பிரிவு') ||
    lower.includes('देखभाल टैब')
  ) {
    return {
      type: 'navigate_baby',
      payload: { tab: 'care' },
      descriptionEn: 'open Baby Development (Care tab)',
      descriptionTa: 'குழந்தை வளர்ச்சி (பராமரிப்பு பிரிவு) திறக்கவா',
      descriptionHi: 'शिशु विकास (देखभाल टैब) खोलें',
    };
  }

  if (
    lower.includes('open baby development') ||
    lower.includes('show baby development') ||
    lower.includes('baby development') ||
    lower.includes('baby growth') ||
    lower.includes('குழந்தை வளர்ச்சி') ||
    lower.includes('பாப்பா வளர்ச்சி') ||
    lower.includes('शिशु विकास')
  ) {
    return {
      type: 'navigate_baby',
      payload: { tab: 'baby' },
      descriptionEn: 'open Baby Development',
      descriptionTa: 'குழந்தை வளர்ச்சிப் பிரிவைத் திறக்கவா',
      descriptionHi: 'शिशु विकास सेक्शन खोलें',
    };
  }

  // 3. Theme & Modes
  if (
    lower.includes('switch to neon blue') ||
    lower.includes('neon blue') ||
    lower.includes('blue theme') ||
    lower.includes('நீல நிறம்') ||
    lower.includes('நீல தீம்') ||
    lower.includes('नीला रंग') ||
    lower.includes('नियॉन ब्लू')
  ) {
    return {
      type: 'set_theme',
      payload: { theme: 'neon-blue' },
      descriptionEn: 'switch to Neon Blue theme',
      descriptionTa: 'Neon Blue நீல நிறத்திற்கு மாற்றவா',
      descriptionHi: 'Neon Blue थीम में बदलें',
    };
  }

  if (
    lower.includes('switch to neon pink') ||
    lower.includes('neon pink') ||
    lower.includes('pink theme') ||
    lower.includes('இளஞ்சிவப்பு') ||
    lower.includes('பிங்க் தீம்') ||
    lower.includes('गुलाबी रंग') ||
    lower.includes('नियॉन पिंक')
  ) {
    return {
      type: 'set_theme',
      payload: { theme: 'neon-pink' },
      descriptionEn: 'switch to Neon Pink theme',
      descriptionTa: 'Neon Pink இளஞ்சிவப்பு நிறத்திற்கு மாற்றவா',
      descriptionHi: 'Neon Pink थीम में बदलें',
    };
  }

  if (
    lower.includes('dark mode') ||
    lower.includes('turn on dark') ||
    lower.includes('இருண்ட முறை') ||
    lower.includes('डार्क मोड')
  ) {
    return {
      type: 'set_mode',
      payload: { mode: 'dark' },
      descriptionEn: 'switch to Dark Mode',
      descriptionTa: 'இருண்ட முறைக்கு (Dark Mode) மாற்றவா',
      descriptionHi: 'डार्क मोड (Dark Mode) में बदलें',
    };
  }

  if (
    lower.includes('light mode') ||
    lower.includes('turn on light') ||
    lower.includes('வெளிச்ச முறை') ||
    lower.includes('लाइट मोड')
  ) {
    return {
      type: 'set_mode',
      payload: { mode: 'light' },
      descriptionEn: 'switch to Light Mode',
      descriptionTa: 'வெளிச்ச முறைக்கு (Light Mode) மாற்றவா',
      descriptionHi: 'लाइट मोड (Light Mode) में बदलें',
    };
  }

  // 4. Daily Check-in
  if (
    lower.includes('start my check-in') ||
    lower.includes('start check-in') ||
    lower.includes('open check-in') ||
    lower.includes('daily check-in') ||
    lower.includes('checkin') ||
    lower.includes('தினசரி பதிவு') ||
    lower.includes('செக் இன்') ||
    lower.includes('दैनिक चेक-इन') ||
    lower.includes('चेक इन शुरू')
  ) {
    return {
      type: 'start_checkin',
      descriptionEn: 'start your Daily Check-in',
      descriptionTa: 'உங்கள் இன்றைய தினசரி பதிவைத் தொடங்கவா',
      descriptionHi: 'आपका दैनिक चेक-इन शुरू करें',
    };
  }

  // 5. Breathing Exercise
  if (
    lower.includes('breathing exercise') ||
    lower.includes('start breathing') ||
    lower.includes('take a breath') ||
    lower.includes('breathe') ||
    lower.includes('மூச்சுப் பயிற்சி') ||
    lower.includes('மூச்சு பயிற்சி') ||
    lower.includes('सांस का व्यायाम') ||
    lower.includes('प्राणायाम')
  ) {
    return {
      type: 'start_breathing',
      descriptionEn: 'start the Guided Breathing Exercise',
      descriptionTa: 'அமைதியான மூச்சுப் பயிற்சியைத் தொடங்கவா',
      descriptionHi: 'शांत सांस लेने का व्यायाम शुरू करें',
    };
  }

  // 6. Doctor Summary & Printing
  if (
    lower.includes('print doctor summary') ||
    lower.includes('print summary') ||
    lower.includes('மருத்துவர் சுருக்கம் அச்சிடு') ||
    lower.includes('அச்சிடு') ||
    lower.includes('डॉक्टर समरी प्रिंट') ||
    lower.includes('प्रिंट करें')
  ) {
    return {
      type: 'print_doctor_summary',
      descriptionEn: 'open the Doctor Summary print dialog',
      descriptionTa: 'மருத்துவர் ஆலோசனை சுருக்கத்தை அச்சிடவா',
      descriptionHi: 'डॉक्टर सारांश प्रिंट विंडो खोलें',
    };
  }

  if (
    lower.includes('show doctor summary') ||
    lower.includes('open doctor summary') ||
    lower.includes('doctor summary') ||
    lower.includes('மருத்துவர் சுருக்கம்') ||
    lower.includes('डॉक्टर सारांश')
  ) {
    return {
      type: 'navigate_doctor_summary',
      descriptionEn: 'open Doctor Summary',
      descriptionTa: 'மருத்துவர் சுருக்கப் பக்கத்தைத் திறக்கவா',
      descriptionHi: 'डॉक्टर समरी सेक्शन खोलें',
    };
  }

  // 7. Report Decoder
  if (
    lower.includes('open reports') ||
    lower.includes('report decoder') ||
    lower.includes('scan reports') ||
    lower.includes('மருத்துவ அறிக்கைகள்') ||
    lower.includes('ஸ்கேன் அறிக்கை') ||
    lower.includes('मेडिकल रिपोर्ट') ||
    lower.includes('स्कैन रिपोर्ट')
  ) {
    return {
      type: 'navigate_reports',
      descriptionEn: 'open Report Decoder',
      descriptionTa: 'மருத்துவ அறிக்கை விளக்கப் பக்கத்தைத் திறக்கவா',
      descriptionHi: 'रिपोर्ट डीकोडर सेक्शन खोलें',
    };
  }

  // 8. Vitals & Patterns
  if (
    lower.includes('vitals check') ||
    lower.includes('open vitals') ||
    lower.includes('bp and sugar') ||
    lower.includes('நாடி துடிப்பு') ||
    lower.includes('வாசல் செக்') ||
    lower.includes('वाइटल्स चेक') ||
    lower.includes('बीपी और शुगर')
  ) {
    return {
      type: 'navigate_vitals',
      descriptionEn: 'open Vitals Check',
      descriptionTa: 'வைட்டல்ஸ் மற்றும் இரத்த அழுத்தப் பரிசோதனையைத் திறக்கவா',
      descriptionHi: 'वाइटल्स चेक सेक्शन खोलें',
    };
  }

  // 9. Community / Circle
  if (
    lower.includes('open community') ||
    lower.includes('momcare circle') ||
    lower.includes('circle') ||
    lower.includes('தாய்மார் குழு') ||
    lower.includes('சர்க்கிள்') ||
    lower.includes('मॉमकेयर सर्कल') ||
    lower.includes('कम्युनिटी')
  ) {
    return {
      type: 'navigate_circle',
      descriptionEn: 'open MomCare Circle',
      descriptionTa: 'MomCare Circle தாய்மார் குழுவைத் திறக்கவா',
      descriptionHi: 'MomCare Circle खोलें',
    };
  }

  // 10. Learn
  if (
    lower.includes('open learn') ||
    lower.includes('learn section') ||
    lower.includes('கற்றல்') ||
    lower.includes('सीखें')
  ) {
    return {
      type: 'navigate_learn',
      descriptionEn: 'open Learn section',
      descriptionTa: 'கற்றல் பகுதியைத் திறக்கவா',
      descriptionHi: 'लर्न सेक्शन खोलें',
    };
  }

  // Health Vault
  if (
    lower.includes('vault') ||
    lower.includes('health vault') ||
    lower.includes('வால்ட்') ||
    lower.includes('பாதுகாப்பகம்') ||
    lower.includes('वॉल्ट') ||
    lower.includes('हेल्थ वॉल्ट')
  ) {
    return {
      type: 'navigate_vault',
      descriptionEn: 'open My Health Vault',
      descriptionTa: 'My Health Vault பக்கத்தைத் திறக்கவா',
      descriptionHi: 'My Health Vault खोलें',
    };
  }

  // 11. Profile & Settings
  if (
    lower.includes('open settings') ||
    lower.includes('settings') ||
    lower.includes('அமைப்புகள்') ||
    lower.includes('सेटिंग्स')
  ) {
    return {
      type: 'navigate_settings',
      descriptionEn: 'open Settings',
      descriptionTa: 'அமைப்புகள் பக்கத்தைத் திறக்கவா',
      descriptionHi: 'सेटिंग्स सेक्शन खोलें',
    };
  }

  if (
    lower.includes('open profile') ||
    lower.includes('profile') ||
    lower.includes('சுயவிவரம்') ||
    lower.includes('प्रोफाइल')
  ) {
    return {
      type: 'navigate_profile',
      descriptionEn: 'open your Profile',
      descriptionTa: 'உங்கள் சுயவிவரப் பக்கத்தைத் திறக்கவா',
      descriptionHi: 'आपकी प्रोफाइल खोलें',
    };
  }

  // 12. Download Data
  if (
    lower.includes('download my data') ||
    lower.includes('export data') ||
    lower.includes('எனது தரவை பதிவிறக்கு') ||
    lower.includes('मेरा डेटा डाउनलोड')
  ) {
    return {
      type: 'download_data',
      descriptionEn: 'download your medical & check-in data',
      descriptionTa: 'உங்கள் தரவை பதிவிறக்கம் செய்யவா',
      descriptionHi: 'आपका डेटा डाउनलोड करें',
    };
  }

  // 1.5 Device Mode Switching (Mobile, Tablet, Desktop)
  if (
    lower.includes('mobile mode') ||
    lower.includes('mobile view') ||
    lower.includes('switch to mobile') ||
    lower.includes('phone mode') ||
    lower.includes('phone view') ||
    lower.includes('மொபைல் மோடு') ||
    lower.includes('மொபைல் பார்வை') ||
    lower.includes('मोबाइल मोड')
  ) {
    return {
      type: 'switch_device_mode',
      payload: { mode: 'mobile' },
      descriptionEn: 'switch to Mobile mode',
      descriptionTa: 'மொபைல் முறைக்கு (Mobile mode) மாற்றவா',
      descriptionHi: 'मोबाइल मोड में बदलें',
    };
  }

  if (
    lower.includes('tablet mode') ||
    lower.includes('tablet view') ||
    lower.includes('switch to tablet') ||
    lower.includes('ipad mode') ||
    lower.includes('ipad view') ||
    lower.includes('டேப்லெட் மோடு') ||
    lower.includes('டேப்லெட் பார்வை') ||
    lower.includes('टैबलेट मोड')
  ) {
    return {
      type: 'switch_device_mode',
      payload: { mode: 'tablet' },
      descriptionEn: 'switch to Tablet mode',
      descriptionTa: 'டேப்லெட் முறைக்கு (Tablet mode) மாற்றவா',
      descriptionHi: 'टैबलेट मोड में बदलें',
    };
  }

  if (
    lower.includes('desktop mode') ||
    lower.includes('desktop view') ||
    lower.includes('switch to desktop') ||
    lower.includes('computer view') ||
    lower.includes('pc view') ||
    lower.includes('டெஸ்க்டாப் மோடு') ||
    lower.includes('டெஸ்க்டாப் பார்வை') ||
    lower.includes('डेस्कटॉप मोड')
  ) {
    return {
      type: 'switch_device_mode',
      payload: { mode: 'desktop' },
      descriptionEn: 'switch to Desktop mode',
      descriptionTa: 'டெஸ்க்டாப் முறைக்கு (Desktop mode) மாற்றவா',
      descriptionHi: 'डेस्कटॉप मोड में बदलें',
    };
  }

  // 1.6 Pregnancy Week Jumping (e.g., "go to week 28", "week 32", "வாரம் 24")
  const weekMatch = lower.match(/(?:week|wk|வாரம்|हफ्ता|हफ़्ते)\s*(\d{1,2})/i);
  if (weekMatch && weekMatch[1]) {
    const parsedWk = parseInt(weekMatch[1], 10);
    if (parsedWk >= 1 && parsedWk <= 42) {
      return {
        type: 'select_pregnancy_week',
        payload: { week: parsedWk },
        descriptionEn: `jump to Week ${parsedWk} development`,
        descriptionTa: `வாரம் ${parsedWk} வளர்ச்சிப் பக்கத்திற்கு செல்லவா`,
        descriptionHi: `हफ्ते ${parsedWk} के विकास सेक्शन पर जाएँ`,
      };
    }
  }

  // 1.7 Vitals Check / ML Screening
  if (
    lower.includes('check vitals') ||
    lower.includes('vitals check') ||
    lower.includes('vitals screening') ||
    lower.includes('blood pressure check') ||
    lower.includes('bp check') ||
    lower.includes('வைட்டல்ஸ்') ||
    lower.includes('இரத்த அழுத்தம் பரிசோதனை') ||
    lower.includes('வாசல் செக்') ||
    lower.includes('वाइटल्स चेक') ||
    lower.includes('रक्तचाप जाँच')
  ) {
    return {
      type: 'navigate_vitals',
      descriptionEn: 'open Vitals Check (ML screening)',
      descriptionTa: 'வைட்டல்ஸ் பரிசோதனைப் பக்கத்தைத் திறக்கவா',
      descriptionHi: 'वाइटल्स चेक सेक्शन खोलें',
    };
  }

  // 1.8 Symptom Center / Triage
  if (
    lower.includes('check symptoms') ||
    lower.includes('symptom triage') ||
    lower.includes('log symptom') ||
    lower.includes('symptoms center') ||
    lower.includes('அறிகுறிகள்') ||
    lower.includes('நோய் அறிகுறிகள்') ||
    lower.includes('लक्षण जाँच') ||
    lower.includes('लक्षण केंद्र')
  ) {
    return {
      type: 'navigate_symptoms',
      descriptionEn: 'open Symptom Triage Center',
      descriptionTa: 'அறிகுறி பரிசோதனைப் பக்கத்தைத் திறக்கவா',
      descriptionHi: 'लक्षण जाँच केंद्र खोलें',
    };
  }

  // 1.9 3D Womb / Timeline Story
  if (
    lower.includes('3d womb') ||
    lower.includes('womb visual') ||
    lower.includes('view womb') ||
    lower.includes('fetus in womb') ||
    lower.includes('கருப்பை காட்சி') ||
    lower.includes('3D गर्भ दृश्य')
  ) {
    return {
      type: 'select_baby_tab',
      payload: { tab: 'womb' },
      descriptionEn: 'open 3D Womb Visualizer',
      descriptionTa: '3D கருப்பை காட்சியைத் திறக்கவா',
      descriptionHi: '3D गर्भ दृश्य खोलें',
    };
  }

  if (
    lower.includes('pregnancy story') ||
    lower.includes('my story') ||
    lower.includes('pregnancy timeline') ||
    lower.includes('டைம்லைன்') ||
    lower.includes('என் கதை') ||
    lower.includes('मेरी कहानी')
  ) {
    return {
      type: 'select_baby_tab',
      payload: { tab: 'timeline' },
      descriptionEn: 'open My Pregnancy Story timeline',
      descriptionTa: 'கர்ப்ப கால டைம்லைன் கதையைத் திறக்கவா',
      descriptionHi: 'मेरी गर्भावस्था समयरेखा खोलें',
    };
  }

  // 1.10 Presentation & Demo Scenarios
  if (
    lower.includes('presentation') ||
    lower.includes('show slides') ||
    lower.includes('pitch deck') ||
    lower.includes('ஸ்லைடு') ||
    lower.includes('பிரசன்டேஷன்') ||
    lower.includes('स्लाइड्स')
  ) {
    return {
      type: 'open_presentation',
      descriptionEn: 'open 15-Slide Presentation Deck',
      descriptionTa: 'விளக்கக் காட்சி ஸ்லைடுகளைத் திறக்கவா',
      descriptionHi: 'प्रेजेंटेशन स्लाइड्स खोलें',
    };
  }

  if (
    lower.includes('demo scenario') ||
    lower.includes('demo scenarios') ||
    lower.includes('show demo') ||
    lower.includes('clinical demo') ||
    lower.includes('டெமோ') ||
    lower.includes('மாதிரி காட்சிகள்') ||
    lower.includes('डेमो')
  ) {
    return {
      type: 'open_demo_scenarios',
      descriptionEn: 'open Judges Demo Scenarios modal',
      descriptionTa: 'மாதிரி டெமோ காட்சிகளைத் திறக்கவா',
      descriptionHi: 'डेमो परिदृश्य खोलें',
    };
  }

  // 13. Home
  if (
    lower.includes('go home') ||
    lower.includes('open home') ||
    lower.includes('home screen') ||
    lower === 'home' ||
    lower.includes('முகப்பு') ||
    lower.includes('होम')
  ) {
    return {
      type: 'navigate_home',
      descriptionEn: 'go to Home Dashboard',
      descriptionTa: 'முகப்புப் பக்கத்திற்குச் செல்லவா',
      descriptionHi: 'होम डैशबोर्ड पर जाएँ',
    };
  }

  // 14. Log out
  if (
    lower.includes('log out') ||
    lower.includes('logout') ||
    lower.includes('sign out') ||
    lower.includes('வெளியேறு') ||
    lower.includes('லாக் அவுட்') ||
    lower.includes('लॉग आउट')
  ) {
    return {
      type: 'logout',
      descriptionEn: 'log out of MomCare',
      descriptionTa: 'MomCare இலிருந்து வெளியேறவா',
      descriptionHi: 'MomCare से लॉग आउट करें',
    };
  }

  return null;
}

/**
 * Checks if user typed an affirmative response
 */
export function isUserAffirmative(text: string): boolean {
  const lower = text.trim().toLowerCase();
  const yesTokens = [
    'yes',
    'yep',
    'yeah',
    'yup',
    'sure',
    'ok',
    'okay',
    'please do',
    'do it',
    'open it',
    'yes please',
    'yes buddy',
    'do it buddy',
    'ஆம்',
    'சரி',
    'ஆமாம்',
    'திறக்கவும்',
    'செய்',
    'செய்யுங்கள்',
    'பட்டி செய்',
    'हाँ',
    'हां',
    'हाँ जी',
    'हाँ बडी',
    'ठीक है',
    'ज़रूर',
    'खोलें',
    'करो',
  ];
  return yesTokens.some((t) => lower === t || lower.startsWith(`${t} `) || lower.endsWith(` ${t}`));
}

/**
 * Checks if user typed a negative response
 */
export function isUserNegative(text: string): boolean {
  const lower = text.trim().toLowerCase();
  const noTokens = [
    'no',
    'nope',
    'nah',
    'cancel',
    "don't",
    'do not',
    'never mind',
    'stop',
    'no buddy',
    'இல்லை',
    'வேண்டாம்',
    'ரத்து செய்',
    'नहीं',
    'ना',
    'मत करो',
    'रहने दो',
    'रद्द करें',
  ];
  return noTokens.some((t) => lower === t || lower.startsWith(`${t} `) || lower.endsWith(` ${t}`));
}

/**
 * Formats Yes/No prompt text in user language naming Buddy
 */
export function getConfirmationPrompt(action: AppAction, lang: Language): string {
  if (lang === 'ta') {
    return `Buddy உங்களுக்காக ${action.descriptionTa}?`;
  }
  if (lang === 'hi') {
    return `क्या आप चाहते हैं कि Buddy ${action.descriptionHi}?`;
  }
  return `Do you want Buddy to ${action.descriptionEn}?`;
}

/**
 * Formats success message after execution naming Buddy
 */
export function getActionSuccessMessage(action: AppAction, lang: Language): string {
  if (lang === 'ta') {
    return `Buddy: ${action.descriptionTa} முடிந்தது ✓`;
  }
  if (lang === 'hi') {
    return `Buddy: ${action.descriptionHi} पूरा हुआ ✓`;
  }
  return `Buddy: ${action.descriptionEn.replace('open ', 'Opened ').replace('switch to ', 'Switched to ').replace('start ', 'Started ').replace('jump to ', 'Jumped to ').replace('go to ', 'Navigated to ')} ✓`;
}

/**
 * Formats rejection response naming Buddy
 */
export function getActionCancelMessage(lang: Language): string {
  if (lang === 'ta') {
    return 'சரி, Buddy அதை செய்யவில்லை. உங்களுக்கு வேறு என்ன உதவி வேண்டும்?';
  }
  if (lang === 'hi') {
    return 'कोई बात नहीं, Buddy ऐसा नहीं करेगा। बताइए मैं आपकी और क्या मदद करूँ?';
  }
  return "No problem, Buddy won't do that. What else can I help you with?";
}
