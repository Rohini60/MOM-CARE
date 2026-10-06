import type { Checkin, SymptomRecord, SymptomPatternAlert } from '../../types';

export interface SymptomFrequencyItem {
  name: string;
  count: number;
  locations: string[];
  recentDate: string;
}

export interface PatternAnalysisReport {
  alerts: SymptomPatternAlert[];
  frequencySummary: SymptomFrequencyItem[];
  totalLogsInWindow: number;
  dominantSymptom?: string;
  hasPersistentConcerns: boolean;
}

// Normalized clinical dictionary of common pregnancy symptoms & location mapping
const SYMPTOM_CLINICAL_MAP: Record<string, { advice: string; severity: 'mild' | 'moderate' | 'high' }> = {
  'lower back pain': {
    advice: 'Lower back discomfort logged 3+ times in the past week. Frequent back pain past mid-pregnancy often stems from altered spinal curvature (lordosis) and relaxin hormone relaxing pelvic joints. Discuss with your doctor at your next visit; avoid prolonged standing, consider a maternity support band, and ask about physical therapy.',
    severity: 'moderate',
  },
  'headache': {
    advice: 'Persistent or recurring headache logged 3+ times this week. While tension and hormonal headaches are common, recurring headaches in the 2nd and 3rd trimester warrant a blood pressure check to rule out gestational hypertension or preeclampsia. Please mention this pattern to your midwife or doctor.',
    severity: 'high',
  },
  'abdominal pain': {
    advice: 'Abdominal / pelvic discomfort recorded 3+ times in the past 7 days. Round ligament stretching is routine, but persistent abdominal pain should be clinically evaluated to rule out preterm uterine contractions, urinary infection, or placental concerns.',
    severity: 'high',
  },
  'fatigue': {
    advice: 'Significant fatigue logged 3+ times over the past week. Progesterone naturally induces tiredness, but persistent exhaustion may also indicate maternal iron-deficiency anemia or thyroid shifts. Ask your care team to check your complete blood count and ferritin levels.',
    severity: 'mild',
  },
  'nausea': {
    advice: 'Persistent nausea logged 3+ times this week. If this is interfering with hydration or nutritional intake, discuss safe antiemetic options and electrolyte strategies with your obstetrician.',
    severity: 'moderate',
  },
  'pelvic girdle pain': {
    advice: 'Pelvic girdle/pubic discomfort recorded 3+ times this week. Symphysis pubis dysfunction (SPD) can benefit significantly from specialized prenatal physical therapy, supportive pillow positioning, and avoiding asymmetric leg movements.',
    severity: 'moderate',
  },
  'leg swelling': {
    advice: 'Swelling in legs/feet logged 3+ times. Dependent edema is common due to vascular pressure, but sudden or persistent swelling should be reviewed alongside your blood pressure and protein urinalysis.',
    severity: 'moderate',
  },
  'heartburn': {
    advice: 'Heartburn/acid reflux logged 3+ times this week. Progesterone relaxes the esophageal sphincter while your growing uterus compresses the stomach. Ask your doctor about pregnancy-safe antacids and try eating smaller, frequent upright meals.',
    severity: 'mild',
  },
};

export function analyzeSymptomPatterns(
  checkins: Checkin[],
  symptoms: SymptomRecord[],
  windowDays = 7
): PatternAnalysisReport {
  const now = new Date();
  const windowStartMs = now.getTime() - windowDays * 24 * 60 * 60 * 1000;

  // Track counts, dates, and locations
  const countMap: Record<string, {
    count: number;
    dates: string[];
    locations: Set<string>;
    originalNames: string[];
  }> = {};

  const recordSymptomOccurrence = (rawName: string, dateStr: string, location?: string) => {
    const logTime = new Date(dateStr).getTime();
    if (isNaN(logTime) || logTime < windowStartMs) return;

    const lower = rawName.toLowerCase().trim();
    let normalized = 'general discomfort';

    if (lower.includes('back')) normalized = 'lower back pain';
    else if (lower.includes('head') || lower.includes('migraine')) normalized = 'headache';
    else if (lower.includes('abdom') || lower.includes('belly') || lower.includes('cramp') || lower.includes('pelvi')) normalized = 'abdominal pain';
    else if (lower.includes('fatigue') || lower.includes('tired') || lower.includes('exhaust')) normalized = 'fatigue';
    else if (lower.includes('nausea') || lower.includes('vomit') || lower.includes('morning sick')) normalized = 'nausea';
    else if (lower.includes('pelvic') || lower.includes('groin') || lower.includes('symphysis')) normalized = 'pelvic girdle pain';
    else if (lower.includes('swell') || lower.includes('edema') || lower.includes('ankle') || lower.includes('feet')) normalized = 'leg swelling';
    else if (lower.includes('heartburn') || lower.includes('reflux') || lower.includes('acid') || lower.includes('indigestion')) normalized = 'heartburn';
    else normalized = lower;

    if (!countMap[normalized]) {
      countMap[normalized] = {
        count: 0,
        dates: [],
        locations: new Set(),
        originalNames: [],
      };
    }

    countMap[normalized].count += 1;
    countMap[normalized].dates.push(dateStr);
    countMap[normalized].originalNames.push(rawName);
    if (location) {
      countMap[normalized].locations.add(location);
    }
  };

  // 1. Process Symptom Records
  for (const s of symptoms) {
    recordSymptomOccurrence(s.symptomName, s.createdAt, s.location);
  }

  // 2. Process Checkins
  for (const c of checkins) {
    if (c.discomfortLocations && c.discomfortLocations.length > 0) {
      for (const loc of c.discomfortLocations) {
        recordSymptomOccurrence(`${loc} discomfort`, c.createdAt, loc);
      }
    }
    if (c.symptoms) {
      recordSymptomOccurrence(c.symptoms, c.createdAt);
    }
  }

  // Generate Alerts for any symptom logged 3 or more times within the 7-day window
  const alerts: SymptomPatternAlert[] = [];
  const frequencySummary: SymptomFrequencyItem[] = [];

  let totalLogs = 0;
  let dominantSymptom: string | undefined = undefined;
  let maxCount = 0;

  for (const [key, data] of Object.entries(countMap)) {
    totalLogs += data.count;
    if (data.count > maxCount) {
      maxCount = data.count;
      dominantSymptom = key;
    }

    // Sort dates
    data.dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const firstDate = data.dates[0];
    const lastDate = data.dates[data.dates.length - 1];

    const prettyName = key.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    frequencySummary.push({
      name: prettyName,
      count: data.count,
      locations: Array.from(data.locations),
      recentDate: lastDate,
    });

    // 3 or more times triggers Pattern Alert
    if (data.count >= 3) {
      const template = SYMPTOM_CLINICAL_MAP[key] || {
        advice: `You have logged ${prettyName} ${data.count} times in the past 7 days. Because this symptom is recurring, we recommend bringing it up with your healthcare provider at your next visit to ensure your comfort and safety.`,
        severity: 'moderate' as const,
      };

      alerts.push({
        symptomName: prettyName,
        occurrenceCount: data.count,
        windowDays,
        firstLoggedDate: firstDate,
        lastLoggedDate: lastDate,
        clinicalAdvice: template.advice,
        severity: template.severity,
        providerReviewAdvised: true,
      });
    }
  }

  // Sort frequency summary descending
  frequencySummary.sort((a, b) => b.count - a.count);

  return {
    alerts,
    frequencySummary,
    totalLogsInWindow: totalLogs,
    dominantSymptom,
    hasPersistentConcerns: alerts.length > 0,
  };
}
