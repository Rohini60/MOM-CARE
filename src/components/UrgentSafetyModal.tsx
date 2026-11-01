import React from 'react';
import { Phone, X, ShieldAlert, Users, Stethoscope, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../translations';

interface UrgentSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
  symptomName?: string;
  emergencyReason?: string;
  doctorName?: string;
  doctorPhone?: string;
  clinicName?: string;
  emergencyContact?: string;
  familyContactName?: string;
  familyContactPhone?: string;
}

export const UrgentSafetyModal: React.FC<UrgentSafetyModalProps> = ({
  isOpen,
  onClose,
  symptomName,
  emergencyReason,
  doctorName,
  doctorPhone,
  clinicName,
  emergencyContact,
  familyContactName,
  familyContactPhone,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const displayFamilyName = familyContactName || 'Family Member';
  const effectiveFamilyPhone = familyContactPhone || '';

  const handleCall108 = () => {
    window.location.href = 'tel:108';
  };

  const handleCallFamily = () => {
    if (effectiveFamilyPhone) {
      window.location.href = `tel:${effectiveFamilyPhone}`;
    } else {
      window.location.href = 'tel:108';
    }
  };

  const handleCallDoctor = () => {
    if (doctorPhone) {
      window.location.href = `tel:${doctorPhone}`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-dialog-title"
      aria-describedby="emergency-dialog-desc"
    >
      <div className="w-full max-w-lg bg-[#FFFFFF] rounded-3xl p-6 sm:p-7 border-4 border-[#FF003C] shadow-[0_0_40px_rgba(255,0,60,0.45)] space-y-4 relative overflow-hidden text-[#1E1218]">
        {/* Urgent Red Top Accent Bar with pulsing warning */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#FF003C] via-[#FF5252] to-[#FF003C] animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE5EA] border-2 border-[#FF003C] text-[#FF003C] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,0,60,0.3)] animate-pulse">
              <ShieldAlert className="w-7 h-7 stroke-[2.4]" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#FF003C] text-white inline-block shadow-xs">
                🔴 {t.redEmergencyTitle}
              </span>
              <p className="text-xs text-[#8A4A57] font-semibold mt-0.5">
                Immediate Clinical Assistance Protocol
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[#7D6E74] hover:bg-[#FFE5EA] hover:text-[#FF003C] transition-colors cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Prompt Box: Ask whether to call Family Members or 108, Yes or No */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF0F3] border-2 border-[#FF003C]/40 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-[#FF003C] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 id="emergency-dialog-title" className="font-extrabold text-[#C6002A] text-sm sm:text-base leading-snug">
                {t.emergencyCallQuestion}
              </h3>
              <p id="emergency-dialog-desc" className="text-xs text-[#522932] leading-relaxed">
                {t.redEmergencyMessage}
              </p>
            </div>
          </div>

          {(symptomName || emergencyReason) && (
            <div className="p-2.5 rounded-xl bg-white border border-[#FFCCD5] text-xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E3A4B] block">
                Trigger Sign / Symptom:
              </span>
              <p className="font-bold text-[#C6002A]">
                {symptomName || emergencyReason}
              </p>
            </div>
          )}
        </div>

        {/* Action Choice Buttons: Yes to Call 108, Yes to Call Family, or No */}
        <div className="space-y-2.5 pt-1">
          {/* Option 1: YES, Call 108 Ambulance */}
          <button
            type="button"
            onClick={handleCall108}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF003C] via-[#E00034] to-[#C4002D] hover:from-[#FF1A4D] hover:to-[#D40030] text-white font-extrabold text-sm text-left transition-all shadow-[0_0_20px_rgba(255,0,60,0.5)] flex items-center justify-between gap-3 active:scale-98 border border-white/30 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 fill-current animate-pulse text-white" />
              </div>
              <div>
                <span className="block text-sm leading-tight font-mono">{t.emergencyYesCall108}</span>
                <span className="text-[11px] text-white/80 font-normal">Free 24/7 Government Emergency Response</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/25 border border-white/30 shrink-0">
              CALL 108
            </span>
          </button>

          {/* Option 2: YES, Call Family Members */}
          <button
            type="button"
            onClick={handleCallFamily}
            className="w-full py-3 px-4 rounded-2xl bg-[#FFFFFF] border-2 border-[#9F5F6E] hover:bg-[#FFF5F7] text-[#352F35] font-bold text-sm text-left transition-all shadow-xs flex items-center justify-between gap-3 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FDE8ED] text-[#9F5F6E] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs sm:text-sm font-extrabold text-[#7D3445] truncate">
                  {t.emergencyYesCallFamily}
                </span>
                <span className="text-[11px] text-[#766D72] truncate block font-mono">
                  {effectiveFamilyPhone ? `${displayFamilyName}: ${effectiveFamilyPhone}` : 'No family phone saved — will route to 108'}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-[#FDE8ED] text-[#7D3445] border border-[#9F5F6E]/30 shrink-0">
              CALL FAMILY
            </span>
          </button>

          {/* Option 3: Doctor Call (if configured) */}
          {doctorPhone && (
            <button
              type="button"
              onClick={handleCallDoctor}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F8F4F5] border border-[#E9DFDC] hover:bg-[#F2E1E3] text-[#352F35] font-semibold text-xs text-left transition-all flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Stethoscope className="w-4 h-4 text-[#9F5F6E] shrink-0" />
                <span className="truncate">
                  {t.callDoctorBtn} {doctorName ? `(${doctorName})` : ''}: {doctorPhone}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#9F5F6E] shrink-0">
                CALL DOCTOR
              </span>
            </button>
          )}

          {/* Option 4: NO, Not Right Now */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-[#D5C2C6] text-[#766D72] hover:text-[#352F35] hover:bg-[#F5ECEF] text-xs font-bold transition-all mt-1 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{t.emergencyNoNotNow}</span>
          </button>
        </div>

        {/* Footer Clinical Disclaimer */}
        <p className="text-[10px] text-[#8C7A81] text-center pt-1 border-t border-[#F2E6E9]">
          {t.disclaimerText}
        </p>
      </div>
    </div>
  );
};
