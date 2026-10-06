import { PregnancyWeekData } from '../types';

export const PREGNANCY_WEEKS: Record<number, PregnancyWeekData> = {
  8: {
    week: 8,
    trimester: 1,
    fruitComparison: 'Raspberry',
    approxLength: '1.6 cm (0.6 in)',
    approxWeight: '1 gram (0.04 oz)',
    babyHighlights: [
      'Webbed fingers and toes are starting to differentiate',
      'Neural tube has closed and brain hemispheres are expanding',
      'Tiny heartbeat beats around 150-170 bpm',
      'Eyelid folds and tiny ear canals are forming',
    ],
    motherChanges: [
      'Morning nausea and heightened sensitivity to food aromas',
      'Uterus expanding to the size of a large orange',
      'Frequent urination due to increased blood volume and hCG',
      'Progesterone-induced fatigue and vivid dreams',
    ],
    careFocus: [
      'Stay hydrated with small sips of electrolyte water or ginger tea',
      'Take 400-800mcg folic acid prenatal vitamins daily',
      'Schedule your first formal prenatal intake appointment',
    ],
    doctorQuestions: [
      'When should I schedule my first dating ultrasound scan?',
      'Which prenatal genetic screenings (NIPT / carrier) are recommended?',
      'Are my current prescription medications and supplements safe?',
    ],
    sources: ['American College of Obstetricians and Gynecologists (ACOG)', 'NHS Maternity Services'],
  },
  12: {
    week: 12,
    trimester: 1,
    fruitComparison: 'Plum',
    approxLength: '5.4 cm (2.1 in)',
    approxWeight: '14 grams (0.5 oz)',
    babyHighlights: [
      'All major organ systems and limbs are fully formed',
      'Tiny fingernails and toenails are sprouting on digits',
      'Baby can curl fingers, suck thumbs, and make swallowing motions',
      'Kidneys begin producing amniotic fluid through urination',
    ],
    motherChanges: [
      'Placenta takes over primary progesterone production from corpus luteum',
      'Morning sickness often begins tapering down',
      'Uterus rises slightly above the pelvic bone',
      'Mild dizziness as blood pressure naturally relaxes',
    ],
    careFocus: [
      'First trimester screening or Nuchal Translucency (NT) ultrasound window',
      'Gentle pelvic tilts and low-impact walking routines',
      'Nutritious small frequent meals rich in folate and iron',
    ],
    doctorQuestions: [
      'How did my initial blood panel and antibody tests turn out?',
      'Can we listen to baby’s heartbeat with the Doppler today?',
      'Are my exercise routines (yoga, walking, swimming) good to continue?',
    ],
    sources: ['ACOG Guidelines', 'World Health Organization (WHO) Prenatal Recommendations'],
  },
  16: {
    week: 16,
    trimester: 2,
    fruitComparison: 'Avocado',
    approxLength: '11.6 cm (4.5 in)',
    approxWeight: '100 grams (3.5 oz)',
    babyHighlights: [
      'Baby’s eyes are sensitive to light filtered through the womb',
      'Tiny facial muscles can squint, frown, and grimace',
      'Bones are hardening (ossification) from soft cartilage',
      'Scalp patterning begins and heart pumps 25 quarts of blood daily',
    ],
    motherChanges: [
      'Welcome to the "golden second trimester" energy rebound!',
      'Round ligament stretching can cause brief sharp groin twinges',
      'Increased melanin may show as a faint linea nigra or melasma',
      'Occasional nasal congestion due to increased blood flow (pregnancy rhinitis)',
    ],
    careFocus: [
      'Support the round ligaments with gentle core posture and warm showers',
      'Focus on calcium (1000mg) and vitamin D3 intake for baby’s bone growth',
      'Plan your mid-pregnancy anatomy scan (usually weeks 18-22)',
    ],
    doctorQuestions: [
      'When is the optimal week to book my 20-week Anatomy Ultrasound?',
      'What are normal round ligament twinges versus signs to watch for?',
      'Should I do the maternal quad screen or AFP test?',
    ],
    sources: ['American College of Obstetricians and Gynecologists (ACOG)', 'Royal College of Obstetricians and Gynaecologists (RCOG)'],
  },
  20: {
    week: 20,
    trimester: 2,
    fruitComparison: 'Banana',
    approxLength: '25.6 cm (10 in) head-to-heel',
    approxWeight: '300 grams (10.6 oz)',
    babyHighlights: [
      'HALFWAY MILESTONE! Baby is covered in protective vernix caseosa',
      'Fine downy lanugo hair covers baby’s skin',
      'Hearing is functional — baby hears your heartbeat and voice',
      'Distinct sleep-wake cycles emerge with acrobatics and kicks',
    ],
    motherChanges: [
      'The top of your uterus (fundus) is now level with your navel',
      'You may feel the magical "quickening" (first fluttering baby kicks)',
      'Mild back discomfort as your center of gravity gently shifts',
      'Skin itching across belly as skin fibers stretch',
    ],
    careFocus: [
      'Celebrate reaching the 20-week midpoint!',
      'Undergo the detailed Mid-Pregnancy Anatomy Ultrasound scan',
      'Moisturize belly skin and sleep on your side with a support pillow',
    ],
    doctorQuestions: [
      'Did the anatomy scan confirm normal placental position (no previa)?',
      'How are baby’s heart chambers, kidneys, and spine looking on scan?',
      'What position should I sleep in as my bump grows larger?',
    ],
    sources: ['ACOG Mid-Trimester Evaluation', 'NHS Anomaly Scan Guide'],
  },
  24: {
    week: 24,
    trimester: 2,
    fruitComparison: 'Ear of Sweet Corn',
    approxLength: '30 cm (11.8 in)',
    approxWeight: '600 grams (1.3 lb)',
    babyHighlights: [
      'Viability milestone: baby’s lungs develop surfactant-producing alveolar cells',
      'Inner ear balance mechanisms are mature; baby senses orientation and motion',
      'Taste buds are working as baby swallows amniotic fluid',
      'Rapid Eye Movement (REM) sleep detected — baby is dreaming!',
    ],
    motherChanges: [
      'Stronger, distinct kicks, rolls, and maternal responsiveness',
      'Mild Braxton Hicks contractions (painless tightening of uterus)',
      'Dry or sensitive eyes due to water retention changes',
      'Occasional mild ankle puffiness after standing for long periods',
    ],
    careFocus: [
      'Glucose tolerance screening window approaches (weeks 24-28)',
      'Stay cool, elevate feet when sitting, and drink 8-10 glasses of water',
      'Begin daily bonding: talk, sing, or play soft music for your baby',
    ],
    doctorQuestions: [
      'When should I complete my 1-hour glucose challenge test?',
      'How can I distinguish routine Braxton Hicks from premature contractions?',
      'If my blood type is Rh-negative, when do I receive the RhoGAM shot?',
    ],
    sources: ['American College of Obstetricians and Gynecologists (ACOG)', 'CDC Pregnancy Health'],
  },
  28: {
    week: 28,
    trimester: 3,
    fruitComparison: 'Eggplant',
    approxLength: '37.6 cm (14.8 in)',
    approxWeight: '1.0 kg (2.2 lb)',
    babyHighlights: [
      'Welcome to the Third Trimester!',
      'Baby’s eyes open, blink, and turn toward bright lights outside',
      'Brain develops deep surface grooves and billions of neural connections',
      'Baby can have hiccups! (Rhythmic, tiny rhythmic tapping sensations)',
    ],
    motherChanges: [
      'Uterus is now about 3 inches above your belly button',
      'Mild shortness of breath as growing baby presses against the diaphragm',
      'Heartburn or acid reflux as stomach capacity is compressed',
      'Occasional restless legs or vivid dreams about labor',
    ],
    careFocus: [
      'Begin regular "fetal kick counts" — aim for 10 movements in under 2 hours',
      'Eat smaller, frequent meals and avoid lying flat immediately after eating',
      'Review your birth preferences and hospital bag checklist',
    ],
    doctorQuestions: [
      'What is your clinic’s protocol for monitoring fetal kick counts?',
      'What warning signs (headache, vision, severe swelling) should prompt an immediate call?',
      'Are there infant CPR or childbirth preparation classes recommended?',
    ],
    sources: ['ACOG Third Trimester Guidance', 'NHS Third Trimester Milestones'],
  },
  32: {
    week: 32,
    trimester: 3,
    fruitComparison: 'Jicama / Butternut Squash',
    approxLength: '42.4 cm (16.7 in)',
    approxWeight: '1.7 kg (3.75 lb)',
    babyHighlights: [
      'Baby is gaining about half a pound per week of healthy body fat',
      'Toenails are fully formed and baby practices breathing motions',
      'Most babies settle into a head-down (vertex) position for birth',
      'Bones are hardened, except skull bones which remain pliable for birth canal',
    ],
    motherChanges: [
      'Prenatal visits typically increase to every 2 weeks',
      'Pelvic pressure increases as baby settles lower into the pelvis',
      'Occasional colostrum (early milk) leakage from breasts',
      'Back fatigue due to curvature of lumbar spine (lordosis)',
    ],
    careFocus: [
      'Practice deep belly breathing and pelvic floor (Kegel) relaxation',
      'Ensure your nursery and infant car seat are installed and inspected',
      'Keep hydration high to reduce swelling and Braxton Hicks irritation',
    ],
    doctorQuestions: [
      'Is baby in a head-down cephalic position?',
      'When will we do the Group B Strep (GBS) swab test (usually weeks 35-37)?',
      'What should I bring to the labor and delivery triage ward?',
    ],
    sources: ['ACOG Fetal Position Guidelines', 'American Academy of Pediatrics (AAP)'],
  },
  36: {
    week: 36,
    trimester: 3,
    fruitComparison: 'Papaya / Romaine Lettuce',
    approxLength: '47.4 cm (18.6 in)',
    approxWeight: '2.6 kg (5.7 lb)',
    babyHighlights: [
      'Approaching early term! Immune system receives antibodies through the placenta',
      'Lanugo hair has mostly shed into the amniotic fluid',
      'Baby’s digestion and sucking reflexes are primed for breast or bottle milk',
      'Space is snug — movements feel more like strong rolls, pushes, and nudges',
    ],
    motherChanges: [
      'Weekly prenatal check-ups begin',
      '"Lightening" or baby dropping lower into pelvis, giving your lungs more room',
      'Increased pelvic floor pressure and more frequent restroom trips',
      'Cervix begins softening (ripening) in preparation for labor',
    ],
    careFocus: [
      'Pack your hospital go-bag with essentials, comfortable clothes, and documents',
      'Confirm pediatric provider choice for newborn check-ups',
      'Know the "5-1-1 rule" for labor contractions (contractions 5 min apart, 1 min long, for 1 hour)',
    ],
    doctorQuestions: [
      'What are the clinic’s after-hours triage phone numbers for labor?',
      'At what contraction frequency or milestone should I head to the hospital?',
      'What happens if my water breaks before regular contractions begin?',
    ],
    sources: ['ACOG Term Classification', 'NHS Preparing for Labor'],
  },
  40: {
    week: 40,
    trimester: 3,
    fruitComparison: 'Watermelon / Small Pumpkin',
    approxLength: '51.2 cm (20.2 in)',
    approxWeight: '3.4 kg (7.5 lb)',
    babyHighlights: [
      'FULL TERM! Baby is fully ready to meet you',
      'Firm grasp reflex, lungs ready to take that first miraculous breath',
      'Skull bones are unfused with soft fontanelles to navigate the birth canal',
      'Placenta continues nourishing baby until the very moment of cord clamping',
    ],
    motherChanges: [
      'Due date arrives! Remember only ~5% of babies arrive exactly on due date',
      'Loss of mucus plug or "bloody show" may indicate cervical dilation',
      'Nesting instinct or extreme tiredness',
      'Strong, rhythmic contractions that intensify and draw closer together',
    ],
    careFocus: [
      'Rest as much as possible, preserving emotional and physical stamina',
      'Stay nourished with light carbohydrates and keep drinking fluids',
      'Focus on calming partner/support team and breathing techniques',
    ],
    doctorQuestions: [
      'What is our plan if baby decides to stay cozy past 40 weeks?',
      'How frequently will we monitor baby with non-stress tests (NST) post-date?',
      'Are there gentle natural methods (walking, acupressure) recommended?',
    ],
    sources: ['ACOG Post-term Guidelines', 'WHO Intrapartum Care Guidelines'],
  },
};

// Interpolation helper for any week from 4 to 42
export function getPregnancyWeekData(week: number): PregnancyWeekData {
  const clampedWeek = Math.max(4, Math.min(42, Math.round(week)));
  if (PREGNANCY_WEEKS[clampedWeek]) {
    return PREGNANCY_WEEKS[clampedWeek];
  }

  // Find nearest known week
  const knownWeeks = Object.keys(PREGNANCY_WEEKS).map(Number).sort((a, b) => a - b);
  let closest = knownWeeks[0];
  for (const w of knownWeeks) {
    if (Math.abs(w - clampedWeek) < Math.abs(closest - clampedWeek)) {
      closest = w;
    }
  }

  const base = PREGNANCY_WEEKS[closest];
  const trimester = clampedWeek < 13 ? 1 : clampedWeek < 27 ? 2 : 3;

  return {
    ...base,
    week: clampedWeek,
    trimester,
  };
}
