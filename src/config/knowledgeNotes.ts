/**
 * MomCare Clinical Knowledge Notes (K1 - K10)
 * Grounded strictly in WHO, Ministry of Health & Family Welfare (MoHFW India),
 * ICMR-NIN Dietary Guidelines, and NHS/ACOG Maternal Safety Protocols.
 */

export interface KnowledgeNote {
  id: string;
  topic: string;
  content: string;
  sourceName: string;
  category: 'danger' | 'movement' | 'vitals' | 'nutrition' | 'symptoms' | 'wellness' | 'routine';
}

export const KNOWLEDGE_NOTES: KnowledgeNote[] = [
  {
    id: 'K1',
    topic: 'Danger signs in pregnancy',
    content:
      'Vaginal bleeding, fits or seizures, severe persistent headache with blurred vision, high fever, severe belly or epigastric pain, fast or difficult breathing, fluid leaking before labor, or baby moving much less or not at all. These are critical warning signs that need urgent hospital care.',
    sourceName: 'WHO & Ministry of Health Guidance (MoHFW India)',
    category: 'danger',
  },
  {
    id: 'K2',
    topic: 'Baby movement monitoring',
    content:
      'In the second half of pregnancy (from week 20 to 24 onwards), notice your baby’s usual daily pattern of kicks and turns. If movement is clearly less than usual or stops, contact your doctor or maternity triage the same day.',
    sourceName: 'WHO & NHS Maternal Movement Guidelines',
    category: 'movement',
  },
  {
    id: 'K3',
    topic: 'High blood pressure & preeclampsia',
    content:
      'A headache that will not go away, swelling of the face or hands, blurred vision or seeing spots, or sharp pain under the ribs need prompt clinical checking. Blood pressure should be measured at every prenatal checkup.',
    sourceName: 'WHO & FOGSI Hypertensive Disorders Guidelines',
    category: 'vitals',
  },
  {
    id: 'K4',
    topic: 'Anemia, fatigue and iron nutrition',
    content:
      'Tiredness, unusual paleness, and breathlessness can be linked to low iron levels. Take iron and folic acid tablets exactly as advised by your doctor. Helpful iron-rich foods: green leafy vegetables, dates, jaggery, pulses, and eggs, paired with vitamin C foods like lemon or amla to help absorption.',
    sourceName: 'National Health Mission / Anemia Mukt Bharat',
    category: 'nutrition',
  },
  {
    id: 'K5',
    topic: 'Nausea and morning sickness',
    content:
      'Nausea is very common in early pregnancy. Helpful tips: small, frequent light meals, sipping water or lemon-ginger fluids throughout the day, and getting adequate rest. See your doctor if you cannot keep food or water down for 24 hours or are losing weight.',
    sourceName: 'ACOG & NHS Early Pregnancy Care',
    category: 'symptoms',
  },
  {
    id: 'K6',
    topic: 'Sleep positioning and lower back discomfort',
    content:
      'In later pregnancy, sleep on your left or right side with a pillow placed between your knees to support blood flow. Gentle walking and stretching approved by your doctor can ease tension. Strong, sharp, or regular pain needs medical review.',
    sourceName: 'NHS Pregnancy Sleep & Musculoskeletal Care',
    category: 'wellness',
  },
  {
    id: 'K7',
    topic: 'Hydration and nourishing foods',
    content:
      'Drink enough clean water (about 8 to 10 glasses daily) and eat balanced meals containing whole grains, pulses, green vegetables, fresh fruit, milk products, and protein. Avoid raw or undercooked meat, unpasteurized milk, and raw eggs.',
    sourceName: 'Dietary Guidelines for Indians (ICMR-NIN)',
    category: 'nutrition',
  },
  {
    id: 'K8',
    topic: 'Medicines and safe supplements',
    content:
      'Never start, stop, or change any prescription medicine, tablet, over-the-counter syrup, or herbal remedy without asking your doctor or pharmacist first.',
    sourceName: 'WHO Safe Motherhood Pharmacovigilance',
    category: 'routine',
  },
  {
    id: 'K9',
    topic: 'Antenatal checkups and doctor visits',
    content:
      'Go to every recommended antenatal visit. Keep a small written list of your daily symptoms, questions, and kick observations to discuss with your obstetrician or midwife.',
    sourceName: 'Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
    category: 'routine',
  },
  {
    id: 'K10',
    topic: 'Maternal mood, worry and anxiety',
    content:
      'Feeling worry, emotional shifts, or fatigue is common. Talk to your partner or family, take quiet rest, do light movement, and practice slow, deep breathing exercises. If sadness or intense fear lasts more than two weeks, or if you ever have thoughts of harm, speak to your doctor or a healthcare counsellor soon.',
    sourceName: 'WHO Maternal Mental Health Guidelines',
    category: 'wellness',
  },
];

export function getKnowledgeNoteById(id: string): KnowledgeNote | undefined {
  return KNOWLEDGE_NOTES.find((n) => n.id.toUpperCase() === id.toUpperCase());
}

export function formatKnowledgeForPrompt(): string {
  return KNOWLEDGE_NOTES.map(
    (n) => `[${n.id}] Topic: ${n.topic}\nGuidance: ${n.content}\nSource: ${n.sourceName}`
  ).join('\n\n');
}
