import type {
  UserProfile,
  Checkin,
  SymptomRecord,
  CareTask,
  Appointment,
  Medication,
  MedicalReport,
} from '../types';

const STORAGE_KEY_PREFIX = 'momcare_demo_';

function getStored<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Storage read error for key:', key, e);
  }
  return defaultVal;
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage write error for key:', key, e);
  }
}

// Initial default profile for Maya at Week 24
export function getDefaultDemoProfile(): UserProfile {
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 112); // ~16 weeks remaining (Week 24 of 40)

  return {
    id: 'demo_maya_uid',
    email: 'maya@momcare.app',
    displayName: 'Maya',
    communityAnonymous: false,
    age: 29,
    dueDate: defaultDueDate.toISOString().split('T')[0],
    firstPregnancy: true,
    babyNickname: 'Little Peanut',
    medicalHistoryNotes: 'First trimester mild morning nausea, otherwise standard prenatal baseline.',
    allergies: 'None',
    doctorName: 'Dr. Sarah Johnson, OB/GYN',
    clinicName: 'Women’s Health Pavilion',
    emergencyContact: 'Partner: David (+1 555-0192)',
    saveAiHistory: true,
    onboardingCompleted: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getDemoProfile(): UserProfile {
  return getStored<UserProfile>('profile', getDefaultDemoProfile());
}

export function saveDemoProfile(prof: UserProfile): void {
  setStored('profile', prof);
}

// Initial realistic checkins for the past week
function getInitialCheckins(): Checkin[] {
  const checkins: Checkin[] = [];
  const daysAgo = [0, 1, 2, 3, 4, 5, 6];

  for (const d of daysAgo) {
    const date = new Date(Date.now() - d * 86400000);
    checkins.push({
      id: `demo_chk_${d}`,
      userId: 'demo_maya_uid',
      week: 24,
      mood: d % 2 === 0 ? 'good' : 'okay',
      energy: d === 1 ? 'low' : 'normal',
      sleep: d === 3 ? 'poor' : 'good',
      babyMovement: 'normal',
      discomfortLocations: d % 2 === 0 ? ['Lower back'] : [],
      painLevel: d % 2 === 0 ? 1 : 0,
      notes: d === 0 ? 'Felt baby kicking after breakfast!' : 'Restful evening with gentle stretches.',
      createdAt: date.toISOString(),
    });
  }
  return checkins;
}

export function getDemoCheckins(): Checkin[] {
  return getStored<Checkin[]>('checkins', getInitialCheckins());
}

export function saveDemoCheckin(checkin: Checkin): void {
  const list = getDemoCheckins();
  const index = list.findIndex(c => c.id === checkin.id);
  if (index >= 0) {
    list[index] = checkin;
  } else {
    list.unshift(checkin);
  }
  setStored('checkins', list);
}

// Initial realistic symptoms for pattern detection demo (e.g. 3 lower back pain entries)
function getInitialSymptoms(): SymptomRecord[] {
  const now = Date.now();
  return [
    {
      id: 'demo_sym_1',
      userId: 'demo_maya_uid',
      week: 24,
      symptomName: 'Mild Lower Back Pain',
      description: 'Noticed after 30-minute afternoon walk with work tote.',
      severity: 'mild',
      duration: '3 hours',
      location: 'Lower back',
      riskLevel: 'green',
      riskTitle: 'Routine Prenatal Postural Strain',
      aiSummary: 'Typical center-of-gravity shift at 24 weeks gestation.',
      whatToDoNow: 'Rest with warm compress and pelvic tilt stretches.',
      watchFor: 'Rhythmic cramping, fever, or pain radiating to abdomen.',
      whenToContact: 'If pain becomes severe, sharp, or accompanied by vaginal spotting.',
      createdAt: new Date(now - 86400000 * 1).toISOString(),
    },
    {
      id: 'demo_sym_2',
      userId: 'demo_maya_uid',
      week: 24,
      symptomName: 'Occasional Heartburn',
      description: 'Happened after dinner, relieved with sitting upright and water.',
      severity: 'mild',
      duration: '1 hour',
      location: 'Chest/upper abdomen',
      riskLevel: 'green',
      riskTitle: 'Progesterone-Induced Digestive Reflux',
      aiSummary: 'Hormonal relaxation of the lower esophageal sphincter.',
      whatToDoNow: 'Eat smaller frequent meals, avoid lying down immediately after eating.',
      watchFor: 'Inability to keep liquids down or severe epigastric pain.',
      whenToContact: 'If persistent throughout day despite dietary changes.',
      createdAt: new Date(now - 86400000 * 2).toISOString(),
    },
    {
      id: 'demo_sym_3',
      userId: 'demo_maya_uid',
      week: 24,
      symptomName: 'Mild Lower Back Pain',
      description: 'Back ache while sitting at desk during afternoon meetings.',
      severity: 'mild',
      duration: '2 hours',
      location: 'Lower back',
      riskLevel: 'green',
      riskTitle: 'Routine Lumbar Fatigue',
      aiSummary: 'Common lumbar tension during second trimester seated work.',
      whatToDoNow: 'Use an ergonomic lumbar support pillow and take walking breaks.',
      watchFor: 'Numbness or tingling down legs.',
      whenToContact: 'If unmanageable or disrupting sleep.',
      createdAt: new Date(now - 86400000 * 3).toISOString(),
    },
    {
      id: 'demo_sym_4',
      userId: 'demo_maya_uid',
      week: 24,
      symptomName: 'Mild Lower Back Pain',
      description: 'Lumbar tightness relieved by warm bath and pregnancy pillow support.',
      severity: 'moderate',
      duration: '4 hours',
      location: 'Lower back',
      riskLevel: 'yellow',
      riskTitle: 'Needs Attention: Persistent Lumbar Strain Pattern',
      aiSummary: 'Third episode of lower back discomfort logged in 7 days.',
      whatToDoNow: 'Schedule a check-in with Dr. Sarah Johnson at your 24w visit to discuss pelvic PT.',
      watchFor: 'Regular uterine tightenings or pressure.',
      whenToContact: 'Mention at upcoming prenatal visit or call nurse line if worsens.',
      createdAt: new Date(now - 86400000 * 5).toISOString(),
    },
  ];
}

export function getDemoSymptoms(): SymptomRecord[] {
  return getStored<SymptomRecord[]>('symptoms', getInitialSymptoms());
}

export function saveDemoSymptom(record: SymptomRecord): void {
  const list = getDemoSymptoms();
  list.unshift(record);
  setStored('symptoms', list);
}

// Initial care habits and checklist
function getInitialCareTasks(): CareTask[] {
  return [
    { id: 'ct_1', userId: 'demo_maya_uid', title: 'Take Daily Prenatal Vitamin + DHA', category: 'wellness', completed: true },
    { id: 'ct_2', userId: 'demo_maya_uid', title: 'Drink 8-10 glasses of water (Hydration)', category: 'hydration', completed: true },
    { id: 'ct_3', userId: 'demo_maya_uid', title: '15-Minute Gentle Pelvic Floor Stretch', category: 'movement', completed: false },
    { id: 'ct_4', userId: 'demo_maya_uid', title: '30-Second Maternal Check-in', category: 'wellness', completed: false },
    { id: 'ct_5', userId: 'demo_maya_uid', title: 'Count Baby Kick Movements (10 in 2 hrs)', category: 'wellness', completed: false },
  ];
}

export function getDemoCareTasks(): CareTask[] {
  return getStored<CareTask[]>('care_tasks', getInitialCareTasks());
}

export function saveDemoCareTask(task: CareTask): void {
  const list = getDemoCareTasks();
  const idx = list.findIndex(t => t.id === task.id);
  if (idx >= 0) {
    list[idx] = task;
  } else {
    list.push(task);
  }
  setStored('care_tasks', list);
}

export function toggleDemoCareTask(taskId: string, completed: boolean): void {
  const list = getDemoCareTasks();
  const task = list.find(t => t.id === taskId);
  if (task) {
    task.completed = completed;
    setStored('care_tasks', list);
  }
}

// Initial appointments
function getInitialAppointments(): Appointment[] {
  return [
    {
      id: 'app_1',
      userId: 'demo_maya_uid',
      title: '24-Week Glucose Screen & Prenatal Checkup',
      doctor: 'Dr. Sarah Johnson, OB/GYN',
      clinic: 'Women’s Health Pavilion - Suite 420',
      date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      time: '10:30 AM',
      notes: 'Fasting not required. Review baby movement and blood pressure.',
      completed: false,
    },
    {
      id: 'app_2',
      userId: 'demo_maya_uid',
      title: '28-Week Rh Antibody & Growth Assessment',
      doctor: 'Dr. Sarah Johnson, OB/GYN',
      clinic: 'Women’s Health Pavilion - Suite 420',
      date: new Date(Date.now() + 86400000 * 33).toISOString().split('T')[0],
      time: '02:00 PM',
      notes: 'Follow-up on fundal height and gestational diabetes panel.',
      completed: false,
    },
  ];
}

export function getDemoAppointments(): Appointment[] {
  return getStored<Appointment[]>('appointments', getInitialAppointments());
}

export function saveDemoAppointment(appt: Appointment): void {
  const list = getDemoAppointments();
  list.push(appt);
  setStored('appointments', list);
}

// Initial medications
function getInitialMedications(): Medication[] {
  return [
    {
      id: 'med_1',
      userId: 'demo_maya_uid',
      name: 'Prenatal Multivitamin with DHA & Folic Acid',
      dosage: '1 Softgel daily',
      frequency: 'With breakfast',
      reminderTime: '08:30 AM',
    },
    {
      id: 'med_2',
      userId: 'demo_maya_uid',
      name: 'Calcium Carbonate + Vitamin D3',
      dosage: '500mg / 400 IU',
      frequency: 'Evening with snack',
      reminderTime: '08:00 PM',
    },
  ];
}

export function getDemoMedications(): Medication[] {
  return getStored<Medication[]>('medications', getInitialMedications());
}

export function saveDemoMedication(med: Medication): void {
  const list = getDemoMedications();
  list.push(med);
  setStored('medications', list);
}

// Initial medical reports
function getInitialMedicalReports(): MedicalReport[] {
  return [
    {
      id: 'rep_1',
      userId: 'demo_maya_uid',
      reportName: '20-Week Level II Mid-Trimester Anatomy Scan',
      reportDate: new Date(Date.now() - 86400000 * 28).toISOString().split('T')[0],
      reportType: 'Ultrasound Scan',
      aiSummary: 'Normal complete fetal anatomy survey. Four chamber heart visualized, intact neural tube, normal amniotic fluid index AFI 14.2 cm.',
      plainLanguageExplanation: 'The 20-week anatomy scan checked baby’s brain, heart chambers, kidneys, stomach, and spine. Everything appeared healthy and growing right on schedule with normal fluid cushioning.',
      keyValues: [
        { metric: 'Amniotic Fluid Index (AFI)', value: '14.2 cm', interpretation: 'Normal reassuring fluid volume' },
        { metric: 'Estimated Fetal Weight (EFW)', value: '330 g (11.6 oz)', interpretation: 'Appropriate 54th percentile for gestational age' },
        { metric: 'Placenta Location', value: 'Fundal posterior', interpretation: 'Well clear of internal cervical os (>3.5 cm)' },
      ],
      questionsForDoctor: [
        'Do I need any follow-up growth scan in the third trimester?',
        'Are there specific signs of Braxton Hicks vs standard sensations?',
      ],
      fileUrl: 'storage://users/demo_maya_uid/reports/anatomy_scan_20w.pdf',
      createdAt: new Date(Date.now() - 86400000 * 28).toISOString(),
    },
  ];
}

export function getDemoMedicalReports(): MedicalReport[] {
  return getStored<MedicalReport[]>('medical_reports', getInitialMedicalReports());
}

export function saveDemoMedicalReport(rep: MedicalReport): void {
  const list = getDemoMedicalReports();
  list.unshift(rep);
  setStored('medical_reports', list);
}

export function clearDemoData(): void {
  const keys = ['profile', 'checkins', 'symptoms', 'care_tasks', 'appointments', 'medications', 'medical_reports'];
  for (const k of keys) {
    localStorage.removeItem(STORAGE_KEY_PREFIX + k);
  }
}
