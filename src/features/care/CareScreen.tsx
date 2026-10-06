import React, { useState } from 'react';
import {
  CalendarCheck2,
  Plus,
  CheckCircle2,
  Clock,
  Pill,
  Droplet,
  Heart,
  Calendar,
  AlertCircle,
  Bell,
  Trash2,
  MapPin,
  User,
} from 'lucide-react';
import type { UserProfile, CareTask, Appointment, Medication } from '../../types';
import {
  saveCareTask,
  toggleCareTask,
  saveAppointment,
  deleteAppointment,
  saveMedication,
  deleteMedication,
} from '../../services/firebase/careService';

interface CareScreenProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  careTasks: CareTask[];
  appointments: Appointment[];
  medications: Medication[];
  onDataUpdated: () => void;
  onOpenAiChat: (prompt?: string) => void;
}

export const CareScreen: React.FC<CareScreenProps> = ({
  profile,
  pregnancyWeek,
  careTasks,
  appointments,
  medications,
  onDataUpdated,
  onOpenAiChat,
}) => {
  // Modal states
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // New Appointment state
  const [apptTitle, setApptTitle] = useState('');
  const [apptDoctor, setApptDoctor] = useState(profile?.doctorName || '');
  const [apptClinic, setApptClinic] = useState(profile?.clinicName || '');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('10:00 AM');
  const [apptNotes, setApptNotes] = useState('');

  // New Medication state
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1 capsule');
  const [medFreq, setMedFreq] = useState('Once daily');
  const [medTime, setMedTime] = useState('08:00 AM');

  // New Care Task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<'wellness' | 'medical' | 'hydration' | 'movement' | 'mental'>('wellness');

  const handleToggleTask = async (task: CareTask) => {
    if (!profile) return;
    try {
      await toggleCareTask(profile.id, task.id, !task.completed);
      onDataUpdated();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !taskTitle.trim()) return;
    try {
      const newTask: CareTask = {
        id: `tsk_${Date.now()}`,
        userId: profile.id,
        title: taskTitle.trim(),
        category: taskCategory,
        completed: false,
      };
      await saveCareTask(newTask);
      setTaskTitle('');
      setShowAddTask(false);
      onDataUpdated();
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const handleCreateAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !apptTitle.trim() || !apptDate) return;
    try {
      const newAppt: Appointment = {
        id: `apt_${Date.now()}`,
        userId: profile.id,
        title: apptTitle.trim(),
        doctor: apptDoctor.trim() || undefined,
        clinic: apptClinic.trim() || undefined,
        date: apptDate,
        time: apptTime,
        notes: apptNotes.trim() || undefined,
        completed: false,
      };
      await saveAppointment(newAppt);
      setApptTitle('');
      setApptDate('');
      setShowAddAppt(false);
      onDataUpdated();
    } catch (err) {
      console.error('Error creating appointment:', err);
    }
  };

  const handleDeleteAppt = async (id: string) => {
    if (!profile) return;
    try {
      await deleteAppointment(profile.id, id);
      onDataUpdated();
    } catch (err) {
      console.error('Error deleting appointment:', err);
    }
  };

  const handleCreateMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !medName.trim()) return;
    try {
      const newMed: Medication = {
        id: `med_${Date.now()}`,
        userId: profile.id,
        name: medName.trim(),
        dosage: medDosage.trim(),
        frequency: medFreq,
        reminderTime: medTime,
      };
      await saveMedication(newMed);
      setMedName('');
      setShowAddMed(false);
      onDataUpdated();
    } catch (err) {
      console.error('Error creating medication:', err);
    }
  };

  const handleDeleteMed = async (id: string) => {
    if (!profile) return;
    try {
      await deleteMedication(profile.id, id);
      onDataUpdated();
    } catch (err) {
      console.error('Error deleting medication:', err);
    }
  };

  const completedCount = careTasks.filter((t) => t.completed).length;
  const totalTasks = careTasks.length;

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* Header */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F2E1E3] flex items-center justify-center text-[#9F5F6E]">
            <CalendarCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg text-[#352F35]">Personalized Daily Care</h2>
            <p className="text-xs text-[#766D72]">Week {pregnancyWeek} habits, appointments & reminders</p>
          </div>
        </div>
      </div>

      {/* Today's Care Progress Card (Section 36: No fake health score!) */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm text-[#352F35]">Today’s Care Progress</h3>
          <span className="text-xs font-bold text-[#7FA58B]">
            {completedCount} of {totalTasks} Completed
          </span>
        </div>

        <div className="w-full bg-[#E9DFDC] h-2 rounded-full overflow-hidden mb-4">
          <div
            className="bg-[#7FA58B] h-full rounded-full transition-all duration-300"
            style={{ width: `${totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0}%` }}
          />
        </div>

        {/* Task list */}
        <div className="space-y-2">
          {careTasks.map((t) => (
            <div
              key={t.id}
              onClick={() => handleToggleTask(t)}
              className="flex items-center justify-between p-3 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] hover:border-[#C98291] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    t.completed ? 'bg-[#7FA58B] border-[#7FA58B] text-white' : 'bg-white border-[#E9DFDC]'
                  }`}
                >
                  {t.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-xs ${t.completed ? 'line-through text-[#766D72]' : 'font-semibold text-[#352F35]'}`}>
                  {t.title}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-[#E9DFDC] text-[#766D72] capitalize">
                {t.category}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAddTask(true)}
          className="w-full mt-3 py-2 rounded-xl border border-dashed border-[#C98291] text-[#9F5F6E] text-xs font-semibold hover:bg-[#F2E5E7] transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Care Task</span>
        </button>
      </div>

      {/* Prenatal Appointments Manager */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#F2E1E3] flex items-center justify-center text-[#9F5F6E]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#352F35]">Prenatal Appointments</h3>
              <p className="text-[11px] text-[#766D72]">{appointments.length} scheduled</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddAppt(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#9F5F6E] text-white text-xs font-semibold hover:bg-[#8C5361] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#766D72] space-y-1">
            <p>No upcoming prenatal visits recorded.</p>
            <p className="text-[11px]">Add your next obstetrician or midwife check-up to keep track.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="p-3 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#352F35]">{a.title}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EEF5F1] text-[#7FA58B]">
                      {a.date} {a.time ? `• ${a.time}` : ''}
                    </span>
                  </div>
                  {a.doctor && (
                    <div className="flex items-center gap-1 text-[11px] text-[#766D72]">
                      <User className="w-3 h-3" />
                      <span>{a.doctor}</span>
                      {a.clinic && <span>({a.clinic})</span>}
                    </div>
                  )}
                  {a.notes && <p className="text-[11px] text-[#352F35] pt-0.5">{a.notes}</p>}
                </div>
                <button
                  onClick={() => handleDeleteAppt(a.id)}
                  className="p-1 text-[#766D72] hover:text-[#C96B6B] transition-colors"
                  title="Remove appointment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User-entered Medications & Supplements (Section 8 & 21: Do not prescribe!) */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#EFEBF4] flex items-center justify-center text-[#7E699B]">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#352F35]">Supplements & Medications</h3>
              <p className="text-[11px] text-[#766D72]">User-entered reminders (non-prescriptive)</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddMed(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#9F5F6E] text-white text-xs font-semibold hover:bg-[#8C5361] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {medications.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#766D72] space-y-1">
            <p>No vitamins or medications recorded yet.</p>
            <p className="text-[11px]">Add your daily prenatal vitamins, iron, or supplements.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {medications.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-[#FCF8F6] border border-[#E9DFDC] flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-xs text-[#352F35]">{m.name}</h4>
                  <p className="text-[11px] text-[#766D72]">
                    {m.dosage} • {m.frequency} {m.reminderTime ? `(Remind at ${m.reminderTime})` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMed(m.id)}
                  className="p-1 text-[#766D72] hover:text-[#C96B6B] transition-colors"
                  title="Remove supplement"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Android Capacitor Notification Capability Notice (Section 22) */}
      <div className="p-3.5 rounded-2xl bg-[#FCF8F6] border border-[#E9DFDC] flex items-start gap-2.5 text-xs text-[#766D72]">
        <Bell className="w-4 h-4 text-[#9F5F6E] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#352F35]">Android Notification Ready: </strong>
          MomCare is structured with Capacitor local notification channels for timely hydration, appointment, and daily check-in reminders.
        </div>
      </div>

      {/* Modal: Add Appointment */}
      {showAddAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E9DFDC] shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-[#352F35]">Add Prenatal Appointment</h3>
            <form onSubmit={handleCreateAppt} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[#766D72] mb-1">Appointment Title</label>
                <input
                  type="text"
                  required
                  value={apptTitle}
                  onChange={(e) => setApptTitle(e.target.value)}
                  placeholder="e.g. 24-Week Routine Check & Fundal Height"
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#766D72] mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                    className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-2.5 py-1.5 text-xs text-[#352F35]"
                  />
                </div>
                <div>
                  <label className="block text-[#766D72] mb-1">Time</label>
                  <input
                    type="text"
                    value={apptTime}
                    onChange={(e) => setApptTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-2.5 py-1.5 text-xs text-[#352F35]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#766D72] mb-1">Doctor / Midwife</label>
                <input
                  type="text"
                  value={apptDoctor}
                  onChange={(e) => setApptDoctor(e.target.value)}
                  placeholder="Dr. Sarah Johnson"
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>
              <div>
                <label className="block text-[#766D72] mb-1">Clinic / Hospital</label>
                <input
                  type="text"
                  value={apptClinic}
                  onChange={(e) => setApptClinic(e.target.value)}
                  placeholder="Women's Health Pavilion"
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAppt(false)}
                  className="flex-1 py-2 rounded-xl border border-[#E9DFDC] text-[#766D72]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#9F5F6E] text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Medication */}
      {showAddMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E9DFDC] shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-[#352F35]">Add Vitamin or Supplement</h3>
            <form onSubmit={handleCreateMed} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[#766D72] mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Prenatal Multivitamin with Folic Acid"
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#766D72] mb-1">Dosage</label>
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="1 tablet"
                    className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-2.5 py-1.5 text-xs text-[#352F35]"
                  />
                </div>
                <div>
                  <label className="block text-[#766D72] mb-1">Frequency</label>
                  <select
                    value={medFreq}
                    onChange={(e) => setMedFreq(e.target.value)}
                    className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-2 py-1.5 text-xs text-[#352F35]"
                  >
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>With dinner</option>
                    <option>As needed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMed(false)}
                  className="flex-1 py-2 rounded-xl border border-[#E9DFDC] text-[#766D72]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#9F5F6E] text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E9DFDC] shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-[#352F35]">Add Daily Care Habit</h3>
            <form onSubmit={handleCreateTask} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[#766D72] mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. 15-min pelvic floor stretches"
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>
              <div>
                <label className="block text-[#766D72] mb-1">Category</label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value as any)}
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-2.5 py-1.5 text-xs text-[#352F35]"
                >
                  <option value="wellness">Wellness</option>
                  <option value="hydration">Hydration</option>
                  <option value="movement">Movement</option>
                  <option value="mental">Mental Peace</option>
                  <option value="medical">Medical</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 py-2 rounded-xl border border-[#E9DFDC] text-[#766D72]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#9F5F6E] text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
