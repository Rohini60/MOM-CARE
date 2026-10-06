import type { UserProfile, Checkin, SymptomRecord, Medication, Appointment } from '../../types';

export interface RetrievedPatientContext {
  pregnancyWeek: number;
  dueDate?: string;
  firstPregnancy?: boolean;
  medicalHistoryNotes?: string;
  allergies?: string;
  medications: string[];
  recentCheckinsSummary: string;
  recentSymptomsSummary: string;
  upcomingAppointmentsSummary: string;
}

export function buildRelevantContext(params: {
  profile: UserProfile | null;
  currentWeek: number;
  recentCheckins: Checkin[];
  recentSymptoms: SymptomRecord[];
  medications: Medication[];
  appointments: Appointment[];
  queryText?: string;
}): RetrievedPatientContext {
  const { profile, currentWeek, recentCheckins, recentSymptoms, medications, appointments, queryText } = params;

  // Filter relevant symptoms: either recent (last 7 days) or matching query keyword
  const queryLower = (queryText || '').toLowerCase();
  const relevantSymptoms = recentSymptoms.filter(sym => {
    if (!queryLower) return true;
    const nameMatch = sym.symptomName.toLowerCase().includes(queryLower);
    const descMatch = (sym.description || '').toLowerCase().includes(queryLower);
    return nameMatch || descMatch;
  }).slice(0, 4);

  const symptomSummaryLines = relevantSymptoms.map(
    s => `- Week ${s.week} (${new Date(s.createdAt).toLocaleDateString()}): ${s.symptomName} (${s.severity}, triage: ${s.riskLevel.toUpperCase()})`
  );

  const checkinSummaryLines = recentCheckins.slice(0, 5).map(
    c => `- Week ${c.week}: Mood: ${c.mood}, Energy: ${c.energy}, Sleep: ${c.sleep}, Baby movement: ${c.babyMovement}${c.symptoms ? `, Symptoms: ${c.symptoms}` : ''}`
  );

  const medList = medications.map(m => `${m.name} (${m.dosage}, ${m.frequency})`);

  const upcomingAppts = appointments
    .filter(a => !a.completed)
    .slice(0, 2)
    .map(a => `${a.title} with ${a.doctor || 'Provider'} on ${a.date}`);

  return {
    pregnancyWeek: currentWeek,
    dueDate: profile?.dueDate,
    firstPregnancy: profile?.firstPregnancy,
    medicalHistoryNotes: profile?.medicalHistoryNotes || undefined,
    allergies: profile?.allergies || undefined,
    medications: medList,
    recentCheckinsSummary: checkinSummaryLines.join('\n') || 'No recent check-ins recorded.',
    recentSymptomsSummary: symptomSummaryLines.join('\n') || 'No recent matching symptoms recorded.',
    upcomingAppointmentsSummary: upcomingAppts.join(', ') || 'None scheduled.',
  };
}
